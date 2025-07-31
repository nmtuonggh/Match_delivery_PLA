import { _decorator, Component, Node } from 'cc';
import { TrackingManager } from '../PlayableAds/Tracking/TrackingManager';
import { PlayableAdsManager } from '../PlayableAds/PlayableAdsManager';
const { ccclass, property } = _decorator;

@ccclass( 'WinPage' )
export class WinPage extends Component
{
    protected onEnable (): void
    {
        TrackingManager.WinLevel();
        this.scheduleOnce( () => {
            PlayableAdsManager.Instance().ForceOpenStore();
        }, 3 );
    }
    onclick (): void
    {
        PlayableAdsManager.Instance().OpenStore();
    }
}


