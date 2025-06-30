import { _decorator, Component, Enum, Node, RigidBody, tween, Vec3 } from 'cc';
import { IdleState } from './FSM/IdleState';
import { PickedState } from './FSM/PickedState';
import { MovingState } from './FSM/MovingState';
import { OnShelfState } from './FSM/OnShelfState';
import { StateMachine } from './FSM/StateMachine';
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

    private stateMachine: StateMachine;
    private _isPickable: boolean = true;

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
        if ( !this._isPickable ) return false;
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
}
