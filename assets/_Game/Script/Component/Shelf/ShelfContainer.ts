import { _decorator, Component, Node, tween, Vec3, Tween, TweenSystem } from 'cc';
import { ShelfSlot } from './ShelfSlot';
import { Item, ItemType } from '../Object/Item';
import { EventListener } from '../../GameEvent/EventListener';
import { GameEvent } from '../../GameEvent/GameEvent';
const { ccclass, property } = _decorator;

@ccclass( 'ShelfContainer' )
export class ShelfContainer extends Component
{
    @property( { type: [ ShelfSlot ] } )
    public shelfSlots: ShelfSlot[];

    static instance: ShelfContainer = null;

    protected onLoad (): void
    {
        ShelfContainer.instance = this;
        //EventListener.on( GameEvent.NewItemOnShelf, this.addItemOnShelf, this );
    }

    protected onDestroy (): void
    {
       // EventListener.off( GameEvent.NewItemOnShelf, this.addItemOnShelf, this );
    }

    protected start (): void
    {
        this.init();
    }

    init (): void
    {
        this.shelfSlots = this.node.getComponentsInChildren( ShelfSlot );
    }

    getFreeSlot (): ShelfSlot
    {
        for ( const slot of this.shelfSlots )
        {
            if ( !slot.linkItem )
            {
                return slot;
            }
        }
        return null;
    }

    /**
     * Đếm số lượng item hiện có trên shelf
     */
    getItemCount (): number
    {
        let count = 0;
        for ( const slot of this.shelfSlots )
        {
            if ( slot.linkItem )
            {
                count++;
            }
        }
        return count;
    }

    addItemOnShelf ( item: Item ): void
    {
        // Sau khi thêm item mới vào kệ, kiểm tra xem có match 3 hay không
    }

    getMatchSlot ( item: Item ): ShelfSlot
    {
        // Nếu không có item nào trên kệ, trả về slot đầu tiên
        if ( this.getItemCount() === 0 )
        {
            const freeSlot = this.getFreeSlot();
            if ( freeSlot )
            {
                freeSlot.linkItem = item;
                return freeSlot;
            }
            return null;
        }

        // Tìm các slot có item cùng loại
        const sameTypeSlots: ShelfSlot[] = [];
        const slotTypeMap = new Map<number, ItemType>();

        // Xác định loại item ở từng slot và lưu vào map
        for ( let i = 0; i < this.shelfSlots.length; i++ )
        {
            const slot = this.shelfSlots[ i ];
            if ( slot.linkItem )
            {
                slotTypeMap.set( i, slot.linkItem.itemType );
                if ( slot.linkItem.itemType === item.itemType )
                {
                    sameTypeSlots.push( slot );
                }
            }
        }

        // Nếu không có item nào cùng loại, tìm slot trống đầu tiên
        if ( sameTypeSlots.length === 0 )
        {
            const freeSlot = this.getFreeSlot();
            if ( freeSlot )
            {
                freeSlot.linkItem = item;
                return freeSlot;
            }
            return null;
        }

        // Tìm vị trí cuối cùng của nhóm item cùng loại
        let lastSameTypeIndex = -1;
        for ( let i = 0; i < this.shelfSlots.length; i++ )
        {
            const slot = this.shelfSlots[ i ];
            if ( slot.linkItem && slot.linkItem.itemType === item.itemType )
            {
                lastSameTypeIndex = i;
            }
        }

        // Nếu slot sau lastSameTypeIndex trống, đặt item vào đó
        if ( lastSameTypeIndex + 1 < this.shelfSlots.length && !this.shelfSlots[ lastSameTypeIndex + 1 ].linkItem )
        {
            const targetSlot = this.shelfSlots[ lastSameTypeIndex + 1 ];
            targetSlot.linkItem = item;
            return targetSlot;
        }

        // Nếu slot sau lastSameTypeIndex đã có item, di chuyển các item tiếp theo
        if ( lastSameTypeIndex + 1 < this.shelfSlots.length )
        {
            // Tìm slot trống cuối cùng để xác định có đủ chỗ không
            let lastEmptyIndex = -1;
            for ( let i = this.shelfSlots.length - 1; i >= 0; i-- )
            {
                if ( !this.shelfSlots[ i ].linkItem )
                {
                    lastEmptyIndex = i;
                    break;
                }
            }

            // Nếu không có slot trống nào, không thể thêm item mới
            if ( lastEmptyIndex === -1 )
            {
                return null;
            }

            // Di chuyển các item từ lastSameTypeIndex + 1 đến lastEmptyIndex
            this.moveItemsRight( lastSameTypeIndex + 1, lastEmptyIndex );

            // Đặt item mới vào vị trí sau lastSameTypeIndex
            const targetSlot = this.shelfSlots[ lastSameTypeIndex + 1 ];
            targetSlot.linkItem = item;
            return targetSlot;
        }

        // Nếu không tìm được slot phù hợp, trả về slot trống đầu tiên
        const freeSlot = this.getFreeSlot();
        if ( freeSlot )
        {
            freeSlot.linkItem = item;
            return freeSlot;
        }

        return null;
    }

