const { Order, Product } = require('../models');

class ReportService {
    // Generate sales report for date range
    async getSalesReport(startDate, endDate) {
        try {
            const query = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                },
                status: { $in: ['delivered', 'shipping', 'confirmed', 'processing'] }
            };

            const orders = await Order.find(query)
                .populate('items.product')
                .sort({ createdAt: -1 });

            const summary = {
                totalOrders: orders.length,
                totalRevenue: 0,
                totalItems: 0,
                paymentMethods: {},
                orderStatuses: {},
                topProducts: []
            };

            const productSales = {};

            orders.forEach(order => {
                summary.totalRevenue += order.totalAmount || 0;
                summary.totalItems += order.items.length || 0;

                // Count payment methods
                summary.paymentMethods[order.paymentMethod] = 
                    (summary.paymentMethods[order.paymentMethod] || 0) + 1;

                // Count order statuses
                summary.orderStatuses[order.status] = 
                    (summary.orderStatuses[order.status] || 0) + 1;

                // Track product sales
                order.items.forEach(item => {
                    const productId = item.product?._id?.toString() || 'unknown';
                    if (!productSales[productId]) {
                        productSales[productId] = {
                            productId,
                            productName: item.name,
                            quantity: 0,
                            revenue: 0
                        };
                    }
                    productSales[productId].quantity += item.quantity || 0;
                    productSales[productId].revenue += item.subtotal || 0;
                });
            });

            // Get top 10 products by revenue
            summary.topProducts = Object.values(productSales)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 10);

            return {
                orders,
                summary,
                startDate,
                endDate
            };
        } catch (error) {
            throw new Error(`Failed to generate sales report: ${error.message}`);
        }
    }

    // Convert sales report to CSV format
    async generateCSV(startDate, endDate) {
        const reportData = await this.getSalesReport(startDate, endDate);
        const { orders, summary } = reportData;

        let csv = 'BÁAO CÁO DOANH THU\n';
        csv += `Từ ngày: ${new Date(startDate).toLocaleDateString('vi-VN')}\n`;
        csv += `Đến ngày: ${new Date(endDate).toLocaleDateString('vi-VN')}\n\n`;

        // Summary section
        csv += 'TỔNG HỢP\n';
        csv += `Tổng đơn hàng,${summary.totalOrders}\n`;
        csv += `Tổng doanh thu,${summary.totalRevenue.toFixed(2)}\n`;
        csv += `Tổng sản phẩm bán,${summary.totalItems}\n\n`;

        // Payment methods
        csv += 'PHƯƠNG THỨC THANH TOÁN\n';
        csv += 'Phương thức,Số lượng\n';
        Object.entries(summary.paymentMethods).forEach(([method, count]) => {
            csv += `${this.formatPaymentMethod(method)},${count}\n`;
        });
        csv += '\n';

        // Order statuses
        csv += 'TRẠNG THÁI ĐƠN HÀNG\n';
        csv += 'Trạng thái,Số lượng\n';
        Object.entries(summary.orderStatuses).forEach(([status, count]) => {
            csv += `${this.formatOrderStatus(status)},${count}\n`;
        });
        csv += '\n';

        // Top products
        csv += 'TOP SẢN PHẨM BÁN CHẠY\n';
        csv += 'Tên sản phẩm,Số lượng bán,Doanh thu\n';
        summary.topProducts.forEach(product => {
            csv += `"${product.productName}",${product.quantity},${product.revenue.toFixed(2)}\n`;
        });
        csv += '\n';

        // Detailed orders
        csv += 'CHI TIẾT ĐƠN HÀNG\n';
        csv += 'Mã đơn,Khách hàng,Email,SĐT,Ngày,Trạng thái,Phương thức TT,Tổng tiền\n';
        orders.forEach(order => {
            const date = new Date(order.createdAt).toLocaleDateString('vi-VN');
            csv += `"${order.orderNumber}","${order.customer.name}","${order.customer.email}","${order.customer.phone}",${date},${this.formatOrderStatus(order.status)},${this.formatPaymentMethod(order.paymentMethod)},${order.totalAmount.toFixed(2)}\n`;
        });

        return csv;
    }

    formatPaymentMethod(method) {
        const methods = {
            'cod': 'Thanh toán khi nhận hàng',
            'bank_transfer': 'Chuyển khoản ngân hàng',
            'credit_card': 'Thẻ tín dụng',
            'momo': 'Ví MoMo',
            'vnpay': 'VNPay'
        };
        return methods[method] || method;
    }

    formatOrderStatus(status) {
        const statuses = {
            'pending': 'Chờ xác nhận',
            'confirmed': 'Đã xác nhận',
            'processing': 'Đang xử lý',
            'shipping': 'Đang giao',
            'delivered': 'Đã giao',
            'cancelled': 'Đã hủy',
            'refunded': 'Đã hoàn tiền'
        };
        return statuses[status] || status;
    }
}

module.exports = new ReportService();
