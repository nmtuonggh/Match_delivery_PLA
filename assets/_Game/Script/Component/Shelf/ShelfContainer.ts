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

    isFullSlot (): boolean
    {
        return this.currentPickedActiveCount >= this.listShelfSlots.length;
    }
    //#region GetSlotAndCheckMatch
    public getSlotAndCheckMatch ( item: Item ): { index: number, canMatched: boolean }
    {
        this.currentPickedActiveCount++;
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
        return item.itemType === this.listPickedItem[ index ].itemType && !this.listPickedItem[ index ].isMatching;
    }
    //#endregion
    //#region SortItemOnShelf
    public async sortItemOnShelf (): Promise<void>
    {
        for ( let i = this.currentPickedTotalCount - 1; i >= 0; i-- )
        {
            let item = this.listPickedItem[ i ];
            item.sortItem( i );
        }
    }
    //#endregion
    //#region Bounce
    public async bounceSlotRender ( boundcePower: number, index: number ): Promise<void>
    {
        let render = this.listShelfRender[ index ];
        let offsetBounce = boundcePower;
        let startPos = this.listShelfRenderStartPos[ index ];
        let newPosition = new Vec3( startPos.clone().x, startPos.clone().y - offsetBounce, startPos.clone().z );
        if ( render )
        {
            tween( render )
                .to( 0.08, { worldPosition: newPosition }, { easing: 'sineIn' } )
                .to( 0.8, { worldPosition: startPos }, { easing: 'elasticOut' } )
                .start();
        }
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
