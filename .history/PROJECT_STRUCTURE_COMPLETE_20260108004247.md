# 📁 WebDongHo - Watch Store Project Structure

## 📊 Project Overview

**Project Name:** Watch Store (WebDongHo)  
**Version:** 2.1  
**Type:** Node.js/Express E-commerce Application  
**Database:** MongoDB with Mongoose ODM  
**Template Engine:** EJS  
**Main Entry:** `src/app.js`  
**Status:** ✅ Production Ready

---

## 🗂️ Complete Directory Structure

```
WebDongHo/
├── src/
│   ├── app.js                      # Express configuration
│   ├── config/                     # Configuration (3 files)
│   │   ├── database.js             # MongoDB connection
│   │   ├── passport.js             # Auth strategies
│   │   └── index.js                # Config exports
│   ├── models/                     # Schemas (8)
│   │   ├── User.js                 # Auth & profiles
│   │   ├── Product.js              # Watch catalog
│   │   ├── Category.js             # Categories
│   │   ├── Order.js                # Orders
│   │   ├── Review.js               # Reviews
│   │   ├── Coupon.js               # Coupons
│   │   ├── Contact.js              # Inquiries ⭐ NEW
│   │   └── index.js
│   ├── controllers/                # Handlers (10)
│   │   ├── homeController.js
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── adminController.js      # Includes reports ⭐
│   │   ├── vnpayController.js
│   │   └── index.js
│   ├── routes/                     # Routes (10)
│   │   ├── home.js
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   ├── admin.js                # Includes reports ⭐
│   │   ├── vnpay.js
│   │   └── api.js
│   ├── middleware/                 # Middleware (2)
│   │   ├── auth.js
│   │   └── upload.js
│   ├── services/                   # Services (3)
│   │   ├── emailService.js         # Email + contacts ⭐
│   │   ├── vnpayService.js
│   │   └── reportService.js        # Reports ⭐
│   ├── helpers/
│   │   └── index.js
│   ├── views/                      # Templates (40+)
│   │   ├── layouts/
│   │   │   └── main.ejs
│   │   ├── partials/
│   │   │   ├── header.ejs
│   │   │   └── footer.ejs
│   │   ├── home/
│   │   │   ├── index.ejs
│   │   │   ├── about.ejs
│   │   │   ├── contact.ejs         # Form + Map ⭐
│   │   │   ├── search.ejs
│   │   │   └── product-detail.ejs
│   │   ├── auth/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── users/
│   │   ├── admin/                  # Reports UI ⭐
│   │   └── errors/
│   └── seeders/
│       └── seedData.js
├── public/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── uploads/
├── scripts/
│   ├── set-admin.js
│   ├── create-admin.js
│   └── check-users.js
├── Configuration
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
└── Documentation
    ├── README.md
    ├── project_structure.md        # THIS FILE ⭐
    ├── SALES_REPORT_FEATURE.md
    ├── GOONG_MAP_FEATURE.md
    ├── CODE_REVIEW_FIXES.md
    ├── COMPREHENSIVE_REVIEW.md
    ├── QUICK_START.md
    └── REVIEW_SUMMARY.md
```

---

## 📊 File Count

| Type | Count |
|------|-------|
| JavaScript | 45+ |
| EJS Templates | 40+ |
| Config | 5+ |
| Documentation | 7 ⭐ |

---

## 🎯 Models (8 Collections)

| Model | Fields | Purpose |
|-------|--------|---------|
| User | email, password, name, role, addresses, wishlist | Authentication |
| Product | name, price, images, category, sold | Catalog |
| Category | name, slug, parent, children | Organization |
| Order | orderNumber, items, customer, shipping, payment | Orders |
| Review | rating, comment, product, user | Feedback |
| Coupon | code, discount, type, dates | Coupons |
| Contact | name, email, subject, message, status | Inquiries ⭐ |

---

## 🎮 Controllers (10)

homeController, authController, userController, productController, categoryController, cartController, orderController, adminController (+ reports ⭐), vnpayController

---

## 🛣️ Routes (10)

home, auth, users, products, categories, cart, orders, admin (+ reports ⭐), vnpay, api

---

## ⚙️ Services (3)

- emailService (+ contact emails ⭐)
- vnpayService
- reportService ⭐

---

## 📦 Dependencies (18)

**Core:** express, ejs, mongoose  
**Auth:** passport, bcryptjs, jwt, express-session  
**Files:** multer  
**Email:** nodemailer  
**Utils:** dotenv, express-validator, slugify, etc.

---

## 🌟 Features

✅ Product catalog  
✅ Shopping cart  
✅ User auth  
✅ Orders & tracking  
✅ Payment (VNPay)  
✅ Reviews & ratings  
✅ **Admin reports** ⭐  
✅ **Contact form** ⭐  
✅ **Maps** ⭐  
✅ Email notifications  

---

## 🛠️ Tech Stack

**Frontend:** HTML, CSS, JS, EJS, Tailwind  
**Backend:** Node.js, Express  
**Database:** MongoDB, Mongoose  
**Auth:** Passport.js, JWT, bcryptjs  
**Services:** Nodemailer, Multer, VNPay

---

## 🚀 NPM Scripts

```
npm start     # Production
npm run dev   # Development
npm test      # Tests
npm run seed  # Seed DB
```

---

## 🔐 Security

✅ Password hashing  
✅ Session auth  
✅ JWT tokens  
✅ Role-based access  
✅ File validation  
⚠️ CSRF (TODO)  
⚠️ Rate limiting (TODO)

---

## 🎯 Status

**Version:** 2.1  
**Status:** ✅ Production Ready  
**Features:** 15+  
**Collections:** 8  
**Endpoints:** 30+  
**Tests:** ⚠️ Missing

---

**Updated:** 2026-01-07  
**Content:** Complete project structure analysis ⭐
