import { _decorator, Component, Node } from 'cc';
import { TrackingManager } from '../PlayableAds/Tracking/TrackingManager';
import { PlayableAdsManager } from '../PlayableAds/PlayableAdsManager';
const { ccclass, property } = _decorator;

@ccclass('LosePage')
export class LosePage extends Component {
    protected onEnable(): void {
        TrackingManager.LoseLevel();
    }

    onclick(): void {
        PlayableAdsManager.Instance().OpenStore();
    }
}


