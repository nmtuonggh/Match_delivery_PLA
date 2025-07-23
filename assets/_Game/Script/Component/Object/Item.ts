import { _decorator, Component, Enum, Node, RigidBody, tween, Vec3 } from 'cc';
import { IdleState } from './FSM/IdleState';
import { PickedState } from './FSM/PickedState';
import { MovingState } from './FSM/MovingState';
import { OnShelfState } from './FSM/OnShelfState';
import { StateMachine } from './FSM/StateMachine';
import { ShelfContainer } from '../Shelf/ShelfContainer';
import { BezierTweenWorld } from '../../Tween/TweenExtension';
const { ccclass, property } = _decorator;

/**
 * Enum định nghĩa các state có sẵn của Item
 */
export enum ItemStateType
{
    IDLE = 'Idle',
    PICKED = 'Picked',
    MOVING = 'Moving',
    ON_SHELF = 'OnShelf'
}

export enum ItemType
{
    Watermelon = 'Watermelon',
    Apple = 'Apple',
    Gio = 'Gio',
}

@ccclass( 'Item' )
export class Item extends Component
{
    //#region Editor Fields
    @property( { type: RigidBody } )
    public rb: RigidBody = null;
    @property( { type: Enum( ItemType ) } )
    public itemType: ItemType = ItemType.Watermelon;
    //#endregion
    //#region Public fields
    public currentShelfIndexSlot: number = -1;
    //public animationMoveDone: boolean = false;
    public animationPromise: Promise<void> | null = null;
    //#endregion

    //#region Private fields
    private stateMachine: StateMachine;
    private _isPickable: boolean = true;
    //#endregion

    //#region Property
    public get isPickable (): boolean
    {
        return this._isPickable;
    }

    public set isPickable ( value: boolean )
    {
        this._isPickable = value;
    }
    //#endregion


    start ()
    {
        this.initStateMachine();
    }

    private initStateMachine ()
    {
        // Tạo state machine
        this.stateMachine = new StateMachine( this );

        // Thêm các state
        this.stateMachine.addState( ItemStateType.IDLE, new IdleState() );
        this.stateMachine.addState( ItemStateType.PICKED, new PickedState() );
        this.stateMachine.addState( ItemStateType.MOVING, new MovingState() );
        this.stateMachine.addState( ItemStateType.ON_SHELF, new OnShelfState() );

        // Thiết lập state mặc định
        this.stateMachine.changeState( ItemStateType.IDLE );
    }

    update ( deltaTime: number )
    {
        // Cập nhật state machine
        if ( this.stateMachine )
        {
            this.stateMachine.update( deltaTime );
        }
    }

    public pick (): boolean
    {
        // Nếu item không pickable hoặc đang trong quá trình match thì không cho pick
        if ( !this._isPickable || ShelfContainer.instance.isInMatching() ) return false;
        return this.stateMachine.changeState( ItemStateType.PICKED );
    }
    public drop (): boolean
    {
        return this.stateMachine.changeState( ItemStateType.IDLE );
    }
    public moveToShelf (): void
    {
        this.stateMachine.changeState( ItemStateType.MOVING );
    }
    public onShelf (): void
    {
        this.stateMachine.changeState( ItemStateType.ON_SHELF );
    }



    public getCurrentState (): string
    {
        return this.stateMachine.getCurrentStateName();
    }

    public async sortItem ( newIndexPos: number ): Promise<void>
    {
        window.item = this;
        let currentIndex = this.currentShelfIndexSlot;
        let delay = newIndexPos > currentIndex ? 0 : currentIndex * 0.05;
        if ( delay > 0 )
        {
            await new Promise( resolve => setTimeout( resolve, delay * 1000 ) );
        }

        if ( newIndexPos > currentIndex )
        {
            for ( let i = newIndexPos; i > currentIndex; i-- )
            {
                let targetSlotPos = this.getSlotPosition( i );
                let startPos = this.node.worldPosition;
                let endPos = targetSlotPos;

                const controlPoint = new Vec3(
                    ( startPos.x + endPos.x ) / 2,
                    Math.max( startPos.y, endPos.y ) + 1, // +1 là chiều cao nhảy, điều chỉnh phù hợp
                    ( startPos.z + endPos.z ) / 2
                );

                this.animationPromise = BezierTweenWorld(
                    this.node,
                    0.15, // Thời gian tương đương với InGameController.sortTime
                    startPos,
                    controlPoint,
                    endPos
                );
                await this.animationPromise;
                //this.currentShelfIndexSlot = i;
            }
        } else
        {
            for ( let i = currentIndex; i > newIndexPos; i-- )
            {
                let targetSlotPos = this.getSlotPosition( i - 1 );
                let startPos = this.node.worldPosition;
                let endPos = targetSlotPos;

                const controlPoint = new Vec3(
                    ( startPos.x + endPos.x ) / 2,
                    Math.max( startPos.y, endPos.y ) + 1, // +1 là chiều cao nhảy, điều chỉnh phù hợp
                    ( startPos.z + endPos.z ) / 2
                );

                this.animationPromise = BezierTweenWorld(
                    this.node,
                    0.15, // Thời gian tương đương với InGameController.sortTime
                    startPos,
                    controlPoint,
                    endPos
                );
                await this.animationPromise;
                //this.currentShelfIndexSlot = i - 1;
            }
        }
        this.currentShelfIndexSlot = newIndexPos;
    }

    public getSlotPosition ( index: number ): Vec3
    {
        return ShelfContainer.instance.listShelfSlots[ index ].node.worldPosition;
    }
}
