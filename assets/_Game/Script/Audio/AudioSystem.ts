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
    private pickObj: AudioClip = null;
    @property( { type: [ AudioClip ] } )
    private matchObj: AudioClip = null;
    @property( { type: [ AudioClip ] } )
    private doneOder: AudioClip = null;


    protected onLoad (): void
    {
        AudioSystem.instance = this;
    }
    public playPickObj ()
    {
        this.audioSource.playOneShot( this.pickObj );
    }

    public playMatchObj ()
    {
        this.audioSource.playOneShot( this.matchObj );
    }

    public playDoneOder ()
    {
        this.audioSource.playOneShot( this.doneOder );
    }
}


