import { _decorator, Collider, Component, Node, tween, Vec3 } from 'cc';
import { IState } from './IState';
import { Item, ItemStateType } from '../Item';
import { ShelfContainer } from '../../Shelf/ShelfContainer';
import { BezierTweenWorld } from '../../../Tween/TweenExtension';
import { EventListener } from '../../../GameEvent/EventListener';
import { GameEvent } from '../../../GameEvent/GameEvent';
import { ShelfSlot } from '../../Shelf/ShelfSlot';
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
        let slotIndex = ShelfContainer.instance.getSlotAndCheckMatch( item );
        let index = slotIndex.index + 1;
        let slot = ShelfContainer.instance.listShelfSlots[ index ];
        item.currentShelfIndexSlot = index;
        this.animationMove( item, slot );
        ShelfContainer.instance.onGetNewItem( item, item.currentShelfIndexSlot );

        //Animation

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

    public animationMove ( item: Item, slot: ShelfSlot ): void
    {
        let shelfScale = new Vec3( 0.75, 0.75, 0.75 );
        tween( item.node )
            .to( 0.3, { scale: shelfScale }, { easing: 'bounceOut' } )
            .start()
        let startPos = item.node.getWorldPosition();
        let endPos = slot.node.getWorldPosition();
        let midPoint = new Vec3();
        Vec3.lerp( midPoint, startPos, endPos, 0.5 );
        let direction = new Vec3();
        Vec3.subtract( direction, endPos, startPos );
        let offset = new Vec3( 0, 15, 0 );
        Vec3.normalize( direction, direction );
        Vec3.scaleAndAdd( offset, offset, direction, -2 );
        let bezierPos = new Vec3();
        Vec3.add( bezierPos, midPoint, offset );

        BezierTweenWorld( item.node, 0.3, startPos, bezierPos, endPos ).then( () =>
        {
            item.onShelf();
        } );

    }
}
