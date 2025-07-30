import { _decorator, Component, Node, Vec3, Button, Prefab, randomRange } from 'cc';
import { ObjectFactory } from './ObjectFactory';
import { ObjectType } from './ObjectType';

const { ccclass, property } = _decorator;

/**
 * Demo minh họa cách sử dụng ObjectFactory để spawn các object
 */
@ccclass( 'ObjectSpawnerDemo' )
export class ObjectSpawnerDemo extends Component
{
    @property( {
        type: Node,
        tooltip: 'Container chứa các object được spawn'
    } )
    private objectContainer: Node = null;

    @property( {
        type: Button,
        tooltip: 'Button để spawn Cube'
    } )
    private spawnCubeBtn: Button = null;

    @property( {
        type: Button,
        tooltip: 'Button để spawn Sphere'
    } )
    private spawnSphereBtn: Button = null;

    @property( {
        type: Button,
        tooltip: 'Button để clear tất cả objects'
    } )
    private clearBtn: Button = null;

    // Lưu trữ các object đã spawn để có thể recycle sau này
    private spawnedObjects: Map<string, Node[]> = new Map();

    // Mảng lưu trữ các loại prefab cần spawn
    private prefabsToSpawn: { type: ObjectType, prefab: Prefab }[] = [];

    // Sử dụng mảng prefabs để quản lý tất cả các prefab một cách linh hoạt
    @property( {
        type: [ Prefab ],
        tooltip: 'Danh sách các prefab'
    } )
    private prefabs: Prefab[] = [];

    @property( {
        type: [ String ],
        tooltip: 'Tên tương ứng với các prefab (phải khớp với ObjectType)'
    } )
    private prefabNames: string[] = [];

    // Các biến điều khiển chọn đối tượng spawn
    @property( {
        type: [ Number ],
        tooltip: 'Vị trí index của các đối tượng cần spawn'
    } )
    private indexObj: number[] = [];

    @property( {
        type: [ Number ],
        tooltip: 'Số lượng spawn tương ứng với từng indexObj'
    } )
    private spawnCount: number[] = [];

    @property( {
        tooltip: 'Nếu true, spawn tất cả các loại đối tượng'
    } )
    private spawnAll: boolean = false;

    @property( {
        tooltip: 'Số lượng spawn cho mỗi loại nếu spawnAll = true',
        visible: function () { return this.spawnAll; }
    } )
    private spawnAllCount: number = 10;



    start ()
    {
        this.init();

        // Thiết lập các button events
        if ( this.spawnCubeBtn )
        {
            // Nút spawn tất cả các loại đối tượng
            this.spawnCubeBtn.node.on( Button.EventType.CLICK, this.onSpawnObj, this );
        }

        if ( this.clearBtn )
        {
            // Nút xóa tất cả các đối tượng
            this.clearBtn.node.on( Button.EventType.CLICK, this.onClearObjects, this );
        }
    }

    init ()
    {
        ObjectFactory.instance.initialize( this.objectContainer );

        if ( this.prefabs.length !== this.prefabNames.length )
        {
            console.error( 'Số lượng prefab và tên không khớp nhau!' );
            return;
        }

        for ( let i = 0; i < this.prefabs.length; i++ )
        {
            const prefab = this.prefabs[ i ];
            const typeName = this.prefabNames[ i ];

            // Kiểm tra prefab và tên hợp lệ
            if ( !prefab || !typeName ) continue;

            // Chuyển tên thành ObjectType
            const objType = typeName as unknown as ObjectType;

            // Đăng ký prefab với Factory
            ObjectFactory.instance.setPrefab( objType, prefab );

            // Thêm vào mảng prefabsToSpawn
            this.prefabsToSpawn.push( { type: objType, prefab: prefab } );

            // Khởi tạo mảng cho loại đối tượng này trong spawnedObjects
            this.spawnedObjects.set( objType.toString(), [] );
        }
    }

    @property()
    private get MakeMap2 () { return false }
    private set MakeMap2 ( value: boolean )
    {
        let oldChilds = this.objectContainer.children;
        for ( let i = 0; i < oldChilds.length; i++ )
        {
            oldChilds[ i ].destroy();
        }

        this.onspawnSingleObj();
    }

    async onSpawnAllObj ()
    {
        this.init();
        console.log( `Spawn tất cả các loại đối tượng, mỗi loại ${ this.spawnAllCount } cái` );

        for ( const prefabInfo of this.prefabsToSpawn )
        {
            for ( let i = 0; i < this.spawnAllCount; i++ )
            {
                let position = this.getRandomPosition();
                const obj = await ObjectFactory.instance.spawn( prefabInfo.type, position );

                if ( obj )
                {
                    console.log( `Đã spawn ${ prefabInfo.type } tại`, position );
                    this.spawnedObjects.get( prefabInfo.type.toString() ).push( obj );
                }
            }
        }
    }

