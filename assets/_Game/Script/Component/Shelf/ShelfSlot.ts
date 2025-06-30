import { _decorator, Component, Node } from 'cc';
import { Item } from '../Object/Item';
const { ccclass, property } = _decorator;

@ccclass( 'ShelfSlot' )
export class ShelfSlot extends Component
{
    public linkItem: Item;
}


