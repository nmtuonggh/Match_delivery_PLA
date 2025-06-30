import { Node, Vec3, instantiate, Prefab, resources } from 'cc';
import { IObjectFactory } from './IObjectFactory';
import { ObjectType } from './ObjectType';

/**
 * ObjectFactory - lớp triển khai IObjectFactory với hệ thống object pooling
 */
export class ObjectFactory implements IObjectFactory {
    private static _instance: ObjectFactory = null;
    
    // Prefab cache
    private _prefabCache: Map<string, Prefab> = new Map();
    
    private _parentNode: Node = null;
    private _pools: Map<string, Node[]> = new Map();
    
    /**
     * Singleton pattern getter
     */
    public static get instance(): ObjectFactory {
        if (!this._instance) {
            this._instance = new ObjectFactory();
        }
        return this._instance;
    }
    
    /**
     * Khởi tạo factory với parent node
     * @param parent Node cha chứa các object được spawn
     */
    public initialize(parent: Node): void {
        this._parentNode = parent;
        this._pools.clear();
        this._prefabCache.clear();
    }
    
    /**
     * Cài đặt prefab trực tiếp vào factory (sử dụng trong trường hợp đã có sẵn prefab)
     * @param type Loại object
     * @param prefab Prefab tương ứng với type
     */
    public setPrefab(type: ObjectType, prefab: Prefab): void {
        if (prefab) {
            this._prefabCache.set(type.toString(), prefab);
        } else {
            console.warn(`[ObjectFactory] Prefab for ${type} is null`);
        }
    }
    
    /**
     * Spawn một object theo type được chỉ định
     * @param type Loại object cần spawn
     * @param position Vị trí spawn (optional)
     * @returns Object được spawn
     */
    public async spawn(type: ObjectType, position?: Vec3): Promise<Node> {
        const node = await this.get(type);
        
        if (node) {
            // Thiết lập vị trí nếu có
            if (position) {
                node.setPosition(position);
            }
            
            // Kích hoạt node
            node.active = true;
        }
        
        return node;
    }
    
    /**
     * Lấy một object từ pool nếu có, nếu không thì tạo mới
     * @param type Loại object cần lấy
     * @returns Object từ pool hoặc mới tạo
     */
    public async get(type: ObjectType): Promise<Node> {
        const typeKey = type.toString();
        
        // Tạo pool nếu chưa có
        if (!this._pools.has(typeKey)) {
            this._pools.set(typeKey, []);
        }
        
        const pool = this._pools.get(typeKey);
        
        // Kiểm tra xem có object nào trong pool không
        if (pool.length > 0) {
            return pool.pop();
        }
        
        // Không có object trong pool, tạo mới
        return await this._createNewObject(type);
    }
    
    /**
     * Trả object về pool để tái sử dụng
     * @param node Object cần trả về pool
     * @param type Loại của object
     */
    public recycle(node: Node, type: ObjectType): void {
        if (!node) {
            return;
        }
        
        // Vô hiệu hóa node
        node.active = false;
        
        // Reset transformations nếu cần
        node.setPosition(0, 0, 0);
        node.setRotation(0, 0, 0, 1);
        node.setScale(1, 1, 1);
        
        // Thêm vào pool tương ứng
        const typeKey = type.toString();
        if (!this._pools.has(typeKey)) {
            this._pools.set(typeKey, []);
        }
        
        this._pools.get(typeKey).push(node);
    }
    
    /**
     * Xóa toàn bộ objects và làm sạch pool
     */
    public clear(): void {
        // Xóa tất cả các node trong pools
        this._pools.forEach((nodes, type) => {
            nodes.forEach(node => {
                node.removeFromParent();
                node.destroy();
            });
        });
        
        // Reset pools
        this._pools.clear();
    }
    
    /**
     * Tạo object mới từ prefab
     * @param type Loại object cần tạo
     * @returns Object mới được tạo
     */
    private async _createNewObject(type: ObjectType): Promise<Node> {
        const typeKey = type.toString();
        const prefabPath = `_Game/Prefab/${typeKey}`;
        
        try {
            // Kiểm tra xem có trong cache không
            let prefab = this._prefabCache.get(typeKey);
            
            // Nếu chưa có trong cache, thử load từ resources
            if (!prefab) {
                prefab = await this._loadPrefab(prefabPath);
                if (prefab) {
                    this._prefabCache.set(typeKey, prefab);
                } else {
                    console.error(`[ObjectFactory] Không tìm thấy prefab cho loại: ${typeKey}`);
                    return null;
                }
            }
            
            // Instantiate prefab
            const node = instantiate(prefab);
            
            if (this._parentNode) {
                node.parent = this._parentNode;
            }
            
            return node;
        } catch (error) {
            console.error(`[ObjectFactory] Lỗi khi tạo object ${typeKey}: ${error}`);
            return null;
        }
    }
    
    /**
     * Load prefab từ resources
     * @param path Đường dẫn đến prefab
     * @returns Prefab đã load
     */
    private _loadPrefab(path: string): Promise<Prefab> {
        return new Promise((resolve, reject) => {
            resources.load(path, Prefab, (err, prefab) => {
                if (err) {
                    console.warn(`[ObjectFactory] Lỗi khi load prefab ${path}: ${err}`);
                    reject(err);
                    return;
                }
                resolve(prefab);
            });
        });
    }
}
