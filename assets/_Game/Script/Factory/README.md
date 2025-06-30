# Hệ Thống Object Factory

Hệ thống Factory cung cấp cách thức tạo và quản lý các object trong game một cách hiệu quả, sử dụng mẫu thiết kế Object Pooling để tối ưu hiệu năng.

## Các tính năng chính

- **Spawn objects** từ prefab được gán trực tiếp hoặc load từ resources
- **Object pooling** để tái sử dụng object, tránh việc liên tục tạo/hủy
- **Singleton độc lập** không cần attach vào GameObject

## Cấu trúc hệ thống

Hệ thống gồm 3 thành phần chính:

1. **ObjectType (enum)**: Định nghĩa các loại object có thể được spawn
2. **IObjectFactory (interface)**: Định nghĩa các phương thức cơ bản cho Factory
3. **ObjectFactory (class)**: Triển khai cụ thể của Factory với object pooling

## Cách sử dụng

### 1. Đăng ký prefab với Factory

```typescript
// Nếu đã có sẵn prefab từ component khác
const cubePrefab: Prefab = this.getComponent('SomeComponent').cubePrefab;
ObjectFactory.instance.setPrefab(ObjectType.CUBE, cubePrefab);
```

Hoặc prefab sẽ tự động được load từ thư mục resources nếu chưa được đăng ký.

### 2. Khởi tạo Factory trong code

```typescript
// Khởi tạo Factory với một parent node
const parentNode: Node = ...; // Node cha chứa các object spawn
ObjectFactory.instance.initialize(parentNode);
```

### 3. Spawn object

```typescript
// Spawn một object tại vị trí mặc định
const cube = await ObjectFactory.instance.spawn(ObjectType.CUBE);

// Spawn một object tại vị trí chỉ định
const position = new Vec3(1, 2, 0);
const sphere = await ObjectFactory.instance.spawn(ObjectType.SPHERE, position);
```

### 4. Recycle object (trả về pool)

```typescript
// Khi không cần object nữa, trả về pool để tái sử dụng
ObjectFactory.instance.recycle(cube, ObjectType.CUBE);
```

### 5. Clear tất cả objects

```typescript
// Xóa tất cả objects và làm sạch pools
ObjectFactory.instance.clear();
```

## Thêm object type mới

Để thêm một loại object mới:

1. Thêm type mới vào enum `ObjectType` trong file `ObjectType.ts`:
   ```typescript
   export enum ObjectType {
       CUBE = 'Cube',
       SPHERE = 'Sphere',
       NEW_OBJECT = 'NewObject', // Thêm object type mới
   }
   ```

2. Đặt prefab của object mới trong thư mục resources với đường dẫn `_Game/Prefab/{Type}` (ví dụ: `_Game/Prefab/NewObject`), hoặc đăng ký trực tiếp:
   ```typescript
   // Đăng ký prefab trực tiếp
   const newPrefab: Prefab = ...; // Prefab từ nguồn khác
   ObjectFactory.instance.setPrefab(ObjectType.NEW_OBJECT, newPrefab);
   ```

## Ví dụ

Xem file `ObjectSpawnerDemo.ts` để xem ví dụ đầy đủ về cách sử dụng Factory.

## Lưu ý

- Factory sử dụng Singleton pattern để đảm bảo chỉ có một instance duy nhất trong game
- Phải gọi phương thức initialize trước khi sử dụng Factory
- Các phương thức spawn và get đều trả về Promise, cần dùng await hoặc then để xử lý kết quả
- Prefab có thể được đăng ký thông qua setPrefab hoặc sẽ tự động được load từ resources
- Nếu gặp lỗi, hãy kiểm tra console để xem thông báo chi tiết
