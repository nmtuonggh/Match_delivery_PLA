import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass( 'GameController' )
export class GameController extends Component
{
    @property({type:Node, group:"WinLose"})
    winNode: Node = null;

    @property({type:Node, group:"WinLose"})
    loseNode: Node = null;

    @property(Node)
    disableInput: Node = null;
    static instance: GameController = null;

    start()
    {
        GameController.instance = this;
    }

    loseGame (): void
    {
        this.loseNode.active = true;
    }

    winGame (): void
    {
        this.winNode.active = true;
    }

    onDisableInput (): void
    {
        this.disableInput.active = true;
    }
}


