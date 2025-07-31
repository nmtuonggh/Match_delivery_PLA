import { _decorator, Component, director, Node, screen } from 'cc';
const { ccclass, property } = _decorator;
import { sys } from "cc"; 
import { PlayableAdsManager } from '../PlayableAdsManager';
import { ACTION_NAME, ACTION_TYPE, OBJECT, OPERATING_SYSTEM, RESULT, USER_RETURN } from './Tracker/Output/DefineEventStruct';

@ccclass('TrackingManager')
export class TrackingManager extends Component {
    static userPseudoID : string = "";

    static api_secret : string = `ymcwxS12SSi6IavS3-Jj-Q`;
    static firebase_app_id : string= `1:444377725360:android:b0bef9148a16a69aa27e75`;
    
    static currentScreen : string = "_level_1";
    static returnGame : USER_RETURN = USER_RETURN._false;
    static package_name : string = `com.ig.screwdom`;
    static os : OPERATING_SYSTEM = OPERATING_SYSTEM.NONE;
    protected onLoad(): void {
        TrackingManager.userPseudoID = this.generateUniqueString();
        TrackingManager.SetOS();
    }
    static SetOS(){
        switch (sys.os) {
            case sys.OS.ANDROID:
                this.os  = OPERATING_SYSTEM.ANDROID;
                break;
            case sys.OS.IOS:
                this.os  = OPERATING_SYSTEM.IOS;
                break;
            case sys.OS.WINDOWS:
                this.os  = OPERATING_SYSTEM.NONE;
                break;
        }
    }

    //#region LISTEN EVENT
    static gameStart(){
        this.LogEvent(ACTION_NAME._start, ACTION_TYPE._start);
    }

    static FirstClick(){
        this.LogEvent(ACTION_NAME._first_click, ACTION_TYPE._action);
    }

    static Click(){
        this.LogEvent(ACTION_NAME._click, ACTION_TYPE._action);
    }

    static UserEngagement(time : number){
        var fps = director.root.fps;
        this.LogEvent_Time(
            time.toFixed(2).toString(),
            fps.toString());
    }

    static WinLevel(){
        this.LogEvent_Result(RESULT._win);
        this.currentScreen = "_Win_Screen";
        this.LogEvent_ShowScreen();
        
        // setTimeout(() => {
        //     PlayableAdsManager.Instance().ForceOpenStore();
        // }, 3000);
    }

    static LoseLevel(){
        this.LogEvent_Result(RESULT._lose);
        this.currentScreen = "_Lose_Screen";
        this.LogEvent_ShowScreen();
        setTimeout(() => {
            PlayableAdsManager.Instance().ForceOpenStore();
        }, 3000);
    }

    static ClickConversion(){
        this.LogEvent_Button("_click");
        this.returnGame = USER_RETURN._true;
    }

    static ForceConversion(){
        TrackingManager.LogEvent_Button("_force");
        this.returnGame = USER_RETURN._true;
    }

    static Replay(){
        this.LogEvent_Button("_replay");
        this.returnGame = USER_RETURN._true;
    }
    
    //#endregion


