import { _decorator, Enum, Game, game, Input, input } from 'cc';
import super_html_playable from './super_html_playable';
import { SingletonInSceneComponent } from '../Pattern/SingletonInSceneComponent';
import { TrackingManager } from './Tracking/TrackingManager';

const { ccclass, property } = _decorator;

@ccclass( 'PlayableAdsManager' )
export class PlayableAdsManager extends SingletonInSceneComponent
{
    urlPlayStore: string = "";
    urlAppStore: string = "";
    static instanceID: string = "PlayableAdsManager";
    playableAdsName: string = "iKame";

    readonly titleDefault: string = "Cocos Creator - MatchDelivery";

    network: string = "";

    @property
    activeTracking: boolean = false;
    @property
    logDebug: boolean = false;
    touchedSpecific: boolean;
    firstClicked: boolean = false;
    runningGame: boolean = true;

    replayGame: boolean = false;
    lose: boolean = false;

    onLoad (): void
    {
        this.SetLinkStore();
        const pageTitle = document.title;
        if ( pageTitle == this.titleDefault ) return;

        //Mở comment đoạn này để set lại biến titleDefault
        //console.log("Page Title: " + pageTitle);

        // Sau khi đã set lại biến titleDefault, mở comment đoạn này để lấy network

        const paName = pageTitle.split( "|" )[ 1 ].trim();
        this.network = window[ 'super_html_channel' ];
        this.playableAdsName = paName + "_" + this.network;

        if ( this.network == 'google' )
        {
            this.activeTracking = false;
        }
    }

    protected start (): void
    {
        TrackingManager.gameStart();
        game.on( Game.EVENT_RESUME, () => this.onGameResume() );
        game.on( Game.EVENT_PAUSE, () => this.onGamePause() );
        game.on( Game.EVENT_HIDE, () => this.onGameHide() );
    }
    onGameResume ()
    {
        this.runningGame = true;
        if ( this.logDebug )
        {
            console.log( "On Game Resume" );
        }
    }
    onGamePause ()
    {
        this.runningGame = false;
        if ( this.logDebug )
        {
            console.log( "On Game Pause" );
        }
    }
    onGameHide ()
    {
        this.runningGame = false;
        if ( this.logDebug )
        {
            console.log( "On Game Hide" );
        }
    }
    SetLinkStore ()
    {
        // Điều chỉnh lại link này theo từng dự án

        this.urlPlayStore = "https://play.google.com/store/apps/details?id=com.ig.match.delivery&hl=en";
        this.urlAppStore = "https://play.google.com/store/apps/details?id=com.ig.match.delivery&hl=en";
        super_html_playable.set_google_play_url( this.urlPlayStore );
        super_html_playable.set_app_store_url( this.urlAppStore );
        console.log( "iKame Playstore :" + this.urlPlayStore )
        console.log( "iKame AppStore:" + this.urlAppStore )

    }
    ActionFirstClicked ()
    {
        if ( !this.firstClicked )
        {
            TrackingManager.FirstClick();
            this.firstClicked = true;
            // Bật background Music sau lần đầu play PA. Đây là Policy của web nên bắt buộc phải follow.
            //AudioManager.instance.playBackgroundMusic();
            //AudioSystem.instance.playBGMusic();
        }

    }
    countTimeTracking: number = 3;
    totalTimePlay: number = 0;
    protected update ( dt: number ): void
    {
        if ( this.runningGame )
        {
            this.totalTimePlay += dt;
            this.countTimeTracking -= dt;
            if ( this.countTimeTracking <= 0 )
            {
                this.countTimeTracking = 3;
                TrackingManager.UserEngagement( this.totalTimePlay );
            }
        }
    }

    // Dùng khi click vào button vào store
    OpenStore ()
    {
        TrackingManager.ClickConversion();
        super_html_playable.download();
        super_html_playable.game_end();
    }

    // Dùng khi không click mà đẩy thẳng vào store
    ForceOpenStore ()
    {
        TrackingManager.ForceConversion();
        super_html_playable.download();
        super_html_playable.game_end();
    }
    //Replay
    Replay ()
    {
        TrackingManager.Replay();
    }
    static LogDebug ( message: string )
    {
        if ( PlayableAdsManager.Instance().logDebug )
        {
            console.log( message );
        }
    }
}


