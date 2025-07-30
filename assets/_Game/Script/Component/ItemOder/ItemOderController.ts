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
        // Khởi tạo giá trị completedCount cho mỗi ItemOder
        for (const itemOder of this.listItemOders) {
            itemOder.completedCount = 0;
        }
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

    // Xử lý khi nhận được sự kiện item đã match
    private onItemMatched ( itemType: ItemType, count: number ): void
    {
        for (const itemOder of this.listItemOders) {
            // Chỉ xử lý nếu item type phù hợp
            if (itemOder.itemType === itemType) {
                // Sử dụng phương thức onItemMatched của ItemOder
                // Nếu vừa hoàn thành yêu cầu, tạo hiệu ứng thu nhỏ
                if (itemOder.onItemMatched(count)) {
                    this.scheduleOnce(() => {
                        tween(itemOder.node)
                            .to(0.15, { scale: new Vec3(0, 0, 0) }, { easing: 'smooth' })
                            .start();
                    }, 0.1);
                }
            }
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


