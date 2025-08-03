import { _decorator, Component, Node } from 'cc';
import { Item } from '../Component/Object/Item';
import { CollectHandler } from './CollectHandler';
import { ShelfContainer } from '../Component/Shelf/ShelfContainer';
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

    public onComplete ( item: Item ): void
    {
        this.count += 1;
        CollectHandler.instance.UpdatePickUpItemDead( item );
        //TODO : Logic card oder
    }

    public onStartPickup ( item: Item ): void
    {
        //item.node.setParent(ShelfContainer.instance.pickupItemParrent);
    }
}


