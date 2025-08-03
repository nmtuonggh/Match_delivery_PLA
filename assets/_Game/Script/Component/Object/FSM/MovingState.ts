import { _decorator, Collider, Component, Node, Quat, Tween, tween, Vec3 } from 'cc';
import { IState } from './IState';
import { Item, ItemStateType } from '../Item';
import { ShelfContainer } from '../../Shelf/ShelfContainer';
import { BezierTweenWorld } from '../../../Tween/TweenExtension';
import { EventListener } from '../../../GameEvent/EventListener';
import { GameEvent } from '../../../GameEvent/GameEvent';
import { ShelfSlot } from '../../Shelf/ShelfSlot';
import { VariableConfig } from '../../../Config/VariableConfig';
import { PickObjHandler } from '../../../Interact/PickObjHandler';
import { GameFlowController } from '../../../Manager/GameFlowController';
import { GameController } from '../../../Manager/GameController';
const { ccclass, property } = _decorator;

@ccclass( 'MovingState' )
export class MovingState implements IState
{
    private readonly name: string = 'Moving';

    constructor () { }

    public enter ( item: Item ): void
    {
        let shelfContainer = ShelfContainer.instance;
        PickObjHandler.instance.turnOffOutline( item.node );
        //Physics
        item.rb.isKinematic = true;
        let listCollider = item.node.getComponents( Collider );
        listCollider.forEach( element =>
        {
            element.enabled = false;
        } );

        //Logic
        let slotIndexAndCheckMatch = shelfContainer.getSlotAndCheckMatch( item );
        let resultIndex = slotIndexAndCheckMatch.index;

        if ( slotIndexAndCheckMatch.canMatched )
        {
            shelfContainer.currentPickedActiveCount -= 2;
            item.isDead = true;
            shelfContainer.listPickedItem[ resultIndex ].isDead = true;
            shelfContainer.listPickedItem[ resultIndex - 1 ].isDead = true;
            //TODO: CheckWin here
        }
        else
        {
            shelfContainer.currentPickedActiveCount++;
            //console.log("Can't matched + " + shelfContainer.currentPickedActiveCount);
            //TODO: CheckLose here
            if ( shelfContainer.isFullSlot() )
            {
                GameController.instance.loseGame();
                return;   
            }
        }
        

        // if exist on bar -> insert behind it, else just stick it to bottom
        shelfContainer.currentPickedTotalCount += 1;
        let pickupIndex = resultIndex + 1;

        if ( resultIndex === - 1 )
        {
            shelfContainer.listPickedItem.push( item );
            pickupIndex = shelfContainer.currentPickedTotalCount - 1;
        }
        else
        {
            shelfContainer.listPickedItem.splice( pickupIndex, 0, item );
        }

        //call Animation to move item to slot
        //console.log("Pickup item at index " + pickupIndex);
        this.pickupItem( item, pickupIndex, shelfContainer.pickupNum,
            shelfContainer.getSlotPos( pickupIndex ) )
            .then( () =>
            {
                //TODO: Nhun
            } );
        shelfContainer.pickupNum++;

        shelfContainer.sortItemOnShelf();
        //TODO: Warning

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

    public async pickupItem ( item: Item, pickupIndex: number, pickupNum: number, pickupPos: Vec3 ): Promise<void>
    {
        item.PickupObj( pickupIndex, pickupNum );
        item.prePickupPos = item.node.getWorldPosition().clone();
        item.preRotation = item.node.getWorldRotation().clone();
        item.pickupIndexLogic = pickupIndex;
        item.pickupPos = pickupPos;

        Tween.stopAllByTarget( item.node );
        GameFlowController.instance.onStartPickup( item );

        let shelfScale = new Vec3( 0.75, 0.75, 0.75 );
        tween( item.node )
            .to( VariableConfig.PICKUP_TIME * 0.75, { scale: item.startScale.clone().multiplyScalar( 1.5 ) } )
            .to( VariableConfig.PICKUP_TIME * 0.25, { scale: shelfScale } )
            .start()

        let startPos = item.node.getWorldPosition();
        let endPos = item.pickupPos.clone();
        let midPoint = new Vec3();
        Vec3.lerp( midPoint, startPos, endPos, 0.5 );
        let direction = new Vec3();
        Vec3.subtract( direction, endPos, startPos );
        let offset = new Vec3( 0, 15, 0 );
        Vec3.normalize( direction, direction );
        Vec3.scaleAndAdd( offset, offset, direction, -2 );
        let bezierPos = new Vec3();
        Vec3.add( bezierPos, midPoint, offset );
        
        // Lưu tween reference để có thể cancel sau này
        const bezierResult = BezierTweenWorld( item.node, VariableConfig.PICKUP_TIME, startPos, bezierPos, endPos );
        item.pickupTween = bezierResult.tween;
        
        bezierResult.promise.then( () =>
        {
            //TODO: EFFECT
            item.pickupTween = null; // Clear reference khi hoàn thành
        } );
        //TODO : Rotate khi time tween nhay dc 1 nua

        tween( item.node )
            .to( VariableConfig.PICKUP_TIME, { eulerAngles: new Vec3( 0, 180, 0 ) } )
            .call( () =>
            {
                item.isFlying = false;
                item.wasPicked = true;
                item.node.worldPosition = item.pickupPos;
                ShelfContainer.instance.doneMoveCountCheck++;
                GameFlowController.instance.onComplete( item );
            } )
            .start();

    }
}
