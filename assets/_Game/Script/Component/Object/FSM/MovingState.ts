import { _decorator, Collider, Component, Node, tween, Vec3 } from 'cc';
import { IState } from './IState';
import { Item, ItemStateType } from '../Item';
import { ShelfContainer } from '../../Shelf/ShelfContainer';
import { BezierTweenWorld } from '../../../Tween/TweenExtension';
import { EventListener } from '../../../GameEvent/EventListener';
import { GameEvent } from '../../../GameEvent/GameEvent';
const { ccclass, property } = _decorator;

@ccclass( 'MovingState' )
export class MovingState implements IState
{
    private readonly name: string = 'Moving';

    constructor () { }

    public enter ( item: Item ): void
    {
        console.log( `${ item.node.name } đã vào trạng thái Moving` );
        //Physics
        item.rb.isKinematic = true;

        let listCollider = item.node.getComponents( Collider );
        listCollider.forEach( element =>
        {
            element.enabled = false;
        } );

        //Logic
        EventListener.emit( GameEvent.NewItemOnShelf, item );
        let slot = ShelfContainer.instance.getMatchSlot( item );
        ShelfContainer.instance.CheckGameLose();

        //Animation
        let shelfScale = new Vec3( 0.75, 0.75, 0.75 );
        tween( item.node )
            .to( 0.3, { scale: shelfScale }, { easing: 'bounceOut' } )
            .start()
        let startPos = item.node.getWorldPosition();
        let endPos = slot.node.getWorldPosition();
        
        // Tính trung điểm giữa startPos và endPos
        let midPoint = new Vec3();
        Vec3.lerp(midPoint, startPos, endPos, 0.5);
        
        // Tính vector có hướng từ startPos đến endPos
        let direction = new Vec3();
        Vec3.subtract(direction, endPos, startPos);
        
        // Tạo offset với chiều cao y=10 và lùi về phía startPos
        let offset = new Vec3(0, 15, 0);
        
        // Chuẩn hóa vector hướng
        Vec3.normalize(direction, direction);
        
        // Thay vì cộng thêm theo hướng endPos, trừ đi để lùi về phía startPos
        // Dùng -1 để lùi lại một khoảng (có thể điều chỉnh số này)
        Vec3.scaleAndAdd(offset, offset, direction, -2);
        
        // Tính điểm bezier bằng cách cộng offset vào trung điểm
        let bezierPos = new Vec3();
        Vec3.add(bezierPos, midPoint, offset);

        BezierTweenWorld( item.node, 0.3, startPos, bezierPos, endPos ).then( () =>
        {
            item.onShelf();
        } );

    }

    public exit ( item: Item ): void
    {
        console.log( `${ item.node.name } đã rời khỏi trạng thái Moving` );
    }

    public update ( item: Item, deltaTime: number ): void
    {
    }

    public getName (): string
    {
        return this.name;
    }
}
