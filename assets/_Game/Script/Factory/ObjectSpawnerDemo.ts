import { _decorator, Component, Node, Vec3, Button, Prefab } from 'cc';
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

    @property( {
        type: Prefab,
        tooltip: 'Cube Prefab'
    } )
    private cubePrefab: Prefab = null;

    @property( {
        type: Prefab,
        tooltip: 'Sphere Prefab'
    } )
    private spherePrefab: Prefab = null;

    @property( {
        type: Prefab,
        tooltip: 'Apple Prefab'
    } )
    private applePrefab: Prefab = null;
    start ()
    {
        // Khởi tạo Factory với container làm parent node
        ObjectFactory.instance.initialize( this.objectContainer );

        // Đăng ký prefab với Factory
        if ( this.cubePrefab )
        {
            ObjectFactory.instance.setPrefab( ObjectType.CUBE, this.cubePrefab );
        }

        if ( this.spherePrefab )
        {
            ObjectFactory.instance.setPrefab( ObjectType.SPHERE, this.spherePrefab );
        }

        if ( this.applePrefab )
        {
            ObjectFactory.instance.setPrefab( ObjectType.APPLE, this.applePrefab );
        }

        // Khởi tạo map để lưu trữ các object đã spawn
        this.spawnedObjects.set( ObjectType.CUBE.toString(), [] );
        this.spawnedObjects.set( ObjectType.SPHERE.toString(), [] );
        this.spawnedObjects.set( ObjectType.APPLE.toString(), [] );

        // Thiết lập các button events
        if ( this.spawnCubeBtn )
        {
            this.spawnCubeBtn.node.on( Button.EventType.CLICK, this.onSpawnCube, this );
        }

        if ( this.spawnSphereBtn )
        {
            this.spawnSphereBtn.node.on( Button.EventType.CLICK, this.onSpawnSphere, this );
        }

        if ( this.clearBtn )
        {
            this.clearBtn.node.on( Button.EventType.CLICK, this.onClearObjects, this );
        }
    }

    onDestroy ()
    {
        // Hủy các event listeners khi component bị destroy
        if ( this.spawnCubeBtn )
        {
            this.spawnCubeBtn.node.off( Button.EventType.CLICK, this.onSpawnCube, this );
        }

        if ( this.spawnSphereBtn )
        {
            this.spawnSphereBtn.node.off( Button.EventType.CLICK, this.onSpawnSphere, this );
        }

        if ( this.clearBtn )
        {
            this.clearBtn.node.off( Button.EventType.CLICK, this.onClearObjects, this );
        }

        // Clear factory
        ObjectFactory.instance.clear();
    }

    /**
     * Spawn cube tại vị trí ngẫu nhiên
     */
    async onSpawnCube ()
    {
        for ( let i = 0; i < 10; i++ )
        {
            let position = this.getRandomPosition();
            const cube = await ObjectFactory.instance.spawn( ObjectType.CUBE, position );

            if ( cube )
            {
                console.log( 'Đã spawn Cube tại', position );
                this.spawnedObjects.get( ObjectType.CUBE.toString() ).push( cube );
            }
        }

        for ( let i = 0; i < 10; i++ )
        {
            let position = this.getRandomPosition();
            const apple = await ObjectFactory.instance.spawn( ObjectType.APPLE, position );

            if ( apple )
            {
                console.log( 'Đã spawn Apple tại', position );
                this.spawnedObjects.get( ObjectType.APPLE.toString() ).push( apple );
            }
        }

    }

    /**
     * Spawn sphere tại vị trí ngẫu nhiên
     */
    async onSpawnSphere ()
    {
        for ( let i = 0; i < 10; i++ )
        {
            let position = this.getRandomPosition();
            const sphere = await ObjectFactory.instance.spawn( ObjectType.SPHERE, position );

            if ( sphere )
            {
                console.log( 'Đã spawn Sphere tại', position );
                this.spawnedObjects.get( ObjectType.SPHERE.toString() ).push( sphere );
            }
        }
    }

    /**
     * Spawn apple tại vị trí ngẫu nhiên
     */
    async onSpawnApple ()
    {
        for ( let i = 0; i < 10; i++ )
        {
            let position = this.getRandomPosition();
            const apple = await ObjectFactory.instance.spawn( ObjectType.APPLE, position );

            if ( apple )
            {
                console.log( 'Đã spawn Apple tại', position );
                this.spawnedObjects.get( ObjectType.APPLE.toString() ).push( apple );
            }
        }
    }

    /**
     * Clear tất cả objects đã spawn và recycle chúng
     */
    onClearObjects ()
    {
        // Recycle tất cả các cube
        const cubes = this.spawnedObjects.get( ObjectType.CUBE.toString() );
        cubes.forEach( cube =>
        {
            ObjectFactory.instance.recycle( cube, ObjectType.CUBE );
        } );
        cubes.length = 0;

        // Recycle tất cả các sphere
        const spheres = this.spawnedObjects.get( ObjectType.SPHERE.toString() );
        spheres.forEach( sphere =>
        {
            ObjectFactory.instance.recycle( sphere, ObjectType.SPHERE );
        } );
        spheres.length = 0;

        console.log( 'Đã clear và recycle tất cả objects' );
    }

    /**
     * Tạo vị trí ngẫu nhiên trong phạm vi container
     */
    private getRandomPosition (): Vec3
    {
        const x = ( Math.random() - 0.5 ) * 10;
        const y = 6;
        const z = ( Math.random() - 0.5 ) * 10;
        return new Vec3( x, y, z );
    }
}
