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

## [0.1.0] - 2025-06-26

### Added
- Khởi tạo dự án
- Thêm prefab cơ bản: Cube, Sphere
