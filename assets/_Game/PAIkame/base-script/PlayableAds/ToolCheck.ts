import { _decorator, Component, Node } from 'cc';
import { PlayableAdsManager } from './PlayableAdsManager';
const { ccclass, property } = _decorator;

@ccclass('ToolCheck')
export class ToolCheck extends Component {

    check : boolean = false;
    countClick : number = 0;
    maxClick : number = 10;

    // Sử dụng cho việc kiểm tra PA có vào store hay không, đặc biệt là trên Minteral
    // Để sử dụng, thêm component này vào node chứa button vào store, 
    // sau đó set maxClick = số lần click cần để vào store
    // Gắn lên góc trên bên trái của Canvas. Có thể set 200x200
    
    onClick(){
        this.countClick++;
        if(this.countClick >= this.maxClick){
            this.countClick = 0;
            PlayableAdsManager.Instance().OpenStore();
        }
    }
}


