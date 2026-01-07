// Format tiền Việt Nam
exports.formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

// Format số
exports.formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
};

// Format ngày
exports.formatDate = (date, format = 'short') => {
    const d = new Date(date);

    if (format === 'full') {
        return d.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    if (format === 'datetime') {
        return d.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

// Truncate text
exports.truncate = (str, length = 100) => {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
};

// Lấy trạng thái đơn hàng
exports.getOrderStatusLabel = (status) => {
    const labels = {
        pending: 'Chờ xác nhận',
        confirmed: 'Đã xác nhận',
        processing: 'Đang xử lý',
        shipping: 'Đang giao hàng',
        delivered: 'Đã giao hàng',
        cancelled: 'Đã hủy',
        refunded: 'Đã hoàn tiền'
    };
    return labels[status] || status;
};

// Lấy màu theo trạng thái
exports.getOrderStatusColor = (status) => {
    const colors = {
        pending: 'warning',
        confirmed: 'info',
        processing: 'primary',
        shipping: 'info',
        delivered: 'success',
        cancelled: 'danger',
        refunded: 'secondary'
    };
    return colors[status] || 'secondary';
};

// Lấy phương thức thanh toán
exports.getPaymentMethodLabel = (method) => {
    const labels = {
        cod: 'Thanh toán khi nhận hàng',
        bank_transfer: 'Chuyển khoản ngân hàng',
        credit_card: 'Thẻ tín dụng/Ghi nợ',
        momo: 'Ví MoMo',
        vnpay: 'VNPay'
    };
    return labels[method] || method;
};

// Generate stars HTML
exports.generateStars = (rating) => {
    let html = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
        html += '<i class="fas fa-star text-warning"></i>';
    }

    if (halfStar) {
        html += '<i class="fas fa-star-half-alt text-warning"></i>';
    }

    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        html += '<i class="far fa-star text-warning"></i>';
    }

    return html;
};

// Time ago
exports.timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    const intervals = {
        năm: 31536000,
        tháng: 2592000,
        tuần: 604800,
        ngày: 86400,
        giờ: 3600,
        phút: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit} trước`;
        }
    }

    return 'Vừa xong';
};