    /**
     * Di chuyển các item từ startIndex đến endIndex sang phải 1 vị trí
     * @param startIndex Vị trí bắt đầu
     * @param endIndex Vị trí kết thúc
     */
    private moveItemsRight ( startIndex: number, endIndex: number ): void
    {
        // Di chuyển từ phải qua trái để tránh ghi đè
        for ( let i = endIndex; i >= startIndex; i-- )
        {
            const currentSlot = this.shelfSlots[ i ];
            const nextSlot = this.shelfSlots[ i + 1 ];

            if ( currentSlot.linkItem )
            {
                // Thực hiện tween animation cho việc di chuyển
                const item = currentSlot.linkItem;
                const endPos = nextSlot.node.getWorldPosition();

                // Thiết lập liên kết mới
                nextSlot.linkItem = item;
                currentSlot.linkItem = null;

                // Animation di chuyển item
                tween( item.node )
                    .to( 0.3, { worldPosition: new Vec3( endPos.x, endPos.y, endPos.z ) }, { easing: 'bounceOut' } )
                    .start();
            }
        }
    }

    /**
     * Kiểm tra xem có 3 item cùng loại liên tiếp trên shelf hay không
     */
    public checkForMatches (): void
    {
        // Tạo mảng lưu trữ loại item tại mỗi slot
        const slotTypes: ( ItemType | null )[] = [];

        // Lấy thông tin loại item tại mỗi slot
        for ( let i = 0; i < this.shelfSlots.length; i++ )
        {
            const slot = this.shelfSlots[ i ];
            slotTypes.push( slot.linkItem ? slot.linkItem.itemType : null );
        }

        // Kiểm tra 3 item liên tiếp cùng loại
        for ( let i = 0; i < slotTypes.length - 2; i++ )
        {
            // Kiểm tra nếu 3 slot liên tiếp có cùng loại item không null
            if ( slotTypes[ i ] !== null &&
                slotTypes[ i ] === slotTypes[ i + 1 ] &&
                slotTypes[ i ] === slotTypes[ i + 2 ] )
            {

                // Tìm thấy 3 item cùng loại liên tiếp
                this.handleMatchedItems( i, i + 1, i + 2 );

                // Thoát vòng lặp sau khi xử lý trận đầu tiên
                // Có thể gọi lại checkForMatches sau để kiểm tra các match khác
                break;
            }
        }
    }

    /**
     * Xử lý khi có 3 item cùng loại liên tiếp
     * @param index1 Vị trí item thứ nhất
     * @param index2 Vị trí item giữa (đích đến của tween)
     * @param index3 Vị trí item thứ ba
     */
    private handleMatchedItems ( index1: number, index2: number, index3: number ): void
    {
        const slot1 = this.shelfSlots[ index1 ];
        const slot2 = this.shelfSlots[ index2 ]; // slot ở giữa, đích đến của tween
        const slot3 = this.shelfSlots[ index3 ];

        // Kiểm tra xem 3 slot có item không
        if ( !slot1.linkItem || !slot2.linkItem || !slot3.linkItem )
        {
            return;
        }

        // Lưu các item trước khi tween để xóa sau
        const item1 = slot1.linkItem;
        const item2 = slot2.linkItem;
        const item3 = slot3.linkItem;

        // Vị trí đích của tween là vị trí item giữa
        const targetPos = slot2.node.getWorldPosition();

        // Chạy các tween song song
        tween( item2.node ) // Để đảm bảo song song, bắt đầu từ item giữa
            .parallel(
                // Tween cho item1
                tween().target( item1.node )
                    .to( 0.3, { worldPosition: new Vec3( targetPos.x, targetPos.y, targetPos.z ) }, { easing: 'quartOut' } ),
                // Tween cho item3
                tween().target( item3.node )
                    .to( 0.3, { worldPosition: new Vec3( targetPos.x, targetPos.y, targetPos.z ) }, { easing: 'quartOut' } )
            )
            .call( () =>
            {
                // Sau khi cả hai tween hoàn thành, xóa cả 3 item
                this.removeMatchedItems( item1, item2, item3, index1, index2, index3 );
            } )
            .start();
    }

