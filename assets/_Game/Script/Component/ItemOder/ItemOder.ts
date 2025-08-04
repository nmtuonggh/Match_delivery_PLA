import { _decorator, Color, color, Component, Enum, Label, Node, Sprite, tween, Vec3 } from 'cc';
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
    @property( Sprite )
    public checkNode: Sprite;
    @property(Color)
    public highLightColor: Color;
    @property(Node)
    public doneNode: Node;

    public currentPickedCount: number = 0;
    public isCompleted: boolean = false;

    
    private startScale: Vec3 = null;


    protected start (): void
    {
        this.updateUI();
        this.startScale = this.node.scale.clone();
    }

    public updateUI (): void
    {
        const remaining = Math.max( 0, this.oderCount - this.currentPickedCount );
        this.oderCountLabel.string = remaining.toString();
    }

    CheckComplete (): boolean
    {
        if ( this.currentPickedCount >= this.oderCount )
        {
            this.isCompleted = true;
        }
        return this.isCompleted;
    }

    public onItemOnShelf (): void
    {
        if ( this.isCompleted ) return;
        this.currentPickedCount++;
        this.oderCountLabel.string = ( this.oderCount - this.currentPickedCount ).toString();

        //tween fill
        let newFill = this.currentPickedCount / this.oderCount;
        tween( this.checkNode )
            .to( 0.15, { fillRange: newFill }, { easing: 'smooth' } )
            .start();

        //tween scale
        let newScale = this.startScale.clone();
        newScale.x *= 1.15;
        newScale.y *= 1.15;
        newScale.z *= 1.15;
        tween( this.node )
            .to( 0.15, { scale: newScale }, { easing: 'smooth' } )
            .to( 0.15, { scale: this.startScale }, { easing: 'smooth' } )
            .start();
        
        //tween color
        let sprite = this.node.getComponent(Sprite);
        tween(sprite)
            .to(0.15, { color: this.highLightColor }, { easing: 'smooth' })
            .to(0.15, { color: new Color(255, 255, 255, 255) }, { easing: 'smooth' })
            .start();
    }

    public onDone (): void
    {
        tween(this.doneNode)
            .to(0.1, { scale: new Vec3(1, 1, 1) }, { easing: 'smooth' })
            .start();
    }
}
