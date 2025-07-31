import { _decorator, Component, Node, Prefab, instantiate, Vec3, Canvas, Camera, NodePool, Color, ParticleSystem2D, ParticleSystem } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Manager để xử lý spawn particle 2D và 3D
 * Cung cấp 2 hàm chính: spawn2DParticle và spawn3DParticle
 */
@ccclass( 'ParticleSpawnManager' )
export class ParticleSpawnManager extends Component
{

    //#region Editor fields
    @property( { type: [ Prefab ], tooltip: "Danh sách prefab particle 2D" } )
    public particle2DPrefabs: Prefab[] = [];

    @property( { type: [ Prefab ], tooltip: "Danh sách prefab particle 3D" } )
    public particle3DPrefabs: Prefab[] = [];

    @property( { type: Camera, tooltip: "Camera chính để convert vị trí" } )
    public mainCamera: Camera = null;

    @property( { type: Node, tooltip: "Canvas để add particle 2D" } )
    public canvas: Node = null;

    @property( { type: Node, tooltip: "Node container cho particle 3D" } )
    public worldContainer: Node = null;
    //#endregion

    //#region Singleton
    private static _instance: ParticleSpawnManager = null;

    public static get instance (): ParticleSpawnManager
    {
        return ParticleSpawnManager._instance;
    }
    //#endregion

    //#region Private fields
    private particle2DPool: Map<string, NodePool> = new Map();
    private particle3DPool: Map<string, NodePool> = new Map();
    private readonly INITIAL_POOL_SIZE: number = 20; // Số lượng node khởi tạo sẵn cho mỗi pool
    //#endregion

    //#region CC Methods
    protected onLoad (): void
    {
        ParticleSpawnManager._instance = this;
        this.initializePools();
    }

    protected onDestroy (): void
    {
        this.clearAllPools();
        if ( ParticleSpawnManager._instance === this )
        {
            ParticleSpawnManager._instance = null;
        }
    }
    //#endregion

    //#region Private Methods
    /**
     * Khởi tạo object pools cho các particle prefabs
     * Tạo sẵn INITIAL_POOL_SIZE node cho mỗi pool để tối ưu hiệu suất
     */
    private initializePools (): void
    {

        
        // Khởi tạo pool cho particle 2D
        this.particle2DPrefabs.forEach( ( prefab, index ) =>
        {
            if ( prefab )
            {
                const poolKey = `2D_${ index }`;
                const pool = new NodePool();
                
                // Tạo sẵn INITIAL_POOL_SIZE node cho pool
                for ( let i = 0; i < this.INITIAL_POOL_SIZE; i++ )
                {
                    const node = instantiate( prefab );
                    pool.put( node );
                }
                
                this.particle2DPool.set( poolKey, pool );

            }
        } );

        // Khởi tạo pool cho particle 3D
        this.particle3DPrefabs.forEach( ( prefab, index ) =>
        {
            if ( prefab )
            {
                const poolKey = `3D_${ index }`;
                const pool = new NodePool();
                
                // Tạo sẵn INITIAL_POOL_SIZE node cho pool
                for ( let i = 0; i < this.INITIAL_POOL_SIZE; i++ )
                {
                    const node = instantiate( prefab );
                    pool.put( node );
                }
                
                this.particle3DPool.set( poolKey, pool );

            }
        } );
        

    }

    /**
     * Dọn dẹp tất cả pools
     */
    private clearAllPools (): void
    {
        this.particle2DPool.forEach( pool => pool.clear() );
        this.particle3DPool.forEach( pool => pool.clear() );
        this.particle2DPool.clear();
        this.particle3DPool.clear();
    }

    /**
     * Lấy node từ pool hoặc tạo mới
     */
    private getNodeFromPool ( pool: NodePool, prefab: Prefab ): Node
    {
        let node = pool.get();
        if ( !node )
        {
            node = instantiate( prefab );
        }
        return node;
    }

    /**
     * Trả node về pool sau khi sử dụng
     */
    private returnNodeToPool ( pool: NodePool, node: Node ): void
    {
        if ( node && node.isValid )
        {
            pool.put( node );
        }
    }
    //#endregion

    //#region Public Methods
    public spawn2DParticle ( prefabIndex: number, worldPos: Vec3, duration: number = 5.0, color: Color = new Color( 255, 246, 0, 217 ) ): Node | null
    {
        // Kiểm tra tham số đầu vào
        if ( !this.isValidIndex( prefabIndex, this.particle2DPrefabs ) )
        {
            console.warn( `[ParticleSpawnManager] Invalid 2D prefab index: ${ prefabIndex }` );
            return null;
        }

        if ( !this.canvas || !this.mainCamera )
        {
            console.warn( `[ParticleSpawnManager] Canvas hoặc Camera chưa được thiết lập` );
            return null;
        }

        const prefab = this.particle2DPrefabs[ prefabIndex ];
        const poolKey = `2D_${ prefabIndex }`;
        const pool = this.particle2DPool.get( poolKey );

        if ( !pool )
        {
            console.warn( `[ParticleSpawnManager] Pool không tồn tại cho prefab index: ${ prefabIndex }` );
            return null;
        }
        const particleNode = this.getNodeFromPool( pool, prefab );
        this.canvas.addChild( particleNode );
        const uiPos = new Vec3();
        this.mainCamera.convertToUINode( worldPos, this.canvas, uiPos );
        particleNode.setPosition( uiPos );

        // Tự động destroy sau duration
        this.scheduleOnce( () =>
        {
            particleNode.removeFromParent();
            this.returnNodeToPool( pool, particleNode );
        }, duration );

        return particleNode;
    }

