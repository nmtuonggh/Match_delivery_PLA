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
    public getSlotAndCheckMatch ( item: Item ): { index: number, canMatched: boolean }
    {
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
            result.index = this.currentItemCount - 1;
        }
        return result;
    }

    public onGetNewItem ( item: Item , index: number , canMatched: boolean ): void
    {
    
        let checkMatchedIndex = index;
        this.currentItemCount++;

        if ( checkMatchedIndex === 0 )
        {
            this.listPickedItem.push( item );
        }
        else
        {
            //chèn item vào vị trí đúng
            this.listPickedItem.splice( checkMatchedIndex, 0, item );
        }

        // Sort item trước khi check match
        this.sortItemOnShelf().then(() => {
            // Sau khi sort xong, kiểm tra match nếu có thể
            if (canMatched) {
                this.checkAndDestroyMatched(checkMatchedIndex);
            }
        });
    }

    

    //#endregion

    //#region Private methods
    private isSameItemType ( item: Item, slot: ShelfSlot ): boolean
    {
        let index = this.listShelfSlots.indexOf( slot );
        if ( !this.listPickedItem[ index ] )
        {
            return false;
        }
        return item.itemType === this.listPickedItem[ index ].itemType;
    }
    private async sortItemOnShelf (): Promise<void>
    {
        for ( let i = this.currentItemCount - 1; i >= 0; i-- )
        {
            let item = this.listPickedItem[ i ];
            await item.sortItem( i );
        }
    }

    private async checkAndDestroyMatched(itemIndex: number): Promise<void> {
        if (itemIndex < 0 || itemIndex >= this.listPickedItem.length || this.listPickedItem.length < 3) {
            return;
        }
        this.isMatching = true;

        const currentItemType = this.listPickedItem[itemIndex].itemType;
        
        // Kiểm tra 3 item liên tiếp có cùng loại
        // Theo yêu cầu, chúng ta match với 2 item phía trước
        if (itemIndex >= 2 && 
            this.listPickedItem[itemIndex-1]?.itemType === currentItemType &&
            this.listPickedItem[itemIndex-2]?.itemType === currentItemType) {
            
            // Lấy 3 item cần destroy
            const itemsToDestroy = [
                this.listPickedItem[itemIndex-2],
                this.listPickedItem[itemIndex-1],
                this.listPickedItem[itemIndex]
            ];
            
            // Xóa khỏi danh sách
            this.listPickedItem.splice(itemIndex-2, 3);
            this.currentItemCount -= 3;
            
            // Animation destroy
            await this.destroyMatchedItems(itemsToDestroy);
            
            // Sort lại sau khi destroy
            await this.sortItemOnShelf();
        }
        
        // Reset cờ match
        this.isMatching = false;
    }
    
    /**
     * Xử lý việc destroy các item đã match
     * @param items danh sách item cần destroy
     */
    private async destroyMatchedItems(items: Item[]): Promise<void> {
        // Tạo promise để đảm bảo tất cả animation hoàn thành trước khi tiếp tục
        const destroyPromises = items.map(item => {
            return new Promise<void>((resolve) => {
                // Hiệu ứng scale xuống 0 trước khi destroy
                tween(item.node)
                    .to(0.3, { scale: new Vec3(0, 0, 0) }, { easing: 'bounceIn' })
                    .call(() => {
                        item.node.destroy();
                        resolve();
                    })
                    .start();
            });
        });
        
        // Chờ tất cả animation hoàn thành
        await Promise.all(destroyPromises);
    }

    /**
     * Kiểm tra xem có đang trong quá trình match không
     */
    public isInMatching(): boolean {
        return this.isMatching;
    }

    //#endregion
}
