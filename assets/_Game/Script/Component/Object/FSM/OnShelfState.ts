import { _decorator, Component, Node } from 'cc';
import { IState } from './IState';
import { Item } from '../Item';
import { ShelfContainer } from '../../Shelf/ShelfContainer';
import { EventListener } from '../../../GameEvent/EventListener';
import { GameEvent } from '../../../GameEvent/GameEvent';
const { ccclass, property } = _decorator;

@ccclass( 'OnShelfState' )
export class OnShelfState implements IState
{
    private readonly name: string = 'OnShelf';

    constructor () { }

    public enter ( item: Item ): void
    {
        // item.node.setRotationFromEuler( 20, 180, 0 );
        EventListener.emit( GameEvent.ItemOnShelf, item.itemType );
    }

    public exit ( item: Item ): void
    {
    }

    public update ( item: Item, deltaTime: number ): void
    {
    }

    public getName (): string
    {
        return this.name;
    }
}


