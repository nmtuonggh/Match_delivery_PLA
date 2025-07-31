import { tween } from 'cc';
import { Vec3 } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TweenRotation')
export class TweenRotation extends Component {
    @property
    private inTime = 0.3
    @property
    private outTime = 0.3
    @property
    private delay = 3
    @property
    private from : Vec3 = new Vec3(0,0,0)
    @property
    private to : Vec3 = new Vec3(0,0,0)
    start() {
        tween(this.node)
        .delay(this.delay)
        .to(this.inTime,{eulerAngles: this.to})
        .to(this.outTime,{eulerAngles: this.to.clone().negative()})
        .to(this.outTime/2,{eulerAngles: this.from}).union().repeatForever().start()
    }
}


