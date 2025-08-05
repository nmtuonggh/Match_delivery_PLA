import { _decorator, Component, Material, MeshRenderer, macro } from 'cc';

const { ccclass, property } = _decorator;

/**
 * BlinkingOutline Component
 * Quản lý hiệu ứng outline nhấp nháy cho các MeshRenderer
 * Tối ưu hiệu suất hơn so với việc sử dụng tween
 */
@ccclass('BlinkingOutline')
export class BlinkingOutline extends Component {
    
    @property({ type: Material, tooltip: "Material outline để hiển thị khi nhấp nháy" })
    public outlineMaterial: Material = null;
    
    @property({ type: Material, tooltip: "Material bình thường" })
    public normalMaterial: Material = null;
    
    @property({ tooltip: "Thời gian interval giữa các lần nhấp nháy (giây)" })
    public blinkInterval: number = 1.5;
    
    private meshRenderers: MeshRenderer[] = [];
    private isBlinking: boolean = false;
    private currentMaterialIsOutline: boolean = false;
    
    onLoad() {
        // Lấy tất cả MeshRenderer từ node hiện tại và children
        this.meshRenderers = this.getComponentsInChildren(MeshRenderer);
    }
    
    /**
     * Bắt đầu hiệu ứng nhấp nháy outline
     */
    public startBlinking(): void {
        if (this.isBlinking) {
            return;
        }
        
        if (!this.outlineMaterial || !this.normalMaterial) {
            console.warn(`[BlinkingOutline] Materials chưa được set cho node: ${this.node.name}`);
            return;
        }
        
        if (this.meshRenderers.length === 0) {
            console.warn(`[BlinkingOutline] Không tìm thấy MeshRenderer nào trên node: ${this.node.name}`);
            return;
        }
        
        this.isBlinking = true;
        this.currentMaterialIsOutline = false;
        
        // Bắt đầu với normal material
        this.setMaterial(this.normalMaterial);
        
        // Schedule toggle material
        this.schedule(this.toggleMaterial, this.blinkInterval, macro.REPEAT_FOREVER);
    }
    
    /**
     * Dừng hiệu ứng nhấp nháy và về trạng thái bình thường
     */
    public stopBlinking(): void {
        if (!this.isBlinking) {
            return;
        }
        
        this.unscheduleAllCallbacks();
        this.isBlinking = false;
        this.currentMaterialIsOutline = false;
        
        // Reset về normal material
        this.setMaterial(this.normalMaterial);
    }
    
    /**
     * Kiểm tra xem có đang nhấp nháy không
     */
    public getIsBlinking(): boolean {
        return this.isBlinking;
    }
    
    /**
     * Set materials cho component (có thể gọi từ bên ngoài)
     */
    public setMaterials(outlineMaterial: Material, normalMaterial: Material): void {
        this.outlineMaterial = outlineMaterial;
        this.normalMaterial = normalMaterial;
    }
    
    /**
     * Toggle giữa outline và normal material
     */
    private toggleMaterial = (): void => {
        this.currentMaterialIsOutline = !this.currentMaterialIsOutline;
        const material = this.currentMaterialIsOutline ? this.outlineMaterial : this.normalMaterial;
        this.setMaterial(material);
    }
    
    /**
     * Set material cho tất cả MeshRenderer
     */
    private setMaterial(material: Material): void {
        if (!material) return;
        
        for (let i = 0; i < this.meshRenderers.length; i++) {
            if (this.meshRenderers[i] && this.meshRenderers[i].isValid) {
                this.meshRenderers[i].material = material;
            }
        }
    }
    
    onDestroy() {
        // Cleanup khi component bị destroy
        this.stopBlinking();
    }
}
