import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass( 'VariableConfig' )
export class VariableConfig
{
    //tao 1 bien toi co the dung o bat ky dau
    public static instance: VariableConfig = null;
    public static SORT_TIME: number = 0.1;
    public static ANIMATIONITEM_TIME: number = 0.2;
    public static SORT_DELAY_LEFT: number = 85;
    public static SORT_DELAY_RIGHT: number = 200;
}


