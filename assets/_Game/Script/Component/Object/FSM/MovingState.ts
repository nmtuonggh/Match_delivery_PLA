import { _decorator, Collider, Component, Node, tween, Vec3 } from 'cc';
import { IState } from './IState';
import { Item, ItemStateType } from '../Item';
import { ShelfContainer } from '../../Shelf/ShelfContainer';
import { BezierTweenWorld } from '../../../Tween/TweenExtension';
import { EventListener } from '../../../GameEvent/EventListener';
import { GameEvent } from '../../../GameEvent/GameEvent';
import { ShelfSlot } from '../../Shelf/ShelfSlot';
import { VariableConfig } from '../../../Config/VariableConfig';
import { PickObjHandler } from '../../../Interact/PickObjHandler';
const { ccclass, property } = _decorator;

@ccclass( 'MovingState' )
export class MovingState implements IState
{
    private readonly name: string = 'Moving';

    constructor () { }

    public enter ( item: Item ): void
    {
        PickObjHandler.instance.turnOffOutline(item.node);
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

        ShelfContainer.instance.onGetNewItem( item, item.currentShelfIndexSlot );
        //await
        ShelfContainer.instance.checkSortItem( slotIndex.canMatched, item.currentShelfIndexSlot );

        this.animationMove( item, slot );

        //Animation

    }

    public exit ( item: Item ): void
    {

    }

    public update ( item: Item, deltaTime: number ): void
    {
    }

    public getName (): string
    {
        return this.name;
    }

    public async animationMove ( item: Item, slot: ShelfSlot ): Promise<void>
    {
        let shelfScale = new Vec3( 0.75, 0.75, 0.75 );
        tween( item.node )
            .to( VariableConfig.ANIMATIONITEM_TIME, { scale: shelfScale }, { easing: 'bounceOut' } )
            .start()
        let startPos = item.node.getWorldPosition();
        let endPos = slot.node.getWorldPosition().clone();
        let midPoint = new Vec3();
        Vec3.lerp( midPoint, startPos, endPos, 0.5 );
        let direction = new Vec3();
        Vec3.subtract( direction, endPos, startPos );
        let offset = new Vec3( 0, 15, 0 );
        Vec3.normalize( direction, direction );
        Vec3.scaleAndAdd( offset, offset, direction, -2 );
        let bezierPos = new Vec3();
        Vec3.add( bezierPos, midPoint, offset );

        item.animationPromise = BezierTweenWorld( item.node, VariableConfig.ANIMATIONITEM_TIME, startPos, bezierPos, endPos );
        ShelfContainer.instance.listAnimationPromise.push( item.animationPromise );
        item.animationPromise.then( () =>
        {
            //item.node.setParent(slot.node);
            item.bounceItem(1);
            ShelfContainer.instance.bounceSlotRender( 1, item.currentShelfIndexSlot );
            // tween(item.node)
            // .to(0.1, { worldPosition: slot.node.getWorldPosition().clone().add(new Vec3(0, -1, 0)) }, { easing: 'backInOut' })
            // .to(0.1, { worldPosition: slot.node.getWorldPosition() }, { easing: 'backInOut' })
            // .start();
            item.onShelf();
            ShelfContainer.instance.listAnimationPromise.splice( ShelfContainer.instance.listAnimationPromise.indexOf( item.animationPromise ), 1 );
        } );

    }
}
