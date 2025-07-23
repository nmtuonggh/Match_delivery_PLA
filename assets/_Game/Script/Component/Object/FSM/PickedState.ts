import { tween, Vec3 } from 'cc';
import { Item } from '../Item';
import { IState } from './IState';

/**
 * State khi Item đã được người chơi chọn/nhặt
 */
export class PickedState implements IState
{
    private readonly name: string = 'Picked';
    private startScale: Vec3 = new Vec3( 1, 1, 1 );
    private newScale: Vec3 = new Vec3( 1, 1, 1 );

    constructor () { }

    public enter ( item: Item ): void
    {
       // console.log( `${ item.node.name } đã vào trạng thái Picked` );

        item.rb.linearFactor = new Vec3( 0, 1, 0 );
        this.tweenScale( item );
    }

    public exit ( item: Item ): void
    {
       // console.log( `${ item.node.name } đã rời khỏi trạng thái Picked` );
        item.rb.linearFactor = new Vec3( 1, 1, 1 );
        tween( item.node )
            .to( 0.15, { scale: new Vec3( this.startScale.x, this.startScale.y, this.startScale.z ) }, { easing: 'bounceOut' } )
            .start();
    }

    public update ( item: Item, deltaTime: number ): void
    {

    }

    public getName (): string
    {
        return this.name;
    }

    tweenScale ( item: Item ): void
    {
        this.startScale = item.node.scale.clone();
        this.newScale = item.node.scale.clone();
        tween( item.node )
            .to( 0.15, { scale: new Vec3( this.newScale.x * 1.2, this.newScale.y * 1.2, this.newScale.z * 1.2 ) }, { easing: 'bounceOut' } )
            .start();
    }
}
