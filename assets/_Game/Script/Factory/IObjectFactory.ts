import { Node, Vec3, Prefab } from 'cc';
import { ObjectType } from './ObjectType';

/**
 * Interface định nghĩa các phương thức cơ bản cho Object Factory
 */
export interface IObjectFactory {
    /**
     * Cài đặt prefab trực tiếp vào factory
     * @param type Loại object
     * @param prefab Prefab tương ứng với type
     */
    setPrefab(type: ObjectType, prefab: Prefab): void;
    /**
     * Khởi tạo factory với parent node
     * @param parent Node cha chứa các object được spawn
     */
    initialize(parent: Node): void;
    
    /**
     * Spawn một object theo type được chỉ định
     * @param type Loại object cần spawn
     * @param position Vị trí spawn (optional)
     * @returns Object được spawn
     */
    spawn(type: ObjectType, position?: Vec3): Promise<Node>;
    
    /**
     * Lấy một object từ pool nếu có, nếu không thì tạo mới
     * @param type Loại object cần lấy
     * @returns Object từ pool hoặc mới tạo
     */
    get(type: ObjectType): Promise<Node>;
    
    /**
     * Trả object về pool để tái sử dụng
     * @param node Object cần trả về pool
     * @param type Loại của object
     */
    recycle(node: Node, type: ObjectType): void;
    
    /**
     * Xóa toàn bộ objects và làm sạch pool
     */
    clear(): void;
}
