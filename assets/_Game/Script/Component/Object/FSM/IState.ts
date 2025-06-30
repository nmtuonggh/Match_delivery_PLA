import { Item } from '../Item';

/**
 * Interface định nghĩa các hành vi chung cho tất cả các state trong hệ thống FSM của Item
 */
export interface IState {
    /**
     * Phương thức được gọi khi state được kích hoạt
     * @param item Instance của Item mà state này thuộc về
     */
    enter(item: Item): void;

    /**
     * Phương thức được gọi khi state bị hủy kích hoạt
     * @param item Instance của Item mà state này thuộc về
     */
    exit(item: Item): void;

    /**
     * Phương thức được gọi mỗi frame khi state đang được kích hoạt
     * @param item Instance của Item mà state này thuộc về
     * @param deltaTime Thời gian trôi qua từ frame trước
     */
    update(item: Item, deltaTime: number): void;

    /**
     * Tên của state, hữu ích cho debug và logging
     */
    getName(): string;
}