    /**
     * Spawn particle 3D tại vị trí world position
     * @param prefabIndex Index của prefab trong mảng particle3DPrefabs
     * @param worldPos Vị trí world để spawn particle
     * @param duration Thời gian tồn tại của particle (giây), mặc định 2 giây
     * @returns Node của particle được spawn
     */
    public spawn3DParticle ( prefabIndex: number, worldPos: Vec3, duration: number = 2.0 ): Node | null
    {
        // Kiểm tra tham số đầu vào
        if ( !this.isValidIndex( prefabIndex, this.particle3DPrefabs ) )
        {
            console.warn( `[ParticleSpawnManager] Invalid 3D prefab index: ${ prefabIndex }` );
            return null;
        }

        if ( !this.worldContainer )
        {
            console.warn( `[ParticleSpawnManager] World container chưa được thiết lập` );
            return null;
        }

        const prefab = this.particle3DPrefabs[ prefabIndex ];
        const poolKey = `3D_${ prefabIndex }`;
        const pool = this.particle3DPool.get( poolKey );

        if ( !pool )
        {
            console.warn( `[ParticleSpawnManager] Pool không tồn tại cho prefab index: ${ prefabIndex }` );
            return null;
        }

        // Tạo particle node
        const particleNode = this.getNodeFromPool( pool, prefab );

        // Add vào world container
        this.worldContainer.addChild( particleNode );

        // Set vị trí world
        particleNode.setWorldPosition( worldPos );

        // Tự động destroy sau duration
        this.scheduleOnce( () =>
        {
            if ( particleNode && particleNode.isValid )
            {
                particleNode.removeFromParent();
                this.returnNodeToPool( pool, particleNode );
            }
        }, duration );

        return particleNode;
    }

    private isValidIndex ( index: number, array: any[] ): boolean
    {
        return index >= 0 && index < array.length && array[ index ] != null;
    }

    /**
     * Lấy thống kê về các pool hiện tại
     * @returns Object chứa thông tin về pool
     */
    public getPoolStats(): { pool2D: any[], pool3D: any[], totalNodes: number } {
        const pool2DStats: any[] = [];
        const pool3DStats: any[] = [];
        let totalNodes = 0;

        // Thống kê pool 2D
        this.particle2DPool.forEach((pool, key) => {
            const availableNodes = pool.size();
            pool2DStats.push({ key, availableNodes });
            totalNodes += availableNodes;
        });

        // Thống kê pool 3D
        this.particle3DPool.forEach((pool, key) => {
            const availableNodes = pool.size();
            pool3DStats.push({ key, availableNodes });
            totalNodes += availableNodes;
        });

        return {
            pool2D: pool2DStats,
            pool3D: pool3DStats,
            totalNodes
        };
    }

    /**
     * In thống kê pool ra console
     */
    public logPoolStats(): void {
        const stats = this.getPoolStats();

    }

    /**
     * Điều chỉnh kích thước pool cho một prefab cụ thể
     * @param is2D true nếu là pool 2D, false nếu là pool 3D
     * @param prefabIndex Index của prefab
     * @param newSize Kích thước mới của pool
     */
    public adjustPoolSize(is2D: boolean, prefabIndex: number, newSize: number): void {
        const poolKey = `${is2D ? '2D' : '3D'}_${prefabIndex}`;
        const poolMap = is2D ? this.particle2DPool : this.particle3DPool;
        const prefabArray = is2D ? this.particle2DPrefabs : this.particle3DPrefabs;
        
        const pool = poolMap.get(poolKey);
        const prefab = prefabArray[prefabIndex];
        
        if (!pool || !prefab) {
            console.warn(`[ParticleSpawnManager] Pool hoặc prefab không tồn tại: ${poolKey}`);
            return;
        }

        const currentSize = pool.size();
        
        if (newSize > currentSize) {
            // Thêm node vào pool
            const nodesToAdd = newSize - currentSize;
            for (let i = 0; i < nodesToAdd; i++) {
                const node = instantiate(prefab);
                pool.put(node);
            }

        } else if (newSize < currentSize) {
            // Loại bỏ node khỏi pool
            const nodesToRemove = currentSize - newSize;
            for (let i = 0; i < nodesToRemove; i++) {
                const node = pool.get();
                if (node) {
                    node.destroy();
                }
            }

        }
    }

    public clearAllActiveParticles (): void
    {
        // Clear particle 2D
        if ( this.canvas )
        {
            const children = this.canvas.children.slice();
            children.forEach( child =>
            {
                if ( child.name.includes( 'Particle' ) || child.name.includes( 'Effect' ) )
                {
                    child.destroy();
                }
            } );
        }

        // Clear particle 3D
        if ( this.worldContainer )
        {
            const children = this.worldContainer.children.slice();
            children.forEach( child =>
            {
                if ( child.name.includes( 'Particle' ) || child.name.includes( 'Effect' ) )
                {
                    child.destroy();
                }
            } );
        }
    }
    //#endregion
}
