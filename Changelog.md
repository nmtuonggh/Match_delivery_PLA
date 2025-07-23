# Changelog

Tất cả thay đổi đáng chú ý sẽ được ghi lại trong file này.

## [Unreleased]

### Added
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

### Changed
- Cập nhật `Item.pick()` để kiểm tra trạng thái matching và ngăn người chơi nhặt item khi đang xử lý match
- Cập nhật `ShelfContainer.onGetNewItem()` để xử lý logic match sau khi sort
- Hoàn thiện phương thức `Item.sortItem()` với logic di chuyển item theo đường cong Bezier khi thay đổi vị trí
- Cải thiện hiệu ứng animation trong `ShelfContainer.destroyMatchedItems()` với trình tự mới:
  - Các item nhảy lên trên đồng thời
  - Hai item bên ngoài di chuyển vào vị trí item giữa
  - Hiệu ứng scale xuống 0 trước khi biến mất

## [0.1.0] - 2025-06-26

### Added
- Khởi tạo dự án
- Thêm prefab cơ bản: Cube, Sphere
