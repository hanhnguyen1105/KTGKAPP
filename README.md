# Restaurant App

Ứng dụng quản lý nhà hàng viết bằng React Native CLI, gồm thực đơn, sơ đồ 10
bàn, gọi món và thanh toán hoá đơn.

## Yêu cầu

- Node.js `>= 22.11.0`
- Android Studio/Android SDK để chạy Android hoặc Xcode và CocoaPods để chạy iOS
- Trình giả lập hoặc thiết bị thật

## Cài đặt và chạy

```sh
npm install
npm start
```

Mở terminal khác tại thư mục project:

```sh
# Android
npm run android

# iOS (cài CocoaPods trước ở lần đầu hoặc sau khi thay đổi thư viện native)
cd ios && pod install && cd ..
npm run ios
```

## Chức năng

- Thực đơn chia theo loại món; thêm, sửa, tìm kiếm, đổi trạng thái còn/hết và
  xác nhận trước khi xoá.
- Sơ đồ 10 bàn; mỗi bàn mở lại hoá đơn đang phục vụ hoặc tạo hoá đơn mới.
- Gọi món, thay đổi số lượng và xem tạm tính.
- Thanh toán với VAT 8%, nhập tiền khách đưa và tính tiền thừa.
- Dữ liệu thực đơn và hoá đơn được lưu cục bộ bằng AsyncStorage. Lần mở đầu
  ứng dụng có sẵn 10 món thuộc đủ 4 loại và một hoá đơn đang phục vụ.

## Kiểm tra

```sh
npx tsc --noEmit
npm run lint
npm test -- --runInBand
```
