require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Product, Category, Coupon } = require('../models');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/watch_store');
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});
        await Coupon.deleteMany({});
        console.log('🗑️ Cleared existing data');

        // Create Admin User
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@watchstore.vn',
            password: adminPassword,
            role: 'admin',
            isActive: true
        });
        console.log('👤 Created admin user: admin@watchstore.vn / admin123');

        // Create Categories
        const categories = await Category.insertMany([
            { name: 'Đồng hồ nam', slug: 'dong-ho-nam', description: 'Bộ sưu tập đồng hồ nam cao cấp', isFeatured: true, order: 1 },
            { name: 'Đồng hồ nữ', slug: 'dong-ho-nu', description: 'Bộ sưu tập đồng hồ nữ thanh lịch', isFeatured: true, order: 2 },
            { name: 'Đồng hồ cặp', slug: 'dong-ho-cap', description: 'Đồng hồ đôi cho các cặp đôi', isFeatured: true, order: 3 },
            { name: 'Đồng hồ thể thao', slug: 'dong-ho-the-thao', description: 'Đồng hồ thể thao và outdoor', order: 4 },
            { name: 'Đồng hồ cao cấp', slug: 'dong-ho-cao-cap', description: 'Đồng hồ luxury cao cấp', isFeatured: true, order: 5 }
        ]);
        console.log('📁 Created', categories.length, 'categories');

        // Create Products
        const products = [
            {
                name: 'Rolex Submariner Date',
                sku: 'ROL-SUB-001',
                description: 'Đồng hồ Rolex Submariner Date với mặt số đen kinh điển, vỏ Oystersteel 41mm, bộ máy tự động Calibre 3235.',
                shortDescription: 'Đồng hồ lặn huyền thoại với thiết kế vượt thời gian',
                price: 350000000,
                category: categories[4]._id,
                brand: 'Rolex',
                specifications: {
                    movement: 'Automatic',
                    caseMaterial: 'Oystersteel',
                    caseSize: '41mm',
                    caseThickness: '12.5mm',
                    bandMaterial: 'Oystersteel',
                    waterResistance: '300m',
                    crystalType: 'Sapphire',
                    dialColor: 'Đen',
                    gender: 'Nam',
                    style: 'Thể thao',
                    warranty: '5 năm'
                },
                features: ['Chống nước 300m', 'Vành xoay một chiều', 'Lịch ngày', 'Dạ quang'],
                stock: 5,
                isActive: true,
                isFeatured: true,
                isNewArrival: true,
                images: [{ url: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&h=600&fit=crop', isPrimary: true }]
            },
            {
                name: 'Omega Seamaster Aqua Terra',
                sku: 'OMG-SEA-001',
                description: 'Omega Seamaster Aqua Terra 150M với mặt số màu xanh sunburst, vỏ thép 41mm, bộ máy Master Chronometer.',
                shortDescription: 'Sự kết hợp hoàn hảo giữa thể thao và lịch lãm',
                price: 180000000,
                category: categories[0]._id,
                brand: 'Omega',
                specifications: {
                    movement: 'Automatic',
                    caseMaterial: 'Stainless Steel',
                    caseSize: '41mm',
                    bandMaterial: 'Steel',
                    waterResistance: '150m',
                    crystalType: 'Sapphire',
                    dialColor: 'Xanh dương',
                    gender: 'Nam',
                    style: 'Sang trọng',
                    warranty: '5 năm'
                },
                features: ['Master Chronometer', 'Chống từ', 'Lịch ngày', 'Chống nước 150m'],
                stock: 8,
                isActive: true,
                isFeatured: true,
                images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop', isPrimary: true }]
            },
            {
                name: 'Casio G-Shock GA-2100',
                sku: 'CAS-GSH-001',
                description: 'G-Shock GA-2100 "CasiOak" với thiết kế bát giác độc đáo, vỏ carbon, pin tuổi thọ cao.',
                shortDescription: 'Phong cách bát giác hiện đại cùng độ bền huyền thoại',
                price: 3500000,
                salePrice: 2990000,
                category: categories[3]._id,
                brand: 'Casio',
                specifications: {
                    movement: 'Quartz',
                    caseMaterial: 'Carbon/Resin',
                    caseSize: '45.4mm',
                    bandMaterial: 'Resin',
                    waterResistance: '200m',
                    crystalType: 'Mineral',
                    dialColor: 'Đen',
                    gender: 'Nam',
                    style: 'Thể thao',
                    warranty: '2 năm'
                },
                features: ['Chống sốc', 'Chống nước 200m', 'Đèn LED', 'Báo thức', 'Đồng hồ bấm giờ'],
                stock: 50,
                isActive: true,
                isNewArrival: true,
                isFeatured: true,
                images: [{ url: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&h=600&fit=crop', isPrimary: true }]
            },
            {
                name: 'Seiko Presage SPB167',
                sku: 'SEI-PRE-001',
                description: 'Seiko Presage SPB167 với mặt số enamel trắng tinh tế, bộ máy 6R35 automatic, dây da cao cấp.',
                shortDescription: 'Nghệ thuật thủ công Nhật Bản trong từng chi tiết',
                price: 25000000,
                category: categories[0]._id,
                brand: 'Seiko',
                specifications: {
                    movement: 'Automatic',
                    caseMaterial: 'Stainless Steel',
                    caseSize: '40.5mm',
                    bandMaterial: 'Da',
                    waterResistance: '100m',
                    crystalType: 'Sapphire',
                    dialColor: 'Trắng',
                    gender: 'Nam',
                    style: 'Cổ điển',
                    warranty: '2 năm'
                },
                features: ['Mặt số enamel', 'Power reserve 70h', 'Hiển thị ngày', 'Dạ quang'],
                stock: 15,
                isActive: true,
                isFeatured: true,
                images: [{ url: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=600&fit=crop', isPrimary: true }]
            },
            {
                name: 'Citizen Eco-Drive BM7460',
                sku: 'CIT-ECO-001',
                description: 'Citizen Eco-Drive với công nghệ sạc bằng ánh sáng, không cần thay pin, thiết kế thanh lịch.',
                shortDescription: 'Công nghệ Eco-Drive thân thiện môi trường',
                price: 8500000,
                salePrice: 6990000,
                category: categories[0]._id,
                brand: 'Citizen',
                specifications: {
                    movement: 'Solar',
                    caseMaterial: 'Stainless Steel',
                    caseSize: '42mm',
                    bandMaterial: 'Steel',
                    waterResistance: '100m',
                    crystalType: 'Sapphire',
                    dialColor: 'Xanh Navy',
                    gender: 'Nam',
                    style: 'Thường ngày',
                    warranty: '5 năm'
                },
                features: ['Eco-Drive', 'Không cần thay pin', 'Lịch ngày', 'Chống nước 100m'],
                stock: 25,
                isActive: true,
                images: [{ url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop', isPrimary: true }]
            },
            {
                name: 'Tissot PRX Powermatic 80',
                sku: 'TIS-PRX-001',
                description: 'Tissot PRX Powermatic 80 với thiết kế retro-modern, bộ máy automatic 80 giờ power reserve.',
                shortDescription: 'Phong cách vintage với core công nghệ hiện đại',
                price: 18000000,
                category: categories[0]._id,
                brand: 'Tissot',
                specifications: {
                    movement: 'Automatic',
                    caseMaterial: 'Stainless Steel',
                    caseSize: '40mm',
                    bandMaterial: 'Steel',
                    waterResistance: '100m',
                    crystalType: 'Sapphire',
                    dialColor: 'Xanh lá',
                    gender: 'Nam',
                    style: 'Hiện đại',
                    warranty: '2 năm'
                },
                features: ['Powermatic 80', 'Power reserve 80h', 'Lịch ngày'],
                stock: 12,
                isActive: true,
                isNewArrival: true,
                images: [{ url: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&h=600&fit=crop', isPrimary: true }]
            },
            {
                name: 'Longines Master Collection Lady',
                sku: 'LON-MCL-001',
                description: 'Longines Master Collection cho nữ, mặt số xà cừ đính kim cương, bộ máy automatic L592.',
                shortDescription: 'Vẻ đẹp tinh tế dành cho phái đẹp',
                price: 65000000,
                category: categories[1]._id,
                brand: 'Longines',
                specifications: {
                    movement: 'Automatic',
                    caseMaterial: 'Stainless Steel',
                    caseSize: '29mm',
                    bandMaterial: 'Leather',
                    waterResistance: '30m',
                    crystalType: 'Sapphire',
                    dialColor: 'Xà cừ',
                    gender: 'Nữ',
                    style: 'Sang trọng',
                    warranty: '2 năm'
                },
                features: ['Mặt số xà cừ', 'Đính kim cương', 'Lịch ngày'],
                stock: 6,
                isActive: true,
                isFeatured: true,
                images: [{ url: 'https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=600&h=600&fit=crop', isPrimary: true }]
            },
            {
                name: 'Orient Bambino V2',
                sku: 'ORI-BAM-001',
                description: 'Orient Bambino Version 2 với thiết kế dress watch cổ điển, mặt số cream kem vintage.',
                shortDescription: 'Dress watch cổ điển với giá tuyệt vời',
                price: 5500000,
                salePrice: 4500000,
                category: categories[0]._id,
                brand: 'Orient',
                specifications: {
                    movement: 'Automatic',
                    caseMaterial: 'Stainless Steel',
                    caseSize: '40.5mm',
                    bandMaterial: 'Leather',
                    waterResistance: '30m',
                    crystalType: 'Mineral with AR coating',
                    dialColor: 'Kem',
                    gender: 'Nam',
                    style: 'Cổ điển',
                    warranty: '1 năm'
                },
                features: ['Mặt vòm cong', 'Kim xanh blued', 'Automatic'],
                stock: 30,
                isActive: true,
                images: [{ url: 'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=600&h=600&fit=crop', isPrimary: true }]
            },
            {
                name: 'TAG Heuer Carrera',
                sku: 'TAG-CAR-001',
                description: 'TAG Heuer Carrera Chronograph với thiết kế thể thao đua xe, bộ máy Heuer 02 tự động.',
                shortDescription: 'Tinh thần đua xe trong từng nhịp kim',
                price: 125000000,
                category: categories[4]._id,
                brand: 'TAG Heuer',
                specifications: {
                    movement: 'Automatic',
                    caseMaterial: 'Stainless Steel',
                    caseSize: '44mm',
                    bandMaterial: 'Steel',
                    waterResistance: '100m',
                    crystalType: 'Sapphire',
                    dialColor: 'Đen',
                    gender: 'Nam',
                    style: 'Thể thao',
                    warranty: '2 năm'
                },
                features: ['Chronograph', 'Tachymeter', 'Lịch ngày', 'Power reserve 80h'],
                stock: 4,
                isActive: true,
                isFeatured: true,
                images: [{ url: 'https://images.unsplash.com/photo-1594576722512-582bcd46fba3?w=600&h=600&fit=crop', isPrimary: true }]
            },
            {
                name: 'Fossil Grant Chronograph',
                sku: 'FOS-GRA-001',
                description: 'Fossil Grant Chronograph với mặt số La Mã cổ điển, dây da nâu vintage.',
                shortDescription: 'Phong cách cổ điển với giá hợp lý',
                price: 4200000,
                salePrice: 3500000,
                category: categories[0]._id,
                brand: 'Fossil',
                specifications: {
                    movement: 'Quartz',
                    caseMaterial: 'Stainless Steel',
                    caseSize: '44mm',
                    bandMaterial: 'Leather',
                    waterResistance: '50m',
                    crystalType: 'Mineral',
                    dialColor: 'Trắng ngà',
                    gender: 'Nam',
                    style: 'Cổ điển',
                    warranty: '2 năm'
                },
                features: ['Chronograph', 'Số La Mã', 'Dây da vintage'],
                stock: 20,
                isActive: true,
                images: [{ url: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&h=600&fit=crop', isPrimary: true }]
            },
            {
                name: 'Michael Kors Runway Rose Gold',
                sku: 'MK-RUN-001',
                description: 'Michael Kors Runway với thiết kế rose gold sang trọng, mặt số chronograph thời trang.',
                shortDescription: 'Phong cách thời trang đẳng cấp New York',
                price: 7500000,
                category: categories[1]._id,
                brand: 'Michael Kors',
                specifications: {
                    movement: 'Quartz',
                    caseMaterial: 'Stainless Steel PVD',
                    caseSize: '38mm',
                    bandMaterial: 'Steel PVD',
                    waterResistance: '50m',
                    crystalType: 'Mineral',
                    dialColor: 'Rose Gold',
                    gender: 'Nữ',
                    style: 'Thời trang',
                    warranty: '2 năm'
                },
                features: ['Chronograph', 'Rose Gold PVD', 'Lịch ngày'],
                stock: 18,
                isActive: true,
                isFeatured: true,
                isNewArrival: true,
                images: [{ url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=600&fit=crop', isPrimary: true }]
            },
            {
                name: 'Daniel Wellington Classic Petite',
                sku: 'DW-CLP-001',
                description: 'Daniel Wellington Classic Petite với thiết kế tối giản Scandinavian, dây mesh sang trọng.',
                shortDescription: 'Sự tối giản tinh tế từ Thụy Điển',
                price: 4500000,
                category: categories[1]._id,
                brand: 'Daniel Wellington',
                specifications: {
                    movement: 'Quartz',
                    caseMaterial: 'Stainless Steel',
                    caseSize: '32mm',
                    bandMaterial: 'Mesh Steel',
                    waterResistance: '30m',
                    crystalType: 'Mineral',
                    dialColor: 'Trắng',
                    gender: 'Nữ',
                    style: 'Minimalist',
                    warranty: '2 năm'
                },
                features: ['Thiết kế tối giản', 'Dây mesh', 'Siêu mỏng'],
                stock: 35,
                isActive: true,
                images: [{ url: 'https://images.unsplash.com/photo-1518131672697-613becd4fab5?w=600&h=600&fit=crop', isPrimary: true }]
            }
        ];

        // Create products one by one to trigger pre-save hooks (generate slug)
        for (const productData of products) {
            await Product.create(productData);
        }
        console.log('⌚ Created', products.length, 'products');

        // Create Coupons
        const coupons = await Coupon.insertMany([
            {
                code: 'WELCOME10',
                description: 'Giảm 10% cho khách hàng mới',
                type: 'percentage',
                value: 10,
                maxDiscount: 500000,
                minOrderValue: 2000000,
                startDate: new Date(),
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                isActive: true
            },
            {
                code: 'SAVE500K',
                description: 'Giảm 500K cho đơn từ 5 triệu',
                type: 'fixed',
                value: 500000,
                minOrderValue: 5000000,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true
            }
        ]);
        console.log('🎟️ Created', coupons.length, 'coupons');

        console.log('\n✅ Seed completed successfully!');
        console.log('=====================================');
        console.log('Admin login: admin@watchstore.vn');
        console.log('Password: admin123');
        console.log('=====================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedData();
