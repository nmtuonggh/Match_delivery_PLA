import { _decorator, Component, Node, tween, Vec3, Tween, TweenSystem, Prefab, instantiate, Canvas, UITransform, view, Camera, Vec2, director } from 'cc';
import { ShelfSlot } from './ShelfSlot';
import { Item } from '../Object/Item';
import { EventListener } from '../../GameEvent/EventListener';
import { GameEvent } from '../../GameEvent/GameEvent';
import { VariableConfig } from '../../Config/VariableConfig';
import { GameController } from '../../Manager/GameController';
import { AudioSystem } from '../../Audio/AudioSystem';
import { ParticleSpawnManager } from '../../Manager/ParticleSpawnManager';
const { ccclass, property } = _decorator;

@ccclass( 'ShelfContainer' )
export class ShelfContainer extends Component
{
    //#region Editor fields
    @property( { type: [ ShelfSlot ] } )
    public listShelfSlots: ShelfSlot[] = [];
    @property( Node )
    public listShelfRender: Node[] = [];
    @property( Prefab )
    public matchEffect: Prefab = null;

    @property( Camera )
    public Camera: Camera = null;
    @property( Node )
    public canvas: Node = null;
    //#endregion

    static instance: ShelfContainer = null;
    public canCheckMatch: boolean = true;

    //#region Private fields
    private currentItemCount: number = 0;
    private listPickedItem: Item[] = [];
    private listShelfRenderStartPos: Vec3[] = [];
    //#endregion

    //#region CC Methods
    public onLoad (): void
    {
        ShelfContainer.instance = this;
        let slots = this.node.getComponentsInChildren( ShelfSlot );
        for ( let i = 0; i < slots.length; i++ )
        {
            if ( slots[ i ].node.active )
            {
                this.listShelfSlots.push( slots[ i ] );
            }
            this.listShelfRenderStartPos.push( this.listShelfRender[ i ].worldPosition.clone() );
        }
    }
    //#endregion

    //#region Public methods

    isFullSlot (): boolean
    {
        return this.currentItemCount >= this.listShelfSlots.length;
    }
    //#region GetSlotAndCheckMatch
    public getSlotAndCheckMatch ( item: Item ): { index: number, canMatched: boolean }
    {
        this.currentItemCount++;
        const result = { index: -1, canMatched: false };

        for ( let i = this.listShelfSlots.length - 1; i >= 0; i-- )
        {
            if ( !this.isSameItemType( item, this.listShelfSlots[ i ] ) )
            {
                continue;
            }
            result.canMatched = this.isSameItemType( item, this.listShelfSlots[ i - 1 ] );
            result.index = i;
            console.log(result.canMatched);
            break;
        }

        if ( result.index === -1 && this.listPickedItem.length > 0 )
        {
            result.index = this.currentItemCount - 2;
        }
        return result;
    }
    //#endregion

    //#region OnGetNewItem
    public onGetNewItem ( item: Item, index: number ): void
    {

        let checkMatchedIndex = index;

        if ( checkMatchedIndex === 0 )
        {
            this.listPickedItem.push( item );
        }
        else
        {
            //chèn item vào vị trí đúng
            this.listPickedItem.splice( checkMatchedIndex, 0, item );
        }


    }
    //#endregion

    public listAnimationPromise: Promise<void>[] = [];
    //#region CheckSortItem
    public async checkSortItem ( canMatched: boolean, checkMatchedIndex: number ): Promise<void>
    {
        await this.sortItemOnShelf().then( async () =>
        {
            //await item.animationPromise;
            if ( canMatched )
            {
                Promise.all( this.listAnimationPromise ).then( () =>
                {
                    this.checkAndDestroyMatched( checkMatchedIndex );
                    
                } );
            }
            else if ( this.isFullSlot() && !this.hasAnyPossibleMatch() )
            {
                GameController.instance.onDisableInput();
                this.scheduleOnce( () =>
                {
                    GameController.instance.loseGame();
                }, 0.5 );
            }
        } );
    }
    //#endregion

