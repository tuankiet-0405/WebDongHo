module.exports = {
    // Database configuration
    db: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/watch_store'
    },

    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'jwt_secret_key',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },

    // Session configuration
    session: {
        secret: process.env.SESSION_SECRET || 'session_secret_key'
    },

    // Upload configuration
    upload: {
        maxFileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        uploadDir: 'public/uploads'
    },

    // Pagination
    pagination: {
        productsPerPage: 12,
        ordersPerPage: 10,
        usersPerPage: 20
    },

    // Product configuration
    product: {
        brands: [
            'Rolex', 'Omega', 'Casio', 'Seiko', 'Citizen',
            'Tissot', 'Longines', 'Orient', 'Fossil', 'Timex'
        ],
        movements: ['Automatic', 'Quartz', 'Mechanical', 'Solar', 'Kinetic'],
        genders: ['Nam', 'Nữ', 'Unisex'],
        styles: ['Thể thao', 'Sang trọng', 'Thường ngày', 'Cổ điển', 'Hiện đại']
    }
};
