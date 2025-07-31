# ParticleSpawnManager - Hướng dẫn sử dụng

## Tổng quan

`ParticleSpawnManager` là một hệ thống quản lý spawn particle 2D và 3D được thiết kế cho Cocos Creator. Hệ thống này cung cấp:

- **Object Pooling**: Tối ưu hiệu suất bằng cách tái sử dụng particle nodes
- **Singleton Pattern**: Dễ dàng truy cập từ bất kỳ đâu trong game
- **Tự động quản lý lifecycle**: Particle tự động destroy sau thời gian xác định
- **Validation đầy đủ**: Kiểm tra tham số đầu vào và xử lý lỗi

## Thiết lập ban đầu

### 1. Thêm component vào scene

1. Tạo một empty node trong scene
2. Attach component `ParticleSpawnManager` vào node đó
3. Cấu hình các thuộc tính trong Inspector:

```typescript
// Các thuộc tính cần thiết lập:
- particle2DPrefabs: Mảng các prefab particle 2D
- particle3DPrefabs: Mảng các prefab particle 3D  
- mainCamera: Camera chính để convert vị trí
- canvas: Canvas để add particle 2D
- worldContainer: Node container cho particle 3D
```

### 2. Cấu hình prefabs

- Kéo các prefab particle vào mảng `particle2DPrefabs` và `particle3DPrefabs`
- Đảm bảo prefabs có animation hoặc particle system component
- Index của prefab trong mảng sẽ được sử dụng khi spawn

## Cách sử dụng

### Spawn Particle 2D

#### Phương thức 1: Sử dụng prefab index
```typescript
// Spawn particle 2D tại vị trí world được convert sang UI
const worldPos = new Vec3(100, 200, 0);
const particle = ParticleSpawnManager.instance.spawn2DParticle(
    0,          // Index của prefab trong mảng particle2DPrefabs
    worldPos,   // Vị trí world
    3.0         // Thời gian tồn tại (giây) - optional, mặc định 2.0
);
```

#### Phương thức 2: Sử dụng prefab trực tiếp
```typescript
// Spawn particle 2D với prefab cụ thể
const particle = ParticleSpawnManager.instance.spawn2DParticleWithPrefab(
    this.myParticlePrefab,  // Prefab particle
    worldPos,               // Vị trí world
    2.5                     // Thời gian tồn tại (giây)
);
```

### Spawn Particle 3D

#### Phương thức 1: Sử dụng prefab index
```typescript
// Spawn particle 3D tại vị trí world
const worldPos = new Vec3(100, 0, 200);
const particle = ParticleSpawnManager.instance.spawn3DParticle(
    0,          // Index của prefab trong mảng particle3DPrefabs
    worldPos,   // Vị trí world
    4.0         // Thời gian tồn tại (giây) - optional, mặc định 2.0
);
```

#### Phương thức 2: Sử dụng prefab trực tiếp
```typescript
// Spawn particle 3D với prefab cụ thể
const particle = ParticleSpawnManager.instance.spawn3DParticleWithPrefab(
    this.my3DParticlePrefab, // Prefab particle
    worldPos,                // Vị trí world
    3.5                      // Thời gian tồn tại (giây)
);
```

## Ví dụ thực tế

### Spawn particle khi match items
```typescript
// Trong ShelfContainer.ts
private spawnMatchEffect(middlePos: Vec3): void {
    // Spawn particle 2D tại vị trí giữa các item được match
    ParticleSpawnManager.instance.spawn2DParticle(0, middlePos, 2.0);
    
    // Hoặc spawn particle 3D
    ParticleSpawnManager.instance.spawn3DParticle(0, middlePos, 2.0);
}
```

### Spawn particle khi touch
```typescript
// Trong TouchVFX.ts
private onTouchStart(event: EventTouch): void {
    const touchPos = event.getLocation();
    const worldPos = new Vec3(touchPos.x, touchPos.y, 0);
    
    // Spawn touch effect
    ParticleSpawnManager.instance.spawn2DParticle(1, worldPos, 1.5);
}
```

## Quản lý và tối ưu

### Dọn dẹp particle
```typescript
// Dọn dẹp tất cả particle đang active
ParticleSpawnManager.instance.clearAllActiveParticles();
```

### Kiểm tra instance
```typescript
// Luôn kiểm tra instance trước khi sử dụng
if (ParticleSpawnManager.instance) {
    ParticleSpawnManager.instance.spawn2DParticle(0, worldPos);
} else {
    console.warn("ParticleSpawnManager chưa được khởi tạo");
}
```

## Lưu ý quan trọng

1. **Singleton**: Chỉ nên có 1 instance của `ParticleSpawnManager` trong scene
2. **Object Pooling**: Hệ thống tự động quản lý pool, không cần can thiệp thủ công
3. **Memory Management**: Particle tự động destroy, không cần gọi destroy thủ công
4. **Error Handling**: Hệ thống có validation đầy đủ và log lỗi chi tiết
5. **Performance**: Sử dụng object pooling để tối ưu hiệu suất

## Troubleshooting

### Particle không spawn
- Kiểm tra `ParticleSpawnManager.instance` có null không
- Kiểm tra prefab index có hợp lệ không
- Kiểm tra camera và canvas đã được thiết lập chưa

### Particle spawn sai vị trí
- Đảm bảo camera được thiết lập đúng cho 2D particle
- Kiểm tra worldContainer cho 3D particle
- Verify world position coordinates

### Performance issues
- Giảm thời gian tồn tại của particle
- Kiểm tra số lượng particle spawn cùng lúc
- Sử dụng prefab index thay vì prefab trực tiếp khi có thể

## Demo

Tham khảo `ParticleSpawnDemo.ts` để xem ví dụ chi tiết về cách sử dụng tất cả các tính năng của `ParticleSpawnManager`.