    /**
     * Xóa 3 item đã match và làm sạch các tham chiếu
     * @param item1 Item thứ nhất
     * @param item2 Item giữa
     * @param item3 Item thứ ba
     * @param index1 Vị trí item thứ nhất
     * @param index2 Vị trí item giữa
     * @param index3 Vị trí item thứ ba
     */
    private removeMatchedItems ( item1: Item, item2: Item, item3: Item, index1: number, index2: number, index3: number ): void
    {
        // Clear liên kết từ slots
        this.shelfSlots[ index1 ].linkItem = null;
        this.shelfSlots[ index2 ].linkItem = null;
        this.shelfSlots[ index3 ].linkItem = null;

        // Lấy loại item và phát sự kiện ItemMatched
        const itemType = item1.itemType; // Lấy type của item1 (cả 3 item cùng type)
        const matchCount = 3; // Số lượng item đã match
        EventListener.emit( GameEvent.ItemMatched, itemType, matchCount );

        // Hiệu ứng biến mất và xóa các node
        this.fadeOutAndDestroy( item1.node );
        this.fadeOutAndDestroy( item2.node );
        this.fadeOutAndDestroy( item3.node );

        // Di chuyển các item còn lại để lấp đầy các slot trống
        this.compactItems();

        // Kiểm tra xem có match khác không sau khi di chuyển
        // this.scheduleOnce( () =>
        // {
        //     this.checkForMatches();
        // }, 0.05 );
    }

    /**
     * Hiệu ứng fade out và xóa node
     */
    private fadeOutAndDestroy ( node: Node ): void
    {
        tween( node )
            .to( 0.3, { scale: new Vec3( 0, 0, 0 ) }, { easing: 'backIn' } )
            .call( () =>
            {
                node.destroy();
            } )
            .start();
    }

    /**
     * Di chuyển các item để lấp đầy các slot trống sau khi match
     */
    private compactItems (): void
    {
        // Mảng lưu các item còn lại theo thứ tự hiện tại
        const remainingItems: Item[] = [];

        // Thu thập tất cả item còn lại trên shelf theo thứ tự hiện tại
        for ( const slot of this.shelfSlots )
        {
            if ( slot.linkItem )
            {
                remainingItems.push( slot.linkItem );
                slot.linkItem = null; // Xóa liên kết cũ
            }
        }

        console.log( '[DEBUG] Số item còn lại sau match:', remainingItems.length );

        // Lấp đầy các slot từ trái qua phải với các item còn lại
        for ( let i = 0; i < remainingItems.length; i++ )
        {
            let item = remainingItems[ i ];
            let slotIndex = i; // Lưu trữ index để tránh closure issue
            let slot = this.shelfSlots[ slotIndex ];

            // Thiết lập liên kết mới và đảm bảo nó không bị thay đổi 
            slot.linkItem = item;

            // Lưu trữ reference của item để kiểm tra sau này
            let savedItem = item;

            console.log( `[DEBUG] Trước tween - Slot ${ slotIndex } đã gán item ${ savedItem.uuid }, count=${ this.getItemCount() }` );

            // Di chuyển item đến vị trí mới
            let targetPos = slot.node.getWorldPosition();

            // Tạo và bắt đầu tween
            tween( item.node )
                .to( 0.3, { worldPosition: new Vec3( targetPos.x, targetPos.y, targetPos.z ) }, { easing: 'bounceOut' } )
                .call( () =>
                {
                    // Kiểm tra xem linkItem có còn không và tại sao
                    console.log( `[DEBUG] Sau tween - Slot ${ slotIndex } có item: ${ slot.linkItem ? 'có' : 'không' }` );
                    if ( !slot.linkItem )
                    {
                        console.log( `[DEBUG] Item đã biến mất! Item node exists: ${ !savedItem.node.isValid ? 'không' : 'có' }` );
                        // Thử gán lại nếu item vẫn tồn tại
                        if ( savedItem && savedItem.node && savedItem.node.isValid )
                        {
                            console.log( `[DEBUG] Đang thử gán lại item cho slot ${ slotIndex }` );
                            //slot.linkItem = savedItem;
                        }
                    }

                    if ( i === remainingItems.length - 1 )
                    {
                        console.log( `[DEBUG] Hoàn thành tween cuối cùng, count=${ this.getItemCount() }` );
                        // this.checkForMatches();
                    }
                } )
                .start();
        }
    }

}
