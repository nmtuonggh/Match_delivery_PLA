import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass( 'VariableConfig' )
export class VariableConfig
{
    //tao 1 bien toi co the dung o bat ky dau
    public static instance: VariableConfig = null;
    public static SORT_TIME: number = 0.1;
    public static PICKUP_TIME: number = 0.4;
    public static SORT_DELAY_LEFT: number = 85;
    public static SORT_DELAY_RIGHT: number = 200;

    ///
    public static DELAY_COLLECT_TIME: number = 0.05;
    public static COLLECT_TIME: number = 0.2;
    public static onShelftScale: Vec3 = new Vec3( 0.95, 0.95, 0.95 );
    public static TIME_TILE_ARRIVED: number = 0.08;
    public static TIME_TILE_BOUNCE: number = 0.8;

}


