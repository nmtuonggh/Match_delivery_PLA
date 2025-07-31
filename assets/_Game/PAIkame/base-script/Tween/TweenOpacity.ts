import { _decorator, Component, Node, repeat, Size, tween, UIOpacity, UITransform, Widget, screen } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TweenOpacity')
export class TweenOpacity extends Component {
    @property
    duration : number = 0.5;
    @property
    loop : boolean = false;

    protected start(): void {
        this.ActionTween();
    }
    ActionTween(){
        this.node.getComponent(Widget).enabled = false;
        if(this.loop){
            tween(this.node.getComponent(UIOpacity))
            .set( {opacity: 0})
            .to(this.duration, {opacity: 255} , {easing: "smooth"})
            .to(this.duration, {opacity: 0} , {easing: "smooth"})
            .union()
            .repeatForever()
            .start();
        }else{
            tween(this.node.getComponent(UIOpacity))
            .set( {opacity: 0})
            .to(this.duration, {opacity: 255} , {easing: "smooth"})
            .start();
        }
        
    }
}


