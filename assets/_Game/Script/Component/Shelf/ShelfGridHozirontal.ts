import { _decorator, Component, Node, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ShelfGridHozirontal')
export class ShelfGridHozirontal extends Component {
    @property(Number)
    spacing: number = 10; // Khoảng cách giữa các phần tử

    @property(Number)
    paddingLeft: number = 0; // Khoảng cách từ mép trái

    @property(Number)
    paddingRight: number = 0; // Khoảng cách từ mép phải

    @property(Boolean)
    alignCenter: boolean = true; // Căn giữa các phần tử

    @property(Boolean)
    autoArrangeOnStart: boolean = true; // Tự động căn chỉnh khi khởi tạo
    
    private refreshFlag: boolean = false;
    
    @property({tooltip: "Tích vào để tự động căn chỉnh layout trong Editor"})
    public set RefreshLayout(value: boolean) {
        if (!this.refreshFlag) {
            this.refreshFlag = value;
            this.refreshEditorLayout();
        }
        this.refreshFlag = false;
    }
    
    public get RefreshLayout(): boolean {
        return this.refreshFlag;
    }

    private _totalWidth: number = 0; // Tổng chiều rộng của container
    private _childrenWidths: number[] = []; // Mảng lưu chiều rộng của các node con

    start() {
        if (this.autoArrangeOnStart) {
            this.arrangeChildren();
        }
    }

    /**
     * Phương thức công khai để căn chỉnh các node con
     */
    public arrangeChildren(): void {
        if (!this.node || this.node.children.length === 0) return;

        this._calculateSizes();
        this._arrangeChildrenHorizontally();
    }

    /**
     * Tính toán kích thước tổng và kích thước của từng phần tử
     */
    private _calculateSizes(): void {
        const uiTransform = this.node.getComponent(UITransform);
        if (!uiTransform) return;

        this._totalWidth = uiTransform.width - this.paddingLeft - this.paddingRight;
        this._childrenWidths = [];

        // Tính toán chiều rộng của từng node con
        let visibleChildrenCount = 0;
        for (let i = 0; i < this.node.children.length; i++) {
            const child = this.node.children[i];
            if (!child.active) continue;

            const childTransform = child.getComponent(UITransform);
            if (childTransform) {
                this._childrenWidths.push(childTransform.width);
                visibleChildrenCount++;
            } else {
                this._childrenWidths.push(0);
            }
        }

        // Nếu không có phần tử nào hiển thị, thoát
        if (visibleChildrenCount === 0) return;
    }

    /**
     * Căn chỉnh các node con theo chiều ngang
     */
    private _arrangeChildrenHorizontally(): void {
        const visibleChildren = this.node.children.filter(child => child.active);
        if (visibleChildren.length === 0) return;

        // Tính tổng chiều rộng của tất cả các phần tử và khoảng cách
        let totalChildrenWidth = 0;
        for (const width of this._childrenWidths) {
            totalChildrenWidth += width;
        }

        // Khoảng cách giữa các phần tử
        const totalSpacingWidth = this.spacing * (visibleChildren.length - 1);

        // Tính khoảng cách bắt đầu từ mép trái
        let startX: number;
        if (this.alignCenter) {
            // Nếu căn giữa, tính toán vị trí bắt đầu để căn giữa tất cả phần tử
            startX = -totalChildrenWidth / 2 - totalSpacingWidth / 2;
        } else {
            // Nếu không căn giữa, bắt đầu từ mép trái + padding
            startX = -this._totalWidth / 2 + this.paddingLeft;
        }

        // Áp dụng vị trí cho mỗi node con
        let currentX = startX;
        let visibleIndex = 0;
        
        for (let i = 0; i < this.node.children.length; i++) {
            const child = this.node.children[i];
            if (!child.active) continue;

            const childWidth = this._childrenWidths[i];
            
            // Tính vị trí X cho phần tử hiện tại
            if (visibleIndex > 0) {
                currentX += this.spacing;
            }
            
            // Cập nhật vị trí của node con
            const childPos = child.position;
            child.setPosition(new Vec3(currentX + childWidth / 2, childPos.y, childPos.z));
            
            // Cập nhật vị trí X cho phần tử tiếp theo
            currentX += childWidth;
            visibleIndex++;
        }
    }

    /**
     * Thêm node con mới và cập nhật vị trí
     * @param child Node con cần thêm vào
     */
    public addChild(child: Node): void {
        if (!child) return;
        
        this.node.addChild(child);
        this.arrangeChildren();
    }

    /**
     * Xóa node con và cập nhật vị trí
     * @param child Node con cần xóa
     */
    public removeChild(child: Node): void {
        if (!child) return;
        
        this.node.removeChild(child);
        this.arrangeChildren();
    }

    /**
     * Cập nhật vị trí khi thay đổi kích thước container
     * @param newWidth Chiều rộng mới
     */
    public updateContainerWidth(newWidth: number): void {
        const uiTransform = this.node.getComponent(UITransform);
        if (!uiTransform) return;
        
        uiTransform.width = newWidth;
        this.arrangeChildren();
    }
    
    /**
     * Cập nhật layout trong Editor để xem trước kết quả
     * Hàm này được gọi từ Editor thông qua RefreshLayout setter
     */
    private refreshEditorLayout(): void {
        console.log("[ShelfGridHozirontal] Đang cập nhật layout trong Editor...");
        
        // Thực hiện căn chỉnh ngay trong editor
        this._calculateSizes();
        this._arrangeChildrenHorizontally();
        
        // Log thông tin cấu hình hiện tại
        console.log(`[ShelfGridHozirontal] Cấu hình: spacing=${this.spacing}, paddingLeft=${this.paddingLeft}, paddingRight=${this.paddingRight}, alignCenter=${this.alignCenter}`);
        console.log(`[ShelfGridHozirontal] Số node con: ${this.node.children.length}`);
    }
}

