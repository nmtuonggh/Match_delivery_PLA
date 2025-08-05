import { _decorator, Component, Material, MeshRenderer, Node, Tween, tween, Vec3 } from 'cc';
import { PlayableAdsManager } from '../../PAIkame/base-script/PlayableAds/PlayableAdsManager';
import { Item } from '../Component/Object/Item';
import { BlinkingOutline } from '../Component/Effect/BlinkingOutline';
const { ccclass, property } = _decorator;

@ccclass( 'TutorialController' )
export class TutorialController extends Component
{
    @property( { type: Node } )
    public handNode: Node = null;
    @property( { type: Material } )
    public handMaterial1: Material = null;
    @property( { type: Material } )
    public handMaterial2: Material = null;
    public static instance: TutorialController;

    @property( { type: Node } )
    public targetNode: Node = null;
    @property( { type: Node } )
    public matchNode1: Node = null;
    @property( { type: Node } )
    public matchNode2: Node = null;
    @property( { type: Material } )
    public outlineMaterial: Material = null;
    @property( { type: Material } )
    public normalMaterial: Material = null;
    @property( { type: Vec3 } )
    public offsetPos: Vec3 = new Vec3( -5, -5, 0 );

    private firstClicked: boolean = false;
    onLoad ()
    {
        TutorialController.instance = this;
    }

    protected update ( dt: number ): void
    {
        if ( this.handNode )
        {
            this.handNode.setWorldPosition( this.targetNode.worldPosition );
        }
        if ( this.handNode.active === true && this.firstClicked )
        {
            this.handNode.active = false;
        }
    }

    public stopShowTutorial (): void
    {
        this.firstClicked = true;
        Tween.stopAllByTarget( this.handNode );
        this.handNode.active = false;
        Tween.stopAllByTarget( this.targetNode );
        Tween.stopAllByTarget( this.matchNode1 );
        Tween.stopAllByTarget( this.matchNode2 );
        this.turnOffOutline( this.targetNode );
        this.turnOffOutline( this.matchNode1 );
        this.turnOffOutline( this.matchNode2 );
    }

    protected start (): void
    {
        this.scheduleOnce( () =>
        {
            this.initTutorial();
        }, 2 );
    }

    initTutorial (): void
    {
        this.handNode.active = true;
        this.turnOnOutline( this.targetNode );
        this.turnOnOutline( this.matchNode1 );
        this.turnOnOutline( this.matchNode2 );
        tween( this.handNode.children[ 0 ].getComponent( MeshRenderer ) )
            .set( { material: this.handMaterial1 } )
            .delay( 0.75 )
            .set( { material: this.handMaterial2 } )
            .delay( 0.75 )
            .union()
            .repeatForever()
            .start();
    }

    turnOnOutline (node: Node): void
    {
        // Kiểm tra xem node đã có BlinkingOutline component chưa
        let blinkingOutline = node.getComponent(BlinkingOutline);
        
        if (!blinkingOutline) {
            // Thêm BlinkingOutline component nếu chưa có
            blinkingOutline = node.addComponent(BlinkingOutline);
            blinkingOutline.setMaterials(this.outlineMaterial, this.normalMaterial);
        }
        
        // Bắt đầu hiệu ứng nhấp nháy
        blinkingOutline.startBlinking();
    }

    turnOffOutline (node: Node): void
    {
        // Dừng tất cả tween cũ (để tương thích với code cũ)
        //Tween.stopAllByTarget(node);
        
        // Sử dụng BlinkingOutline component để dừng hiệu ứng
        const blinkingOutline = node.getComponent(BlinkingOutline);
        if (blinkingOutline) {
            blinkingOutline.stopBlinking();
        } else {
            // Fallback: set material trực tiếp nếu không có component
            let listMesh = node.getComponent(Item).getComponentsInChildren(MeshRenderer);
            for (let i = 0; i < listMesh.length; i++) {
                listMesh[i].material = this.normalMaterial;
            }
        }
    }
}


