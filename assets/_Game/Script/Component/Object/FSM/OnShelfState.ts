import { _decorator, Component, Node } from 'cc';
import { IState } from './IState';
import { Item } from '../Item';
import { ShelfContainer } from '../../Shelf/ShelfContainer';
const { ccclass, property } = _decorator;

@ccclass( 'OnShelfState' )
export class OnShelfState implements IState
{
    private readonly name: string = 'OnShelf';

    constructor () { }

    public enter ( item: Item ): void
    {
        console.log( `${ item.node.name } đã vào trạng thái OnShelf` );
        //reset góc
        item.node.setRotationFromEuler( 0, 0, 0 );
        ShelfContainer.instance.checkForMatches();
    }

    public exit ( item: Item ): void
    {
        console.log( `${ item.node.name } đã rời khỏi trạng thái OnShelf` );
    }

    public update ( item: Item, deltaTime: number ): void
    {
    }

    public getName (): string
    {
        return this.name;
    }
}


