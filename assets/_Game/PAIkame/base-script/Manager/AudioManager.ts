import { _decorator, AudioSource, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    @property({type : AudioSource})
    backgroundMusic : AudioSource = null;

    playBackgroundMusic(){
        this.backgroundMusic.play();
    }
}


