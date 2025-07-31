import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TweenRotate')
export class TweenRotate extends Component {
    start() {
        this.actionTween();
    }

    actionTween(){
        tween(this.node)
        .to(2.5, {eulerAngles: new Vec3(0,0,180)})
        .to(2.5, {eulerAngles: new Vec3(0,0,360)})
        .set({eulerAngles: new Vec3(0,0,0)})
        .union()
        .repeatForever()
        .start();
    }

}


