import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum ItemType
{
    //FoodDrinks
    Hamberger = 'Hamberger',
    IceCreamCubBlue = 'IceCreamCubBlue',
    Donut_Pink = 'Donut_Pink', 

    //Fruits
    StrongBerry = 'StrongBerry',
    Watermelon = 'Watermelon',
    Lemon = 'Lemon',
    
}



@ccclass( 'ItemTypeEnum' )
export class ItemTypeEnum
{
}


