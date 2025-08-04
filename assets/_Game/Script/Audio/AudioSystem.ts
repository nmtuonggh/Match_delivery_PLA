import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass( 'AudioSystem' )
export class AudioSystem extends Component
{
    static instance: AudioSystem = null;

    //#region AUDIO SOURCES
    @property( AudioSource )
    public audioSource: AudioSource = null;
    @property( Node )
    backgroundMusic: Node = null;
    //#endregion


    @property( { type: [ AudioClip ] } )
    private pickObj1: AudioClip = null;
    @property( { type: [ AudioClip ] } )
    private pickObj2: AudioClip = null;
    @property( { type: [ AudioClip ] } )
    private matchObj1: AudioClip = null;
    @property( { type: [ AudioClip ] } )
    private matchObj2: AudioClip = null;
    @property( { type: [ AudioClip ] } )
    private doneOder: AudioClip = null;
    @property( { type: [ AudioClip ] } )
    private oderChange: AudioClip = null;
    @property( { type: [ AudioClip ] } )
    private objOnShelf: AudioClip = null;
    @property( { type: [ AudioClip ] } )
    private loseGame: AudioClip = null;
    @property( { type: [ AudioClip ] } )
    private winGame: AudioClip = null;

    protected onLoad (): void
    {
        AudioSystem.instance = this;
    }


    public playBackgroundMusic ()
    {
        if ( this.backgroundMusic.active )
        {
            this.backgroundMusic.getComponent( AudioSource ).play();
        }
    }
    public playPickObj ()
    {
        this.audioSource.playOneShot( this.pickObj1 );
        //random pick obj
    }

    public playMatchObj ()
    {
        //random match obj
        let random = Math.random();
        if ( random < 0.5 )
        {
            this.audioSource.playOneShot( this.matchObj1 );
        }
        else
        {
            this.audioSource.playOneShot( this.matchObj2 );
        }
    }

    public playDoneOder ()
    {
        this.audioSource.playOneShot( this.doneOder );
    }

    public playOderChange ()
    {
        this.audioSource.playOneShot( this.oderChange );
    }

    public playObjOnShelf ()
    {
        this.audioSource.playOneShot( this.objOnShelf );
    }

    public playLoseGame ()
    {
        this.audioSource.playOneShot( this.loseGame );
    }

    public playWinGame ()
    {
        this.audioSource.playOneShot( this.winGame );
    }
}