    //#region Private methods
    //#region IsSameItemType
    private isSameItemType ( item: Item, slot: ShelfSlot ): boolean
    {
        let index = this.listShelfSlots.indexOf( slot );
        if ( !this.listPickedItem[ index ] )
        {
            return false;
        }
        return item.itemType === this.listPickedItem[ index ].itemType && !this.listPickedItem[ index ].isMatching;
    }
    //#endregion
    //#region SortItemOnShelf
    private async sortItemOnShelf (): Promise<void>
    {
        // Tạo mảng promises để đợi tất cả animation sort hoàn thành
        const sortPromises: Promise<void>[] = [];
        
        for ( let i = this.currentItemCount - 1; i >= 0; i-- )
        {
            let item = this.listPickedItem[ i ];
            // Thêm promise vào mảng thay vì gọi trực tiếp
            sortPromises.push( item.sortItem( i ) );
        }
        
        // Đợi tất cả animation sort hoàn thành trước khi return
        await Promise.all( sortPromises );
    }
    //#endregion
    //#region SortItemAfterMatch
    private async sortItemAfterMatch (): Promise<void>
    {
        // Tạo mảng promises để đợi tất cả animation sort hoàn thành
        const sortPromises: Promise<void>[] = [];
        
        for ( let i = 0; i < this.currentItemCount; i++ )
        {
            let item = this.listPickedItem[ i ];
            // Thêm promise vào mảng thay vì gọi trực tiếp
            sortPromises.push( item.sortItem( i ) );
        }
        
        // Đợi tất cả animation sort hoàn thành trước khi return
        await Promise.all( sortPromises );
    }
    //#endregion

    //#region CheckAndDestroyMatched
    private async checkAndDestroyMatched ( itemIndex: number ): Promise<void>
    {
        if ( this.listPickedItem.length < 3 )
        {
            return;
        }
        // Tiếp tục kiểm tra và match cho đến khi không còn nhóm nào có thể match
        let hasMatched = false;
        do
        {
            hasMatched = await this.findAndDestroyNextMatch();
        } while ( hasMatched && this.listPickedItem.length >= 3 );
    }
    //#endregion

    //#region FindAndDestroyNextMatch
    /**
     * Tìm và xử lý nhóm match đầu tiên trong mảng
     * @returns true nếu tìm thấy và xử lý được 1 nhóm match, false nếu không
     */
    private async findAndDestroyNextMatch (): Promise<boolean>
    {
        // Duyệt từ cuối mảng lên đầu để tìm nhóm 3 item liên tiếp cùng loại
        for ( let i = this.listPickedItem.length - 3; i >= 0; i-- )
        {
            const currentItem = this.listPickedItem[ i ];
            const nextItem1 = this.listPickedItem[ i + 1 ];
            const nextItem2 = this.listPickedItem[ i + 2 ];

            // Bỏ qua nếu bất kỳ item nào đã được đánh dấu isMatching
            if ( currentItem?.isMatching || nextItem1?.isMatching || nextItem2?.isMatching )
            {
                continue;
            }

            const currentItemType = currentItem.itemType;

            // Kiểm tra 3 item liên tiếp có cùng loại không
            if ( nextItem1?.itemType === currentItemType &&
                nextItem2?.itemType === currentItemType )
            {
                const itemsToDestroy = [ currentItem, nextItem1, nextItem2 ];

                // Đánh dấu các item đang trong quá trình match NGAY LẬP TỨC
                itemsToDestroy.forEach( item =>
                {
                    item.isMatching = true;
                } );

                // Dừng tất cả tween của các item cần destroy
                itemsToDestroy.forEach( item =>
                {
                    Tween.stopAllByTarget( item.node );
                } );

                // Xử lý animation destroy và xóa khỏi mảng
                await this.destroyMatchedItems( itemsToDestroy, i + 2 );

                // Sắp xếp lại các item sau khi match
                await this.sortItemAfterMatch();

                return true; 
            }
        }

        return false; 
    }
    //#endregion

