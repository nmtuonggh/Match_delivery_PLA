import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Helper')
export class Helper extends Component {
    
    // Hàm này sẽ trả về một số ngẫu nhiên từ min đến max
    static RandomRange(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    
    // Modify time to string
    

    
}


