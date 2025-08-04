import { _decorator, Camera, Color, Component, EventTouch, geometry, Input, input, log, Material, MeshRenderer, Node, PhysicsSystem, Vec3 } from 'cc';
import { Item, ItemType } from '../Component/Object/Item';
import { ShelfContainer } from '../Component/Shelf/ShelfContainer';
import { ParticleSpawnManager } from '../Manager/ParticleSpawnManager';
import { PlayableAdsManager } from '../../PAIkame/base-script/PlayableAds/PlayableAdsManager';
const { ccclass, property } = _decorator;

@ccclass( 'PickObjHandler' )
export class PickObjHandler extends Component
{
    @property( { type: Camera, group: 'Reference' } )
    private camera: Camera;
    @property( { type: Material, group: 'Reference' } )
    private outlineMaterial: Material;
    @property( { type: Material, group: 'Reference' } )
    private defaultMaterial: Material;

    private currentItem: Node = null;
    private lastRaycastItem: Node = null; // Item cuối cùng được raycast kiểm tra

    public static instance: PickObjHandler;

    onLoad ()
    {
        PickObjHandler.instance = this;
    }

    start ()
    {
        input.on( Input.EventType.TOUCH_START, this.onTouchStart, this );
        input.on( Input.EventType.TOUCH_MOVE, this.onTouchMove, this );
        input.on( Input.EventType.TOUCH_END, this.onTouchEnd, this );
        input.on( Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this );
    }

    onTouchStart ( event: EventTouch )
    {
        const ray = this.createRay( event );
        this.checkRaycastHit( ray );
        PlayableAdsManager.Instance().ActionFirstClicked();
    }

    onTouchMove ( event: EventTouch )
    {
        const ray = this.createRay( event );
        this.checkRaycastHit( ray );
    }

    onTouchEnd ( event: EventTouch )
    {
        // Xóa object hiện tại khi kết thúc chạm
        // this.stopPick(this.currentItem);
        if ( this.currentItem )
        {
            if ( ShelfContainer.instance.currentPickedTotalCount >= ShelfContainer.instance.listShelfRender.length )
            {
                this.currentItem.getComponent( Item ).drop();
                this.turnOffOutline( this.currentItem );
                this.currentItem = null;
            }
            else
            {
                this.currentItem.getComponent( Item ).moveToShelf();
            }
        }
        this.currentItem = null;
    }

    private createRay ( event: EventTouch ): geometry.Ray
    {
        const ray = new geometry.Ray();
        this.camera.screenPointToRay( event.getLocationX(), event.getLocationY(), ray );
        return ray;
    }

    private checkRaycastHit ( ray: geometry.Ray ): void
    {
        if ( PhysicsSystem.instance )
        {
            const maxDistance = 100; // Khoảng cách tối đa cho raycast
            const mask = 1 << 2; // Bật tất cả các layer 
            if ( PhysicsSystem.instance.raycastClosest( ray, mask, maxDistance, false ) )
            {
                const result = PhysicsSystem.instance.raycastClosestResult;
                if ( result )
                {
                    const hitNode = result.collider.node;

                    const interactableObj = hitNode.getComponent( Item );

                    if ( interactableObj )
                    {
                        if ( this.currentItem !== hitNode )
                        {
                            this.stopPick( this.currentItem );
                            this.currentItem = hitNode;
                            interactableObj.pick();
                            this.turnOnOutline( hitNode );
                        }
                        return;
                    }
                    else
                    {
                        console.log( 'Không tìm thấy component Item' );
                    }
                }
                else
                {
                    this.stopPick( this.currentItem );
                }
            }
            else
            {
                this.stopPick( this.currentItem );
            }
        }
    }

    turnOnOutline ( obj: Node ): void
    {
        if ( obj )
        {
            obj.getComponentsInChildren( MeshRenderer ).forEach( ( meshRenderer ) =>
            {
                meshRenderer.material = this.outlineMaterial;
            } );
        }
    }

    turnOffOutline ( obj: Node ): void
    {
        if ( obj )
        {
            obj.getComponentsInChildren( MeshRenderer ).forEach( ( meshRenderer ) =>
            {
                meshRenderer.material = this.defaultMaterial;
            } );
        }
    }

    stopPick ( obj: Node ): void
    {
        if ( obj )
        {
            obj.getComponent( Item ).drop();
            this.turnOffOutline( obj );
            this.currentItem = null;
        }
    }

    spawnPickParticle ( currentItem: Node ): void
    {
        let index = 0;
        switch ( currentItem.getComponent( Item ).itemType )
        {
            case ItemType.Lemon:
                index = 0;
                break;
            case ItemType.Watermelon:
                index = 1;
                break;
            case ItemType.StrongBerry:
                index = 2;
                break;
        }
        ParticleSpawnManager.instance.spawn2DParticle( index, currentItem.worldPosition, 5 );
    }
}


