import { _decorator, Component, Node, tween, Vec3, Tween, TweenSystem } from 'cc';
import { ShelfSlot } from './ShelfSlot';
import { Item, ItemType } from '../Object/Item';
import { EventListener } from '../../GameEvent/EventListener';
import { GameEvent } from '../../GameEvent/GameEvent';
const { ccclass, property } = _decorator;

@ccclass( 'ShelfContainer' )
export class ShelfContainer extends Component
{
    //#region Editor fields
    @property( { type: [ ShelfSlot ] } )
    public listShelfSlots: ShelfSlot[] = [];
    //#endregion

    static instance: ShelfContainer = null;

    //#region Private fields
    private currentItemCount: number = 0;
    private listPickedItem: Item[] = [];
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
        }
    }
    //#endregion

    //#region Public methods
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

        if ( result.index === -1 && this.listPickedItem.length > 0 )
        {
            result.index = this.currentItemCount - 1;
        }
        return result;
    }

    public onGetNewItem ( item: Item , index: number , canMatched: boolean ): void
    {
        let checkMatchedIndex = index;
        if ( canMatched )
        {
            this.listPickedItem
        }
        this.currentItemCount++;
        if ( checkMatchedIndex === 0 )
        {
            this.listPickedItem.push( item );
        }
        else
        {
            //chèn item vào vị trí đúng
            this.listPickedItem.splice( checkMatchedIndex, 0, item );
        }


        //currentShelfIndexSlot = index cua item trong listPickedItem
        this.sortItemOnShelf();
    }

    

    //#endregion

    //#region Private methods
    private isSameItemType ( item: Item, slot: ShelfSlot ): boolean
    {
        let index = this.listShelfSlots.indexOf( slot );
        if ( !this.listPickedItem[ index ] )
        {
            return false;
        }
        return item.itemType === this.listPickedItem[ index ].itemType;
    }
    private async sortItemOnShelf ()
    {
        for ( let i = this.currentItemCount - 1; i >= 0; i-- )
        {
            let item = this.listPickedItem[ i ];
            await item.sortItem( i );
        }
    }

    //#endregion
}
