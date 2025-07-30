import { _decorator, Component, Enum, Label, Node, Sprite, tween, Vec3 } from 'cc';
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

    public currentPickedCount: number = 0;
    public isCompleted: boolean = false;

    private _completedCount: number = 0;
    private startScale: Vec3 = null;

    public get completedCount (): number
    {
        return this._completedCount;
    }

    public set completedCount ( value: number )
    {
        this._completedCount = value;
        this.updateUI();
        if ( this._completedCount >= this.oderCount )
        {
            this.isCompleted = true;
        }
    }

    protected start (): void
    {
        this.updateUI();
        this.startScale = this.node.scale.clone();
    }

    public updateUI (): void
    {
        const remaining = Math.max( 0, this.oderCount - this._completedCount );
        this.oderCountLabel.string = remaining.toString();
    }

    public onItemOnShelf (): void
    {
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
    }

    public onItemMatched ( count: number ): boolean
    {
        if ( this.isCompleted ) return false;

        const oldCompletedCount = this._completedCount;
        this.completedCount = this._completedCount + count;

        return !this.isCompleted && oldCompletedCount < this.oderCount && this._completedCount >= this.oderCount;
    }
}
