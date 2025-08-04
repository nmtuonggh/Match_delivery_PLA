import { _decorator, Component, Node, tween, Vec3, Tween, TweenSystem, Prefab, instantiate, Canvas, UITransform, view, Camera, Vec2, director } from 'cc';
import { ShelfSlot } from './ShelfSlot';
import { Item } from '../Object/Item';
import { EventListener } from '../../GameEvent/EventListener';
import { GameEvent } from '../../GameEvent/GameEvent';
import { VariableConfig } from '../../Config/VariableConfig';
import { GameController } from '../../Manager/GameController';
import { AudioSystem } from '../../Audio/AudioSystem';
import { ParticleSpawnManager } from '../../Manager/ParticleSpawnManager';
const { ccclass, property } = _decorator;

@ccclass( 'ShelfContainer' )
export class ShelfContainer extends Component
{
    //#region Editor fields
    @property( { type: [ ShelfSlot ] } )
    public listShelfSlots: ShelfSlot[] = [];
    @property( Node )
    public listShelfRender: Node[] = [];
    @property( Prefab )
    public matchEffect: Prefab = null;

    @property( Camera )
    public Camera: Camera = null;
    @property( Node )
    public canvas: Node = null;
    @property(Node)
    public pickupItemParrent : Node = null;
    //#endregion


    static instance: ShelfContainer = null;
    public canCheckMatch: boolean = true;
    public currentPickedActiveCount: number = 0;
    public currentPickedTotalCount: number = 0;
    public doneMoveCountCheck: number = 0;


    public listPickedItem: Item[] = [];

    public pickupNum: number = 0;

    //#region Private fields
    private listShelfRenderStartPos: Vec3[] = [];
    //#endregion

    //#region CC Methods
    public onLoad (): void
    {
        ShelfContainer.instance = this;
        let slots = this.node.getComponentsInChildren( ShelfSlot );
        for ( let i = 0; i < slots.length; i++ )
        {
            if ( slots[ i ].node.active )
            {
                this.listShelfSlots.push( slots[ i ] );
            }
            this.listShelfRenderStartPos.push( this.listShelfRender[ i ].worldPosition.clone() );
        }
    }
    //#endregion

    //#region Public methods
    //#region IsFullSlot
    public isFullSlot (): boolean
    {
        console.log("Current picked active count: " + this.currentPickedActiveCount);
        console.log("List shelf slots length: " + this.listShelfSlots.length);
        return this.currentPickedActiveCount >= this.listShelfSlots.length;
    }   
    //#endregion
    //#region GetSlotAndCheckMatch
    public getSlotAndCheckMatch ( item: Item ): { index: number, canMatched: boolean }
    {
        const result = { index: -1, canMatched: false };

        for ( let i = this.listShelfSlots.length - 1; i >= 0; i-- )
        {
            if ( !this.isSameItemType( item, this.listShelfSlots[ i ] ) )
            {
                continue;
            }
            result.canMatched = this.isSameItemType( item, this.listShelfSlots[ i - 1 ] );
            result.index = i;
            break;
        }
        return result;
    }
    //#endregion

    public listAnimationPromise: Promise<void>[] = [];


    //#region Private methods
    //#region IsSameItemType
    private isSameItemType ( item: Item, slot: ShelfSlot ): boolean
    {
        let index = this.listShelfSlots.indexOf( slot );
        if ( !this.listPickedItem[ index ] )
        {
            return false;
        }
        return item.itemType === this.listPickedItem[ index ].itemType && !this.listPickedItem[ index ].isDead;
    }
    //#endregion
    //#region SortItemOnShelf
    public async sortItemOnShelf (): Promise<void>
    {
        window.this = this;
        for ( let i = this.currentPickedTotalCount - 1; i >= 0; i-- )
        {
            let item = this.listPickedItem[ i ];
            item.sortItem( i );
        }
    }
    //#endregion
    //#region Bounce
    public async bounceSlot ( boundcePower: number, index: number , item: Item): Promise<void>
    {
        if(index < 0 || index >= this.listShelfRender.length) return;
        let shakeForce = boundcePower ;
        let render = this.listShelfRender[ index ];
        let renderStartPos = this.listShelfRenderStartPos[ index ];
        //Tween.stopAllByTarget(render);
        item.node.setParent(render, true);
        //item.node.eulerAngles = new Vec3(10,180,0);
        let downPos = renderStartPos.clone().add3f(0,-shakeForce,0);
        let upPos = renderStartPos.clone();
        tween(render)
            .to(VariableConfig.TIME_TILE_ARRIVED,{worldPosition:downPos},{easing:'sineIn'})
            .to(VariableConfig.TIME_TILE_BOUNCE,{worldPosition:upPos},{easing:'elasticOut'})
            .start();
    }
    //#endregion
    //#region GetSlotPos
    getSlotPos ( index: number ): Vec3
    {
        //them clamp
        let realIndex = Math.max( 0, Math.min( index, this.listShelfSlots.length - 1 ) );
        return this.listShelfSlots[ realIndex ].node.getWorldPosition();
    }
    //#endregion
}
