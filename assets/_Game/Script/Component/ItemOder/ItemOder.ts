import { _decorator, Component, Enum, Label, Node, Sprite } from 'cc';
import { ItemType } from '../Object/Item';
const { ccclass, property } = _decorator;

@ccclass( 'ItemOder' )
export class ItemOder extends Component
{
    @property( { type: Enum( ItemType ) } )
    public itemType: ItemType;
    @property()
    public oderCount: number = 0;
    @property( Sprite )
    public image: Sprite;
    @property( Label )
    public oderCountLabel: Label;
    @property( Node )
    public checkNode: Node;

    protected start (): void
    {
        this.oderCountLabel.string = this.oderCount.toString();
    }
}
