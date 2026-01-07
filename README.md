# Watch Store - Website Bán Đồng Hồ

Website bán đồng hồ chính hãng được xây dựng bằng Node.js, Express và MongoDB.

## 🚀 Tính năng

### Khách hàng
- Xem danh sách sản phẩm với bộ lọc (thương hiệu, giá, loại máy, giới tính)
- Xem chi tiết sản phẩm với thông số kỹ thuật đầy đủ
- Tìm kiếm sản phẩm
- Giỏ hàng và thanh toán
- Đăng ký/Đăng nhập tài khoản
- Quản lý đơn hàng và địa chỉ
- Danh sách yêu thích
- Đánh giá sản phẩm
- Áp dụng mã giảm giá

### Quản trị viên
- Dashboard với thống kê
- Quản lý sản phẩm (CRUD)
- Quản lý danh mục
- Quản lý đơn hàng
- Quản lý người dùng
- Quản lý mã giảm giá
- Quản lý đánh giá

## 📁 Cấu trúc thư mục

```
watch-store/
├── public/                 # Static files
│   ├── css/
│   ├── js/
│   ├── images/
│   └── uploads/
├── src/
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── helpers/           # Helper functions
│   ├── middleware/        # Express middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # Route definitions
│   ├── seeders/           # Database seeders
│   ├── views/             # EJS templates
│   └── app.js             # Express app
├── .env                   # Environment variables
├── .env.example           # Example env file
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Cài đặt

### Yêu cầu
- Node.js 18+
- MongoDB 6+

### Các bước cài đặt

1. Clone project:
```bash
git clone <repository-url>
cd watch-store
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file .env từ .env.example:
```bash
cp .env.example .env
```

4. Cấu hình file .env:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/watch_store
SESSION_SECRET=your_secret_key
JWT_SECRET=your_jwt_secret
```

5. Khởi tạo dữ liệu mẫu:
```bash
npm run seed
```

6. Chạy ứng dụng:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

7. Truy cập: http://localhost:3000

## 👤 Tài khoản mặc định

Sau khi chạy seed:
- **Admin**: admin@watchstore.vn / admin123

## 📦 API Endpoints

### Public API
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:slug` - Lấy chi tiết sản phẩm
- `GET /api/categories` - Lấy danh mục
- `GET /api/brands` - Lấy thương hiệu
- `GET /api/search?q=` - Tìm kiếm

### Protected Routes
- `POST /cart/add` - Thêm vào giỏ
- `PUT /cart/update` - Cập nhật giỏ
- `DELETE /cart/remove/:id` - Xóa khỏi giỏ
- `POST /orders/create` - Tạo đơn hàng

## 🛡️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **View Engine**: EJS
- **Authentication**: Passport.js, JWT
- **Upload**: Multer
- **Styling**: Bootstrap 5, Custom CSS

## 📄 License

MIT License
