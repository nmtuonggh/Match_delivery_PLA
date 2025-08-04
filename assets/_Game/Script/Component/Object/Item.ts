import { _decorator, Component, Enum, Node, RigidBody, Tween, tween, Vec3, Quat, debug, log } from 'cc';
import { IdleState } from './FSM/IdleState';
import { PickedState } from './FSM/PickedState';
import { MovingState } from './FSM/MovingState';
import { OnShelfState } from './FSM/OnShelfState';
import { StateMachine } from './FSM/StateMachine';
import { ShelfContainer } from '../Shelf/ShelfContainer';
import { BezierTweenWorld } from '../../Tween/TweenExtension';
import { VariableConfig } from '../../Config/VariableConfig';
import { ItemType } from './ItemTypeEnum';
import { AudioSystem } from '../../Audio/AudioSystem';
import { ParticleSpawnManager } from '../../Manager/ParticleSpawnManager';
import { PickObjHandler } from '../../Interact/PickObjHandler';
import { ItemOderController } from '../ItemOder/ItemOderController';
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



@ccclass( 'Item' )
export class Item extends Component
{
    //#region Editor Fields
    @property( { type: RigidBody } )
    public rb: RigidBody = null;
    @property( { type: Enum( ItemType ) } )
    public itemType: ItemType = ItemType.Hamberger;
    //#endregion

    //#region Public fields
    public currentShelfIndexSlot: number = -1;
    public startScale: Vec3 = new Vec3( 1, 1, 1 );
    public sortPromise: Promise<void> | null = null;
    public animationPromise: Promise<void> | null = null;
    public bouncePromise: Promise<void> | null = null;
    public pickupTween: Tween<any> | null = null; // Thêm để track pickup animation
    public sortSequence: Tween<Node> | null = null;
    @property( { type: Number, readonly: true } )
    public pickupIndexLogic: number = 0;
    public pickupIndexStatus: number = 0;
    public pickupNum: number = 0;
    public pickupPos: Vec3 = new Vec3( 0, 0, 0 );
    public isFlying: boolean = false;
    public prePickupPos: Vec3 = new Vec3( 0, 0, 0 );
    public preRotation: Quat = new Quat( 0, 0, 0, 0 );

    //#endregion

    //#region Flag Fields
    @property( { readonly: true } )
    public isDead: boolean = false;
    public isCollected: boolean = false;
    public wasPicked: boolean = false;
    public isMerging: boolean = false;
    //#endregion
    //#region Special fields
    @property( { readonly: true } )
    public isMatching: boolean = false;

    //#endregion

    //#region Private fields
    private stateMachine: StateMachine;
    private _isPickable: boolean = true;
    private upCollectionOffset: Vec3 = new Vec3( 0, 5, 0 );
    private sortAnimationPromises: Promise<void>[] = [];
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
        this.startScale = new Vec3( 2, 2, 2 );
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
        AudioSystem.instance.playPickObj();
        PickObjHandler.instance.spawnPickParticle( this.node );

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

