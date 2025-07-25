import { _decorator, Component, Node, tween, Vec3, Tween, TweenSystem, Prefab, instantiate, Canvas, UITransform, view, Camera, Vec2, director } from 'cc';
import { ShelfSlot } from './ShelfSlot';
import { Item } from '../Object/Item';
import { EventListener } from '../../GameEvent/EventListener';
import { GameEvent } from '../../GameEvent/GameEvent';
import { VariableConfig } from '../../Config/VariableConfig';
import { GameController } from '../../Manager/GameController';
import { AudioSystem } from '../../Audio/AudioSystem';
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
    public isMatching: boolean = false;
    public canCheckMatch: boolean = true;

    //#region Private fields
    private currentItemCount: number = 0;
    private listPickedItem: Item[] = [];
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
    public async checkSortItem ( canMatched: boolean, checkMatchedIndex: number, item: Item ): Promise<void>
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
            else if ( this.isFullSlot() )
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
        return item.itemType === this.listPickedItem[ index ].itemType;
    }
    //#endregion
    //#region SortItemOnShelf
    private async sortItemOnShelf (): Promise<void>
    {
        for ( let i = this.currentItemCount - 1; i >= 0; i-- )
        {
            console.log( this.listPickedItem );
            let item = this.listPickedItem[ i ];
            //await new Promise( resolve => setTimeout( resolve, VariableConfig.SORT_TIME * 0.5 ) );
            item.sortItem( i );
        }
    }
    //#endregion
    //#region SortItemAfterMatch
    private async sortItemAfterMatch (): Promise<void>
    {
        console.log( this.listPickedItem.length );
        for ( let i = 0; i < this.currentItemCount; i++ )
        {
            let item = this.listPickedItem[ i ];
            item.sortItem( i );
            await new Promise( resolve => setTimeout( resolve, 50 ) );
        }
    }
    //#endregion

    //#region CheckAndDestroyMatched
    private async checkAndDestroyMatched ( itemIndex: number ): Promise<void>
    {
        if ( itemIndex < 0 || itemIndex >= this.listPickedItem.length || this.listPickedItem.length < 3 )
        {
            return;
        }
        this.isMatching = true;

        const currentItemType = this.listPickedItem[ itemIndex ].itemType;

        if ( itemIndex >= 2 &&
            this.listPickedItem[ itemIndex - 1 ]?.itemType === currentItemType &&
            this.listPickedItem[ itemIndex - 2 ]?.itemType === currentItemType )
        {
            const itemsToDestroy = [
                this.listPickedItem[ itemIndex - 2 ],
                this.listPickedItem[ itemIndex - 1 ],
                this.listPickedItem[ itemIndex ]
            ];

            this.listPickedItem.splice( itemIndex - 2, 3 );
            this.currentItemCount -= 3;

            itemsToDestroy.forEach( item =>
            {
                Tween.stopAllByTarget(item.node);
            } );
            //stop all tween cho các slot tương ứng với 3 item cần destroy

            await this.destroyMatchedItems( itemsToDestroy );

            await this.sortItemAfterMatch();
        }

        this.isMatching = false;
    }
    //#endregion
    //#region DestroyMatchedItems
    /**
     * Xử lý việc destroy các item đã match
     * @param items danh sách item cần destroy
     */
    private async destroyMatchedItems ( items: Item[] ): Promise<void>
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

        if ( this.matchEffect && this.Camera )
        {
            const effectNode = instantiate( this.matchEffect );
            this.canvas.addChild( effectNode );
            const uiPos = new Vec3();
            this.Camera.convertToUINode( middlePos, this.canvas, uiPos );
            effectNode.setPosition( uiPos );
            this.scheduleOnce( () =>
            {
                effectNode.destroy();
            }, 1.0 );
        }

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

        EventListener.emit( GameEvent.ItemMatched, items[ 0 ].itemType, 3 );
        AudioSystem.instance.playMatchObj();
        await Promise.all( disappearPromises );
    }

    //#region IsInMatching
    public isInMatching (): boolean
    {
        return this.isMatching;
    }
    //#endregion

    //#region Bounce
    public async bounceSlotRender (boundcePower: number, index: number ): Promise<void>
    {
        let render = this.listShelfRender[ index ];
        let offsetBounce = boundcePower;
        let startPos = render.worldPosition.clone();
        let newPosition = new Vec3( startPos.x, startPos.y - offsetBounce, startPos.z );
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
