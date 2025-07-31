import { _decorator, Component, director, EventKeyboard, Input, input, KeyCode, Node, Root } from 'cc';
const { ccclass, property } = _decorator;

class CreativeData{
    public event: string = '';
    public time : number = 0;
    public frame: number = 0;

}
@ccclass('CreativeDataRecord')
export class CreativeDataRecord extends Component {
    static instance: CreativeDataRecord;

    creativeDatasRecorded : CreativeData[] = [];
    currentTime: number = 0;
    onLoad () {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        CreativeDataRecord.instance = this;
        this.creativeDatasRecorded = [];
    }

    protected update(dt: number): void {
        this.currentTime += dt;
    }

    AddData(nameEvent : string) {
        //get current frame of the game
        var data = new CreativeData();
        data.event = nameEvent;
        data.time = this.getCurrentFrame();
        this.creativeDatasRecorded.push(data);
    }

    
    onKeyDown (event: EventKeyboard) {
        switch(event.keyCode) {
            case KeyCode.KEY_R:
                console.log('Record Data Successfull');
                this.ExportDataToCSV();
                break;
        }
    }


    ExportData() {
        const fileName = 'creative_data_record.txt';
        // change fileContent to json format
        var fileContent = JSON.stringify(this.creativeDatasRecorded, null, 2);
        fileContent += "{\n";
        fileContent = this.creativeDatasRecorded.map(data => `Event : "${data.event}", Time: ${data.time}`).join('\n');
        fileContent += "\n}";

        const blob = new Blob([fileContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('Data Exported to: ', fileName);
    }

    ExportDataToCSV() {
        // write the data to a csv file in windows, if the file already exists, overwrite it, if not, create it
        const fileName = 'creative_data_record.csv';
        var fileContent = 'Time,Event\n';
        fileContent += this.creativeDatasRecorded.map(data => `${data.time},${data.event}`).join('\n');

        const blob = new Blob([fileContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('Data Exported to: ', fileName);
    }

    getCurrentFrame() : number {
        this.currentTime = Math.round(this.currentTime * 10000) / 10000;
        return this.currentTime;
    }
}


