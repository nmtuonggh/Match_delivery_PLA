import { _decorator, Camera, Component, EventTouch, geometry, Input, input, log, Material, MeshRenderer, Node, PhysicsSystem } from 'cc';
import { Item } from '../Component/Object/Item';
import { ShelfContainer } from '../Component/Shelf/ShelfContainer';
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
        if ( this.currentItem && !ShelfContainer.instance.isMatching )
        {
            this.currentItem.getComponent( Item ).moveToShelf();
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
        // Thực hiện raycast kiểm tra va chạm
        if ( PhysicsSystem.instance )
        {
            const maxDistance = 100; // Khoảng cách tối đa cho raycast
            const mask = 0xffffffff; // Bật tất cả các layer 

            // Sử dụng raycast query và kiểm tra kết quả
            if ( PhysicsSystem.instance.raycastClosest( ray, mask, maxDistance, false ) )
            {
                const result = PhysicsSystem.instance.raycastClosestResult;

                // Kiểm tra có kết quả nào không
                if ( result )
                {
                    // Lấy hit gần nhất (kết quả đầu tiên)
                    const hitNode = result.collider.node;
                    const interactableObj = hitNode.getComponent( Item );

                    if ( interactableObj )
                    {
                        if ( this.currentItem !== hitNode )
                        {
                            this.stopPick( this.currentItem );
                            if ( !ShelfContainer.instance.isFullSlot() )
                            {
                                this.currentItem = hitNode;
                                log( 'Đã chọn object:', hitNode.name );
                                interactableObj.pick();
                                this.turnOnOutline( hitNode );
                            }
                        }
                        return;
                    }
                }
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
        }
    }
}


