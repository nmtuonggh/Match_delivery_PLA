import { _decorator, Component, Node, tween, Quat, Vec3 } from 'cc';
import { ItemOder } from './ItemOder';
import { EventListener } from '../../GameEvent/EventListener';
import { GameEvent } from '../../GameEvent/GameEvent';
import { ItemType } from '../Object/Item';
import { GameController } from '../../Manager/GameController';
const { ccclass, property } = _decorator;

@ccclass( 'ItemOderController' )
export class ItemOderController extends Component
{
    @property( Node )
    itemOderNode: Node = null;
    @property( [ ItemOder ] )
    public listItemOders: ItemOder[] = [];

    // Map để lưu trữ số lượng cần thiết cho mỗi loại item
    private requiredItemsMap = new Map<ItemType, number>();
    // Map để theo dõi số lượng đã hoàn thành
    private completedItemsMap = new Map<ItemType, number>();
    // Singleton instance
    public static instance: ItemOderController = null;

    protected onLoad (): void
    {
        ItemOderController.instance = this;
        // Đăng ký lắng nghe sự kiện khi có item được match
        EventListener.on( GameEvent.ItemMatched, this.onItemMatched, this );
        EventListener.on( GameEvent.ItemOnShelf, this.onItemOnShelf, this );
    }

    protected onDestroy (): void
    {
        EventListener.off( GameEvent.ItemMatched, this.onItemMatched, this );
        EventListener.off( GameEvent.ItemOnShelf, this.onItemOnShelf, this );
    }

    protected start (): void
    {
        this.init();
        this.animInit();
    }

    protected update ( dt: number ): void
    {
        if ( this.isAllCompleted() && !GameController.instance.isWin )
        {
            GameController.instance.onDisableInput();
            GameController.instance.winGame();
        }
    }

    init (): void
    {
        this.listItemOders = this.itemOderNode.getComponentsInChildren( ItemOder );
        this.initRequiredItemsMap();
        this.resetCompletedItemsMap();
        this.updateItemOderUI();
    }

    animInit (): void
    {
        // Ẩn tất cả item oder trước
        for ( const itemOder of this.listItemOders )
        {
            itemOder.node.active = false;
        }

        // Hiển thị và tạo hiệu ứng xoay lần lượt cho từng item
        for ( let i = 0; i < this.listItemOders.length; i++ )
        {
            const itemOder = this.listItemOders[ i ];
            const delay = i * 0.05; // Độ trễ giữa các item, tăng dần theo thứ tự

            // Sau khi delay, hiển thị node và bắt đầu hiệu ứng
            this.scheduleOnce( () =>
            {
                itemOder.node.active = true;

                // Thiết lập rotation ban đầu (0 độ)
                const quat = new Quat();
                Quat.fromEuler( quat, 0, -90, 0 ); // Góc ban đầu
                itemOder.node.setRotation( quat );

                // Tạo hiệu ứng xoay 360 độ theo trục Y
                const endQuat = new Quat();
                Quat.fromEuler( endQuat, 0, 0, 0 ); // Góc kết thúc (0 độ)

                tween( itemOder.node )
                    .to( 0.5, { rotation: endQuat } ) // Xoay về góc 0 độ
                    .start();
            }, delay );
        }
    }

    // Khởi tạo map lưu trữ số lượng item cần thiết từ danh sách ItemOder
    private initRequiredItemsMap (): void
    {
        this.requiredItemsMap.clear();

        for ( const itemOder of this.listItemOders )
        {
            const itemType = itemOder.itemType;
            const count = itemOder.oderCount;

            this.requiredItemsMap.set( itemType, count );

            // Đảm bảo rằng node checkDone ban đầu bị ẩn
            itemOder.checkNode.active = false;
        }
    }

    // Reset map theo dõi số lượng đã hoàn thành
    private resetCompletedItemsMap (): void
    {
        this.completedItemsMap.clear();

        // Khởi tạo tất cả các giá trị là 0
        for ( const [ itemType, _ ] of this.requiredItemsMap )
        {
            this.completedItemsMap.set( itemType, 0 );
        }
    }

    // Xử lý khi nhận được sự kiện item đã match
    private onItemMatched ( itemType: ItemType, count: number ): void
    {
        // Kiểm tra xem loại item này có trong danh sách yêu cầu không
        if ( this.requiredItemsMap.has( itemType ) )
        {
            const requiredCount = this.requiredItemsMap.get( itemType );
            let completedCount = this.completedItemsMap.get( itemType ) || 0;

            // Cộng thêm số lượng item đã match
            completedCount += count;

            // Cập nhật lại giá trị trong map
            this.completedItemsMap.set( itemType, completedCount );

            // Kiểm tra xem đã hoàn thành đủ số lượng chưa
            if ( completedCount >= requiredCount )
            {
                this.markItemOrderComplete( itemType );
            }

            // Cập nhật UI
            this.updateItemOderUI();
        }
    }

    // Đánh dấu một ItemOder đã hoàn thành
    private markItemOrderComplete ( itemType: ItemType ): void
    {
        for ( const itemOder of this.listItemOders )
        {
            if ( itemOder.itemType === itemType )
            {
                itemOder.isCompleted = true;
                this.scheduleOnce( () =>
                {
                    tween( itemOder.node )
                        .to( 0.15, { scale: new Vec3( 0, 0, 0 ) }, { easing: 'smooth' } )
                        .start();
                }, 0.1 );
            }
        }
    }

    // Cập nhật UI của tất cả các ItemOder
    private updateItemOderUI (): void
    {
        for ( const itemOder of this.listItemOders )
        {
            const itemType = itemOder.itemType;
            const requiredCount = itemOder.oderCount;
            const completedCount = this.completedItemsMap.get( itemType ) || 0;

            // Cập nhật label hiển thị số lượng còn lại
            const remainingCount = Math.max( 0, requiredCount - completedCount );
            itemOder.oderCountLabel.string = remainingCount.toString();
        }
    }


    private onItemOnShelf ( itemType: ItemType ): void
    {
        for ( const itemOder of this.listItemOders )
        {
            if ( itemOder.itemType === itemType )
            {
                itemOder.onItemOnShelf();
            }
        }
    }

    isAllCompleted (): boolean
    {
        for ( const itemOder of this.listItemOders )
        {
            if ( !itemOder.isCompleted ) return false;
        }
        return true;
    }
}


