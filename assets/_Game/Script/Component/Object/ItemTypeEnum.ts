import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum ItemType
{
    //FoodDrinks
    Hamberger = 'Hamberger',
    IceCreamCubBlue = 'IceCreamCubBlue',
    Donut_Pink = 'Donut_Pink', 
}



@ccclass( 'ItemTypeEnum' )
export class ItemTypeEnum
{
}