    //#region LOG EVENT
    generateUniqueString(): string {
        const characters = 'abcdef0123456789';
        let randomStr = '';
        const charactersLength = characters.length;
        const currentTime = new Date().getTime();
        const timeString = currentTime.toString(16);
        const timeStringLength = timeString.length;
        for (let i = 0; i < 32 - timeStringLength; i++) {
            randomStr += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return timeString + randomStr;
    }
    static LogEvent(
        action_name : ACTION_NAME, 
        action_type : ACTION_TYPE,
        object : OBJECT = OBJECT.level_status)
        {
        var jsonInput = JSON.stringify({
            app_instance_id: this.userPseudoID,
            events: [{
                name: 'playable_level',
                params: {
                    "action_type": ACTION_TYPE[action_type], // "start", "action", "end"
                    "action_name": ACTION_NAME[action_name],
                    "screen": this.currentScreen,
                    "user_return": USER_RETURN[this.returnGame],
                    "object": OBJECT[object],
                    "playable_ad_id": PlayableAdsManager.Instance().playableAdsName,
                    "operating_system": OPERATING_SYSTEM[this.os],
                    "package_name": this.package_name,
                },
            }]
        });
        this.PostEvent(jsonInput);
    }
    static LogEvent_Result(
        result : RESULT,
        action_type : ACTION_TYPE = ACTION_TYPE._end, 
        action_name : ACTION_NAME = ACTION_NAME._finish,
        object : OBJECT = OBJECT.level_status)
        {
        var jsonInput = JSON.stringify({
            app_instance_id: this.userPseudoID,
            events: [{
                name: 'playable_level',
                params: {
                    "action_type": ACTION_TYPE[action_type], // "start", "action", "end"
                    "action_name": ACTION_NAME[action_name],
                    "screen": this.currentScreen,
                    "user_return": USER_RETURN[this.returnGame],
                    "result": RESULT[result],
                    "object": OBJECT[object],
                    "playable_ad_id": PlayableAdsManager.Instance().playableAdsName,
                    "operating_system": OPERATING_SYSTEM[this.os],
                    "package_name": this.package_name,
                    
                },
            }]
        });
        this.PostEvent(jsonInput);
    }

    static LogEvent_ShowScreen(
        action_type : ACTION_TYPE = ACTION_TYPE._action,
        action_name : ACTION_NAME = ACTION_NAME._show_screen,
        object : OBJECT = OBJECT.conversion)
        {
        var jsonInput = JSON.stringify({
            app_instance_id: this.userPseudoID,
            events: [{
                name: 'playable_level',
                params: {
                    "action_type": ACTION_TYPE[action_type], // "start", "action", "end"
                    "action_name": ACTION_NAME[action_name],
                    "screen": this.currentScreen,
                    "user_return": USER_RETURN[this.returnGame],
                    "object": OBJECT[object],
                    "playable_ad_id": PlayableAdsManager.Instance().playableAdsName,
                    "operating_system": OPERATING_SYSTEM[this.os],
                    "package_name": this.package_name,
                },
            }]
        });
        this.PostEvent(jsonInput);
    }

    
    static LogEvent_Button(
        button_name : string,
        action_type : ACTION_TYPE = ACTION_TYPE._action,
        action_name : ACTION_NAME = ACTION_NAME._click_conversion,
        object : OBJECT = OBJECT.conversion)
        {
        var jsonInput = JSON.stringify({
            app_instance_id: this.userPseudoID,
            events: [{
                name: 'playable_level',
                params: {
                    "action_type": ACTION_TYPE[action_type], // "start", "action", "end"
                    "action_name": ACTION_NAME[action_name],
                    "user_return": USER_RETURN[this.returnGame],
                    "screen": this.currentScreen,
                    "button_name" : button_name,
                    "object": OBJECT[object],
                    "playable_ad_id": PlayableAdsManager.Instance().playableAdsName,
                    "operating_system": OPERATING_SYSTEM[this.os],
                    "package_name": this.package_name,
                    
                },
            }]
        });
        this.PostEvent(jsonInput);
    }
    static LogEvent_Time(
        engagement_time : string,
        fps : string,
        action_type : ACTION_TYPE = ACTION_TYPE._action, 
        action_name : ACTION_NAME = ACTION_NAME._users_engagement, 
        object : OBJECT = OBJECT.users_engagement)
        {
        var jsonInput = JSON.stringify({
            app_instance_id: this.userPseudoID,
            events: [{
                name: 'playable_level',
                params: {
                    "action_type": ACTION_TYPE[action_type], // "start", "action", "end"
                    "action_name": ACTION_NAME[action_name],
                    "engagement_time": engagement_time,
                    "fps": fps,
                    "object": OBJECT[object],
                    "playable_ad_id": PlayableAdsManager.Instance().playableAdsName,
                    "operating_system": OPERATING_SYSTEM[this.os],
                    "package_name": this.package_name,
                    
                },
            }]
        });
        this.PostEvent(jsonInput);
    }
    static PostEvent(jsonInput : string){
        if(PlayableAdsManager.Instance().logDebug){
            var splitJsonInput = jsonInput.split(",");
            var result = "";
            for (let i = 0; i < splitJsonInput.length; i++) {
                result += splitJsonInput[i] + "\n";
            }
            console.log(result);
        }
        if(sys.os == sys.OS.WINDOWS || !PlayableAdsManager.Instance().activeTracking) return;
        fetch(`https://www.google-analytics.com/mp/collect?firebase_app_id=${this.firebase_app_id}&api_secret=${this.api_secret}`, {
            method: "POST",
            body: jsonInput
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
    }
    //#endregion
}
