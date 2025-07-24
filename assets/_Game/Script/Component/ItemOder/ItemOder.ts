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

    public isCompleted: boolean = false;

    protected start (): void
    {
        this.oderCountLabel.string = this.oderCount.toString();
    }

    public onItemOnShelf (): void
    {
        let startScale = this.node.scale.clone();
        let newScale = startScale.clone();
        newScale.x *= 1.15;
        newScale.y *= 1.15;
        newScale.z *= 1.15;
        tween( this.node )
            .to( 0.15, { scale: newScale }, { easing: 'smooth' } )
            .to( 0.15, { scale: startScale }, { easing: 'smooth' } )
            .start();
    }
}
