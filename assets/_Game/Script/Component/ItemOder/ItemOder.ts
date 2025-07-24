import { _decorator, Component, Enum, Label, Node, Sprite, tween } from 'cc';
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

    public onItemOnShelf (): void
    {
        let startScale = this.node.scale;
        let newScale = startScale.clone();
        newScale.x *= 1.1;
        newScale.y *= 1.1;
        newScale.z *= 1.1;
        tween( this.node )
            .to( 0.1, { scale: newScale }, { easing: 'bounceOut' } )
            .to( 0.1, { scale: startScale }, { easing: 'bounceOut' } )
            .start();
    }
}
