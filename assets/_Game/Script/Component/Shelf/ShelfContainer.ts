import { _decorator, Component, Node, tween, Vec3, Tween, TweenSystem } from 'cc';
import { ShelfSlot } from './ShelfSlot';
import { Item, ItemType } from '../Object/Item';
import { EventListener } from '../../GameEvent/EventListener';
import { GameEvent } from '../../GameEvent/GameEvent';
const { ccclass, property } = _decorator;

@ccclass( 'ShelfContainer' )
export class ShelfContainer extends Component
{
    //#region Editor fields
    @property( { type: [ ShelfSlot ] } )
    public listShelfSlots: ShelfSlot[] = [];
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

    //#region CheckSortItem
    public async checkSortItem ( canMatched: boolean, checkMatchedIndex: number, item: Item ): Promise<void>
    {
        await this.sortItemOnShelf().then( async () =>
        {
            //await item.animationPromise;
            if ( canMatched )
            {
                this.checkAndDestroyMatched( checkMatchedIndex );
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
            await item.sortItem( i );
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

        // Kiểm tra 3 item liên tiếp có cùng loại
        // Theo yêu cầu, chúng ta match với 2 item phía trước
        if ( itemIndex >= 2 &&
            this.listPickedItem[ itemIndex - 1 ]?.itemType === currentItemType &&
            this.listPickedItem[ itemIndex - 2 ]?.itemType === currentItemType )
        {

            // Lấy 3 item cần destroy
            const itemsToDestroy = [
                this.listPickedItem[ itemIndex - 2 ],
                this.listPickedItem[ itemIndex - 1 ],
                this.listPickedItem[ itemIndex ]
            ];

            // Xóa khỏi danh sách
            this.listPickedItem.splice( itemIndex - 2, 3 );
            this.currentItemCount -= 3;

            // Animation destroy
            await this.destroyMatchedItems( itemsToDestroy );

            // Sort lại sau khi destroy
            await this.sortItemAfterMatch();
        }

        // Reset cờ match
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

        // Lấy ra item ở giữa và hai item ở hai bên
        const leftItem = items[ 0 ];
        const middleItem = items[ 1 ];
        const rightItem = items[ 2 ];

        // 1. Tất cả các item nhảy lên trên một chút
        const jumpPromises = items.map( item =>
        {
            return new Promise<void>( ( resolve ) =>
            {
                const startPos = item.node.worldPosition.clone();
                const jumpPos = new Vec3(
                    startPos.x,
                    startPos.y + 0.5, // Nhảy lên 0.5 đơn vị
                    startPos.z
                );

                tween( item.node )
                    .to( 0.2, { worldPosition: jumpPos }, { easing: 'bounceOut' } )
                    .call( () => resolve() )
                    .start();
            } );
        } );

        // Chờ tất cả các item nhảy lên xong
        await Promise.all( jumpPromises );

        // 2. Hai item bên ngoài di chuyển vào vị trí của item giữa
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

        // Chờ hai item bên ngoài di chuyển xong
        await Promise.all( moveToMiddlePromises );

        // 3. Hiệu ứng mất đi (scale xuống 0 và tạo effect)
        const disappearPromises = items.map( item =>
        {
            return new Promise<void>( ( resolve ) =>
            {
                // Hiệu ứng scale xuống 0 trước khi destroy
                tween( item.node )
                    .to( 0.2, { scale: new Vec3( 0, 0, 0 ) }, { easing: 'backIn' } )
                    .call( () =>
                    {
                        // TODO: Có thể thêm hiệu ứng particle ở đây nếu cần
                        //item.node.destroy();
                        resolve();
                    } )
                    .start();
            } );
        } );

        // Chờ tất cả các item biến mất
        await Promise.all( disappearPromises );
    }

    /**
     * Kiểm tra xem có đang trong quá trình match không
     */
    public isInMatching (): boolean
    {
        return this.isMatching;
    }

    //#endregion
}
