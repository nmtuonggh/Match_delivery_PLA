import { _decorator, Component, Node, tween, UIOpacity, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TweenScale')
export class TweenScale extends Component {
    @property
    initScale : Vec3 = new Vec3(0,0,0)
    @property
    scaleTo : Vec3 = new Vec3(0,0,0);
    @property
    duration : number = 1;
    
    @property
    delay : number = 0;

    @property
    repeatForever : boolean = false;


    start() {
        this.ActionTween();
    }
    ActionTween(){
        if(!this.repeatForever){
            tween(this.node)
            .set( {scale: this.initScale})
            .to(this.duration, {scale: this.scaleTo} , {easing: "backOut"})
            .start();

            tween(this.node.getComponent(UIOpacity))
            .set( {opacity: 0})
            .to(this.duration, {opacity: 255} , {easing: "backOut"})
            .start();
        }else{
            let currentScale = this.node.getScale();

            tween(this.node)
            //.set( {scale: new Vec3(this.initScale.x * currentScale.x, this.initScale.y * currentScale.y, this.initScale.z * currentScale.z)})
            .to(this.duration, {scale: new Vec3(this.scaleTo.x * currentScale.x, this.scaleTo.y * currentScale.y, this.scaleTo.z * currentScale.z)} , {easing: "linear"})
            .to(this.duration, {scale: this.initScale} , {easing: "linear"})
            .delay(this.delay)
            .union()
            .repeatForever()
            .start();
        }
    }
}


