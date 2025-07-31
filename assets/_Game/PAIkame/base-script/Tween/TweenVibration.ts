import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TweenVibration')
export class TweenVibration extends Component {

    @property
    vibrationRate : number = 3;

    @property
    duration : number = 0.5;
    @property
    delay : number = 0;

    start() {
        this.actionTween();
    }
    actionTween(){
        tween(this.node)
        .to(this.duration, {eulerAngles : new Vec3(0,0,this.vibrationRate)} , {easing : 'sineOut'})
        .to(this.duration, {eulerAngles : new Vec3(0,0,-this.vibrationRate)} , {easing : 'sineOut'})
        .union()
        .repeat(3)
        .to(this.duration, {eulerAngles : new Vec3(0,0,0)} , {easing : 'sineOut'})
        .delay(this.delay)
        .union()
        .repeatForever()
        .start();
    }
}


