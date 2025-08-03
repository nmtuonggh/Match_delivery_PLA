import { _decorator, Component, EPhysicsDrawFlags, Node, PhysicsSystem } from 'cc';
const { ccclass, property } = _decorator;

@ccclass( 'GameController' )
export class GameController extends Component
{
    @property( { type: Node, group: "WinLose" } )
    winNode: Node = null;

    @property( { type: Node, group: "WinLose" } )
    loseNode: Node = null;

    @property( Node )
    disableInput: Node = null;
    static instance: GameController = null;

    isWin: boolean = false;

    protected onLoad (): void
    {
    //     PhysicsSystem.instance.debugDrawFlags =
    //     // EPhysicsDrawFlags.WIRE_FRAME
    // //EPhysicsDrawFlags.AABB
    // // | EPhysicsDrawFlags.CONSTRAINT;
    }
    start ()
    {
        GameController.instance = this;
    }

    protected update ( dt: number ): void
    {

    }

    loseGame (): void
    {
        console.log("Lose game");
        this.loseNode.active = true;
    }

    winGame (): void
    {
        this.isWin = true;
        this.scheduleOnce( () =>
        {
            this.winNode.active = true;
        }, 1 );
    }

    onDisableInput (): void
    {
        this.disableInput.active = true;
    }
}


