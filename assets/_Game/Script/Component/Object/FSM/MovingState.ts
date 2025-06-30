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
        EventListener.emit(GameEvent.NewItemOnShelf, item);
        let slot = ShelfContainer.instance.getMatchSlot(item);

        //Animation
        let shelfScale = new Vec3( 0.5, 0.5, 0.5 );
        tween( item.node )
            .to( 0.15, { scale: shelfScale }, { easing: 'bounceOut' } )
            .start()
        let startPos = item.node.getWorldPosition();
        let endPos = slot.node.getWorldPosition();
        let bezierPos = endPos.clone().add3f( 0, 0.8, -1 );

        BezierTweenWorld( item.node, 0.15, startPos, bezierPos, endPos ).then( () =>
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


