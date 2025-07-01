import { _decorator, Component, Node } from 'cc';
import { EventListener } from '../../GameEvent/EventListener';
import { GameEvent } from '../../GameEvent/GameEvent';
const { ccclass, property } = _decorator;

@ccclass( 'WinLoseController' )
export class WinLoseController extends Component
{
    @property( Node )
    winNode: Node = null;
    @property( Node )
    loseNode: Node = null;
    @property( Node )
    disableInput: Node = null;

    static instance: WinLoseController = null;

    protected onEnable (): void
    {
        WinLoseController.instance = this;
        EventListener.on( GameEvent.GameWin, this.onGameWin, this );
        EventListener.on( GameEvent.GameLose, this.onGameLose, this );
    }

    protected onDisable (): void
    {
        WinLoseController.instance = null;
        EventListener.off( GameEvent.GameWin, this.onGameWin, this );
        EventListener.off( GameEvent.GameLose, this.onGameLose, this );
    }

    onGameWin (): void
    {
        this.winNode.active = true;
    }

    onGameLose (): void
    {
        this.disableInput.active = true;
        this.scheduleOnce( () =>
        {
            this.loseNode.active = true;
        }, 1 );
    }
}


