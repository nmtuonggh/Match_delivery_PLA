import { _decorator, Component, Node } from 'cc';
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

    start ()
    {
        GameController.instance = this;
    }

    protected update ( dt: number ): void
    {

    }

    loseGame (): void
    {
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