    async onspawnSingleObj ()
    {
        this.init();

        if ( this.indexObj.length !== this.spawnCount.length )
        {
            console.error( 'Số lượng indexObj và spawnCount không khớp!' );
            return;
        }

        // Duyệt qua từng cặp indexObj và spawnCount
        for ( let i = 0; i < this.indexObj.length; i++ )
        {
            const index = this.indexObj[ i ];
            const count = this.spawnCount[ i ];

            // Kiểm tra index hợp lệ
            if ( index < 0 || index >= this.prefabsToSpawn.length )
            {
                console.error( `Index không hợp lệ: ${ index }` );
                continue;
            }

            // Lấy prefab info tương ứng
            const prefabInfo = this.prefabsToSpawn[ index ];

            // Spawn đối tượng với số lượng cấu hình
            for ( let j = 0; j < count; j++ )
            {
                let position = this.getRandomPosition();
                const obj = await ObjectFactory.instance.spawn( prefabInfo.type, position );

                if ( obj )
                {
                    console.log( `Đã spawn ${ prefabInfo.type } tại`, position );
                    this.spawnedObjects.get( prefabInfo.type.toString() ).push( obj );
                }
            }
        }
    }


    onDestroy ()
    {
        // Hủy các event listeners khi component bị destroy
        if ( this.spawnCubeBtn )
        {
            this.spawnCubeBtn.node.off( Button.EventType.CLICK, this.onSpawnObj, this );
        }

        if ( this.clearBtn )
        {
            this.clearBtn.node.off( Button.EventType.CLICK, this.onClearObjects, this );
        }

        // Clear factory
        ObjectFactory.instance.clear();
    }

    /**
     * Spawn đối tượng theo cấu hình đã chọn
     */
    async onSpawnObj ()
    {
        if ( this.spawnAll )
        {
            // Nếu chọn spawn tất cả, spawn mỗi loại đối tượng với số lượng spawnAllCount
            console.log( `Spawn tất cả các loại đối tượng, mỗi loại ${ this.spawnAllCount } cái` );

            for ( const prefabInfo of this.prefabsToSpawn )
            {
                for ( let i = 0; i < this.spawnAllCount; i++ )
                {
                    let position = this.getRandomPosition();
                    const obj = await ObjectFactory.instance.spawn( prefabInfo.type, position );

                    if ( obj )
                    {
                        console.log( `Đã spawn ${ prefabInfo.type } tại`, position );
                        this.spawnedObjects.get( prefabInfo.type.toString() ).push( obj );
                    }
                }
            }
        }
        else
        {
            // Nếu không chọn spawn tất cả, spawn theo indexObj và spawnCount
            console.log( 'Spawn theo cấu hình indexObj và spawnCount' );

            // Kiểm tra số lượng index và count có khớp nhau không
            if ( this.indexObj.length !== this.spawnCount.length )
            {
                console.error( 'Số lượng indexObj và spawnCount không khớp!' );
                return;
            }

            // Duyệt qua từng cặp indexObj và spawnCount
            for ( let i = 0; i < this.indexObj.length; i++ )
            {
                const index = this.indexObj[ i ];
                const count = this.spawnCount[ i ];

                // Kiểm tra index hợp lệ
                if ( index < 0 || index >= this.prefabsToSpawn.length )
                {
                    console.error( `Index không hợp lệ: ${ index }` );
                    continue;
                }

                // Lấy prefab info tương ứng
                const prefabInfo = this.prefabsToSpawn[ index ];

                // Spawn đối tượng với số lượng cấu hình
                for ( let j = 0; j < count; j++ )
                {
                    let position = this.getRandomPosition();
                    const obj = await ObjectFactory.instance.spawn( prefabInfo.type, position );

                    if ( obj )
                    {
                        console.log( `Đã spawn ${ prefabInfo.type } tại`, position );
                        this.spawnedObjects.get( prefabInfo.type.toString() ).push( obj );
                    }
                }
            }
        }
    }

    /**
     * Spawn một loại đối tượng cụ thể tại vị trí ngẫu nhiên
     * @param objectType Loại đối tượng cần spawn
     */
    async onSpawnSpecificType ( objectType: ObjectType )
    {
        // Tìm prefab info cho loại đối tượng được yêu cầu
        const prefabInfo = this.prefabsToSpawn.find( p => p.type === objectType );
        if ( !prefabInfo )
        {
            console.error( `Không tìm thấy prefab cho loại: ${ objectType }` );
            return;
        }

        for ( let i = 0; i < 10; i++ )
        {
            let position = this.getRandomPosition();
            const obj = await ObjectFactory.instance.spawn( objectType, position );

            if ( obj )
            {
                console.log( `Đã spawn ${ objectType } tại`, position );
                this.spawnedObjects.get( objectType.toString() ).push( obj );
            }
        }
    }

    /**
     * Clear tất cả objects đã spawn và recycle chúng
     */
    onClearObjects ()
    {
        // Recycle tất cả các loại đối tượng
        for ( const prefabInfo of this.prefabsToSpawn )
        {
            const objects = this.spawnedObjects.get( prefabInfo.type.toString() );
            if ( objects && objects.length > 0 )
            {
                objects.forEach( obj =>
                {
                    ObjectFactory.instance.recycle( obj, prefabInfo.type );
                } );
                objects.length = 0;
            }
        }

        console.log( 'Đã clear và recycle tất cả objects' );
    }

    /**
     * Tạo vị trí ngẫu nhiên trong phạm vi container
     */
    private getRandomPosition (): Vec3
    {
        const x = ( Math.random() - 0.5 ) * 10;
        const y = randomRange( 2, 8 );
        const z = ( Math.random() - 0.5 ) * 10;
        return new Vec3( x, y, z );
    }
}
