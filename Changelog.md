# Changelog

Tất cả thay đổi đáng chú ý sẽ được ghi lại trong file này.

## [Unreleased]

### Added
- Shader `hehe_outline.effect` - bản sao cải tiến của `hehe.effect` với mesh-based outline
  - Thêm pass outline mới sử dụng mesh geometry thay vì silhouette-edge
  - Vertex shader `mesh-outline-vs` mở rộng vertices theo normal vector
  - Fragment shader `mesh-outline-fs` với hiệu ứng fresnel cho outline
  - Thuộc tính `outlineWidth` để điều chỉnh độ dày outline (0-0.1)
  - Thuộc tính `outlineColor` để tùy chỉnh màu sắc outline
  - Thuộc tính `depthBias` để tránh z-fighting
  - Hỗ trợ cả opaque và transparent technique
- Shader effect `outline` cho object 3D trong `effect.effect`
  - Hỗ trợ điều chỉnh màu sắc outline qua thuộc tính `outlineColor`
  - Hỗ trợ điều chỉnh độ dày outline qua thuộc tính `outlineWidth` (0.0 - 0.05)
  - Hỗ trợ điều chỉnh cường độ outline qua thuộc tính `outlineIntensity` (0.0 - 5.0)
  - Tương thích với Cocos Creator 3.8.6
- Hệ thống `ObjectFactory` để spawn và quản lý các game object với object pooling
  - `ObjectType` enum để định nghĩa các loại object
  - `IObjectFactory` interface định nghĩa các phương thức cơ bản cho factory
  - `ObjectFactory` class triển khai factory pattern với object pooling
  - `ObjectSpawnerDemo` class minh họa cách sử dụng factory
  - Hỗ trợ kéo thả prefab trực tiếp từ editor
  - Tài liệu hướng dẫn sử dụng trong README.md
- Chức năng match 3 trong `ShelfContainer`
  - Tự động phát hiện và tiêu diệt 3 item cùng loại liên tiếp
  - Hỗ trợ animation khi match và destroy item
  - Tự động sắp xếp lại các item sau khi match
- Component `ShelfGridHozirontal` để căn chỉnh các node con theo chiều ngang
  - Hỗ trợ cấu hình khoảng cách (`spacing`) và padding
  - Tự động tính toán vị trí của các node con
  - Tính năng căn giữa (`alignCenter`) và căn từ mép trái
  - Các phương thức `addChild()`, `removeChild()` và `updateContainerWidth()` để quản lý node con và cập nhật vị trí

### Fixed
- Lỗi EFX2001 trong `master.effect` shader: "can not resolve 'lighting-custom'"
  - Tạo module `lighting-custom` với các hàm `SetLighting()` và `SetSpecular()`
  - Cập nhật đường dẫn include trong `master.effect`
  - Sửa lỗi TypeError liên quan đến đường dẫn file undefined
  - Shader hiện hoạt động bình thường với lighting và specular effects

### Changed
- Cập nhật `Item.pick()` để kiểm tra trạng thái matching và ngăn người chơi nhặt item khi đang xử lý match
- Cập nhật `ShelfContainer.onGetNewItem()` để xử lý logic match sau khi sort
- Hoàn thiện phương thức `Item.sortItem()` với logic di chuyển item theo đường cong Bezier khi thay đổi vị trí
- Cải thiện hiệu ứng animation trong `ShelfContainer.destroyMatchedItems()` với trình tự mới:
  - Các item nhảy lên trên đồng thời
  - Hai item bên ngoài di chuyển vào vị trí item giữa
  - Hiệu ứng scale xuống 0 trước khi biến mất
- Cải tiến `ObjectSpawnerDemo.ts` với mảng `prefabsToSpawn` để quản lý tập trung:
  - Thêm mảng lưu trữ các loại prefab cần spawn
  - Cập nhật phương thức `onSpawnObj()` để spawn 10 đối tượng mỗi loại từ mảng
  - Tối ưu hóa phương thức `onClearObjects()` để xử lý tất cả loại đối tượng cùng lúc

## [0.1.0] - 2025-06-26

### Added
- Khởi tạo dự án
- Thêm prefab cơ bản: Cube, Sphere
