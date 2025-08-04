import { _decorator, Component, Node } from 'cc';
import { Item } from '../Component/Object/Item';
import { CollectHandler } from './CollectHandler';
import { ItemOderController } from '../Component/ItemOder/ItemOderController';
import { AudioSystem } from '../Audio/AudioSystem';
import { ShelfContainer } from '../Component/Shelf/ShelfContainer';
import { GameController } from './GameController';
const { ccclass, property } = _decorator;

@ccclass( 'GameFlowController' )
export class GameFlowController extends Component
{
    @property( Node )
    public pickupItemParentNode: Node = null;
    public count: number = 0;


    static instance: GameFlowController = null;

    public onLoad (): void
    {
        GameFlowController.instance = this;
    }

    public onCompleteMoveToShelf ( item: Item ): void
    {
        this.count += 1;
        CollectHandler.instance.UpdatePickUpItemDead( item );
        //TODO : Logic card oder
        ItemOderController.instance.onItemOnShelf( item.itemType );
        AudioSystem.instance.playObjOnShelf();
        this.scheduleOnce( () =>
        {
            AudioSystem.instance.playOderChange();
        }, 0.2 );
        if ( ShelfContainer.instance.isFullSlot() )
        {
            GameController.instance.loseGame();
            AudioSystem.instance.playLoseGame();
            return;
        }
    }

    public onStartPickup ( item: Item ): void
    {
        //item.node.setParent(ShelfContainer.instance.pickupItemParrent);
    }
}