    //#region HasAnyPossibleMatch
    /**
     * Kiểm tra xem có bất kỳ nhóm 3 item liên tiếp cùng loại nào có thể match được không
     * @returns true nếu có ít nhất 1 nhóm có thể match, false nếu không
     */
    private hasAnyPossibleMatch(): boolean
    {
        // Kiểm tra từ cuối mảng lên đầu để tìm nhóm 3 item liên tiếp cùng loại
        for ( let i = this.listPickedItem.length - 3; i >= 0; i-- )
        {
            const currentItem = this.listPickedItem[ i ];
            const nextItem1 = this.listPickedItem[ i + 1 ];
            const nextItem2 = this.listPickedItem[ i + 2 ];

            // Bỏ qua nếu bất kỳ item nào đã được đánh dấu isMatching
            if ( currentItem?.isMatching || nextItem1?.isMatching || nextItem2?.isMatching )
            {
                continue;
            }

            const currentItemType = currentItem.itemType;

            // Kiểm tra 3 item liên tiếp có cùng loại không
            if ( nextItem1?.itemType === currentItemType &&
                nextItem2?.itemType === currentItemType )
            {
                return true; // Tìm thấy ít nhất 1 nhóm có thể match
            }
        }
        
        return false; // Không tìm thấy nhóm nào có thể match
    }
    //#endregion
    //#region DestroyMatchedItems
    /**
     * Xử lý việc destroy các item đã match
     * @param items danh sách item cần destroy
     */
    private async destroyMatchedItems ( items: Item[], itemIndex: number ): Promise<void>
    {
        if ( items.length !== 3 )
        {
            return;
        }

        const leftItem = items[ 0 ];
        const middleItem = items[ 1 ];
        const rightItem = items[ 2 ];

        const jumpPromises = items.map( item =>
        {
            return new Promise<void>( ( resolve ) =>
            {
                const startPos = item.node.worldPosition.clone();
                const jumpPos = new Vec3(
                    startPos.x,
                    startPos.y + 0.5,
                    startPos.z
                );

                tween( item.node )
                    .to( 0.2, { worldPosition: jumpPos }, { easing: 'bounceOut' } )
                    .call( () => resolve() )
                    .start();
            } );
        } );

        await Promise.all( jumpPromises );
        const middlePos = middleItem.node.worldPosition.clone();
        const moveToMiddlePromises = [
            new Promise<void>( ( resolve ) =>
            {
                tween( leftItem.node )
                    .to( 0.3, { worldPosition: middlePos }, { easing: 'quartInOut' } )
                    .call( () => resolve() )
                    .start();
            } ),
            new Promise<void>( ( resolve ) =>
            {
                tween( rightItem.node )
                    .to( 0.3, { worldPosition: middlePos }, { easing: 'quartInOut' } )
                    .call( () => resolve() )
                    .start();
            } )
        ];

        await Promise.all( moveToMiddlePromises );

        // if ( this.matchEffect && this.Camera )
        // {
        //     const effectNode = instantiate( this.matchEffect );
        //     this.canvas.addChild( effectNode );
        //     const uiPos = new Vec3();
        //     this.Camera.convertToUINode( middlePos, this.canvas, uiPos );
        //     effectNode.setPosition( uiPos );
        //     this.scheduleOnce( () =>
        //     {
        //         effectNode.destroy();
        //     }, 1.0 );
        // }

        ParticleSpawnManager.instance.spawn3DParticle( 0, middlePos );

        const disappearPromises = items.map( item =>
        {
            return new Promise<void>( ( resolve ) =>
            {
                tween( item.node )
                    .to( 0.2, { scale: new Vec3( 0, 0, 0 ) }, { easing: 'backIn' } )
                    .call( () =>
                    {
                        item.node.destroy();
                        resolve();
                    } )
                    .start();
            } );
        } );

        this.listPickedItem.splice( itemIndex - 2, 3 );
        this.currentItemCount -= 3;
        EventListener.emit( GameEvent.ItemMatched, items[ 0 ].itemType, 3 );
        AudioSystem.instance.playMatchObj();
        await Promise.all( disappearPromises );
    }

    //#region Bounce
    public async bounceSlotRender ( boundcePower: number, index: number ): Promise<void>
    {
        let render = this.listShelfRender[ index ];
        let offsetBounce = boundcePower;
        let startPos = this.listShelfRenderStartPos[ index ];
        let newPosition = new Vec3( startPos.clone().x, startPos.clone().y - offsetBounce, startPos.clone().z );
        if ( render )
        {
            tween( render )
                .to( 0.08, { worldPosition: newPosition }, { easing: 'sineIn' } )
                .to( 0.8, { worldPosition: startPos }, { easing: 'elasticOut' } )
                .start();
        }
    }
    //#endregion
}
