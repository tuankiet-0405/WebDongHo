require('dotenv').config();
const mongoose = require('mongoose');
const { Product, Category } = require('./src/models');

const products = [
    {
        name: 'Rolex Submariner',
        slug: 'rolex-submariner',
        sku: 'ROLEX-SUB-001',
        description: 'Đồng hồ lặn huyền thoại của Rolex với khả năng chống nước đến 300m. Thiết kế sang trọng, bền bỉ với bộ máy automatic chính xác.',
        price: 180000000,
        salePrice: 180000000,
        stock: 10,
        images: [{ url: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800', alt: 'Rolex Submariner', isPrimary: true }],
        category: null,
        brand: 'Rolex',
        isFeatured: true,
        isNewArrival: true,
        sold: 5
    },
    {
        name: 'Omega Seamaster',
        slug: 'omega-seamaster',
        sku: 'OMEGA-SEA-001',
        description: 'Đồng hồ Omega Seamaster nổi tiếng với thiết kế thể thao và khả năng chống nước xuất sắc.',
        price: 120000000,
        salePrice: 120000000,
        stock: 15,
        images: [{ url: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800', alt: 'Omega Seamaster', isPrimary: true }],
        category: null,
        brand: 'Omega',
        isFeatured: true,
        isNewArrival: true,
        sold: 8
    },
    {
        name: 'TAG Heuer Carrera',
        slug: 'tag-heuer-carrera',
        sku: 'TAG-CAR-001',
        description: 'Đồng hồ thể thao cao cấp với thiết kế hiện đại. Bộ máy chronograph chính xác.',
        price: 95000000,
        salePrice: 85000000,
        stock: 20,
        images: [{ url: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800', alt: 'TAG Heuer Carrera', isPrimary: true }],
        category: null,
        brand: 'TAG Heuer',
        isFeatured: false,
        isNewArrival: true,
        sold: 12
    },
    {
        name: 'Patek Philippe Calatrava',
        slug: 'patek-philippe-calatrava',
        sku: 'PATEK-CAL-001',
        description: 'Đồng hồ dress watch cổ điển của Patek Philippe. Thiết kế tối giản, thanh lịch.',
        price: 450000000,
        salePrice: 450000000,
        stock: 5,
        images: [{ url: 'https://images.unsplash.com/photo-1509941943102-10c232535736?w=800', alt: 'Patek Philippe', isPrimary: true }],
        category: null,
        brand: 'Patek Philippe',
        isFeatured: true,
        isNewArrival: false,
        sold: 2
    },
    {
        name: 'Audemars Piguet Royal Oak',
        slug: 'audemars-piguet-royal-oak',
        sku: 'AP-ROYAL-001',
        description: 'Biểu tượng của sự sang trọng thể thao. Thiết kế bát giác độc đáo.',
        price: 550000000,
        salePrice: 550000000,
        stock: 3,
        images: [{ url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800', alt: 'Luxury Watch', isPrimary: true }],
        category: null,
        brand: 'Audemars Piguet',
        isFeatured: true,
        isNewArrival: false,
        sold: 1
    },
    {
        name: 'Seiko Presage',
        slug: 'seiko-presage',
        sku: 'SEIKO-PRES-001',
        description: 'Đồng hồ Nhật Bản với thiết kế tinh tế, bộ máy automatic đáng tin cậy.',
        price: 12000000,
        salePrice: 10000000,
        stock: 50,
        images: [{ url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800', alt: 'Seiko Presage', isPrimary: true }],
        category: null,
        brand: 'Seiko',
        isFeatured: false,
        isNewArrival: true,
        sold: 25
    }
];

const categories = [
    {
        name: 'Đồng hồ cao cấp',
        slug: 'dong-ho-cao-cap',
        description: 'Bộ sưu tập đồng hồ cao cấp từ các thương hiệu nổi tiếng thế giới',
        image: '/images/categories/luxury.jpg'
    },
    {
        name: 'Đồng hồ thể thao',
        slug: 'dong-ho-the-thao',
        description: 'Đồng hồ thể thao năng động, chống nước tốt',
        image: '/images/categories/sport.jpg'
    },
    {
        name: 'Đồng hồ dress',
        slug: 'dong-ho-dress',
        description: 'Đồng hồ sang trọng, thanh lịch cho doanh nhân',
        image: '/images/categories/dress.jpg'
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/watch_store');
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Product.deleteMany({});
        await Category.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create categories
        const createdCategories = await Category.insertMany(categories);
        console.log(`✅ Created ${createdCategories.length} categories`);

        // Assign random categories to products
        products.forEach(product => {
            const randomCat = createdCategories[Math.floor(Math.random() * createdCategories.length)];
            product.category = randomCat._id;
        });

        // Create products
        const createdProducts = await Product.insertMany(products);
        console.log(`✅ Created ${createdProducts.length} products`);

        console.log('\n🎉 Seed data created successfully!');
        console.log('\n📦 Products:');
        createdProducts.forEach(p => {
            console.log(`   - ${p.name} (${p.price.toLocaleString('vi-VN')}₫)`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