    //#region Sort Item
    public async sortItem ( newIndexPos: number ): Promise<void>
    {
        window.item = this;
        if ( !this.canSort( newIndexPos ) ) return;
        if ( this.isMerging ) return;
        if ( this.pickupTween )
        {
            this.pickupTween.stop();
            this.pickupTween = null;
        }
        if ( this.sortAnimationPromises )
        {
            this.sortAnimationPromises = [];
            this.sortPromise = null;
        }
        this.pickupPos = this.getSlotPosition( newIndexPos );
        this.pickupIndexStatus = newIndexPos;
        //Tween.stopAllByTarget( this.node );

        if(this.itemType === ItemType.Lemon)
        {
            //console.log("Sort lemon at index " + this.pickupIndexLogic + " to index " + newIndexPos);
        }
        //hopping to new pos
        let currentIndex = this.pickupIndexLogic;
        let delay = newIndexPos > this.pickupIndexLogic ? 0 : this.pickupIndexLogic * 0.05;

        // Tạo mảng để lưu tất cả các promises từ BezierTweenWorld
        this.sortAnimationPromises = [];
        if ( newIndexPos < this.pickupIndexLogic )
        {
            for ( let i = currentIndex - 1; i >= newIndexPos; i-- )
            {
                let i1 = i;
                let targetPos = this.getSlotPosition( i );
                let startPos = this.node.worldPosition;
                let jumpHeight = 1;

                // Tạo control point cho jump effect (tương tự DOJump)
                let controlPoint = new Vec3(
                    ( startPos.x + targetPos.x ) / 2,
                    Math.max( startPos.y, targetPos.y ) + jumpHeight,
                    ( startPos.z + targetPos.z ) / 2
                );

                //console.log( "Sort item" + this.node.name + " to index " + i1 );
                const animationPromise = BezierTweenWorld( this.node, VariableConfig.SORT_TIME, startPos, controlPoint, targetPos, delay )
                    .promise.then( () =>
                    {
                        this.pickupIndexLogic = i1;
                        ShelfContainer.instance.bounceSlot( 0.5, this.pickupIndexLogic, this );
                    } );

                this.sortAnimationPromises.push( animationPromise );
            }
        }
        else if ( newIndexPos > this.pickupIndexLogic )
        {
            for ( let i = currentIndex + 1; i <= newIndexPos; i++ )
            {
                let i1 = i;
                let targetPos = this.getSlotPosition( i );
                let startPos = this.node.worldPosition;
                let jumpHeight = 1;

                // Tạo control point cho jump effect (tương tự DOJump)
                let controlPoint = new Vec3(
                    ( startPos.x + targetPos.x ) / 2,
                    Math.max( startPos.y, targetPos.y ) + jumpHeight,
                    ( startPos.z + targetPos.z ) / 2
                );

                const animationPromise = BezierTweenWorld( this.node, VariableConfig.SORT_TIME, startPos, controlPoint, targetPos, delay )
                    .promise.then( () =>
                    {
                        this.pickupIndexLogic = i1;
                        ShelfContainer.instance.bounceSlot( 0.5, this.pickupIndexLogic, this );
                    } );

                this.sortAnimationPromises.push( animationPromise );
            }
        }

        this.sortPromise = Promise.all( this.sortAnimationPromises ).then( () => 
        {
            //console.log("Sort item " + this.node.name + " to index " + newIndexPos);
            this.pickupIndexLogic = newIndexPos;
            // tween( this.node )
            // .to( 0, { worldPosition: this.pickupPos } )
            // .start();
            this.sortAnimationPromises = [];
            // this.sortPromise = null;
        } );
    }

    public getSlotPosition ( index: number ): Vec3
    {
        //debugger;
        return ShelfContainer.instance.getSlotPos( index );
    }

    //#region Collect
    public Collect ( pos: Vec3 ): void
    {
        if ( this.sortSequence != null )
        {
            //kill sort sequence
            this.sortSequence.stop();
            this.sortSequence = null;
        }

        Tween.stopAllByTarget( this.node );
        this.isMerging = true;
        if ( this.sortSequence != null )
        {
            this.sortSequence.stop();
            this.sortSequence = null;
        }
        //Move the object up then move to the collection pos
        let upPos = new Vec3( this.node.worldPosition.x, pos.y + this.upCollectionOffset.y, this.node.worldPosition.z );
        let xPos = new Vec3( pos.x, pos.y + this.upCollectionOffset.y, pos.z )
        tween( this.node )
            .to( VariableConfig.COLLECT_TIME / 2, { worldPosition: upPos }, { easing: 'sineOut' } )
            .to( VariableConfig.COLLECT_TIME / 2, { worldPosition: xPos }, { easing: 'backIn' } )
            .call( () => { this.node.active = false; } )
            .start();
    }
    //#endregion

    //#region MidCollected
    public midCollected (): void
    {
        let startPos = this.node.worldPosition.clone();
        Tween.stopAllByTarget( this.node );
        tween( this.node )
            .to( 0.1, { scale: new Vec3( VariableConfig.onShelftScale.x * 1.2, VariableConfig.onShelftScale.y * 1.2, VariableConfig.onShelftScale.z * 1.2 ) }, { easing: 'sineOut' } )
            .to( 0.05, { scale: VariableConfig.onShelftScale }, { easing: 'cubicIn' } )
            .call( () =>
            {
                this.node.active = false;
                ItemOderController.instance.onItemMatched(this.itemType, this.pickupNum);
                AudioSystem.instance.playMatchObj();
            } )
            .start();
        tween( this.node )
            .to( 0.15, { worldPosition: new Vec3( startPos.x, startPos.y + 5, startPos.z ) }, { easing: 'sineOut' } )
            .start();
    }
    //#endregion

    //#region Pickup
    public PickupObj ( pickIndex: number, pickNum: number )
    {
        this.pickupIndexStatus = pickIndex;
        this.pickupNum = pickNum;
        this.isFlying = true;
    }
    //#endregion
    //#region CanSort
    public canSort ( sortIndex: number ): boolean
    {
        return this.wasPicked && sortIndex != this.pickupIndexStatus;
    }
    //#endregion
    //#region CanNotCollect
    public canNotCollect (): boolean
    {
        return !this.wasPicked || this.isCollected || !this.isDead;
    }
    //#endregion
}
export { ItemType };
