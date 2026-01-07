const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    // For development, use Ethereal (fake SMTP)
    // For production, use real SMTP (Gmail, SendGrid, etc.)

    if (process.env.NODE_ENV === 'production') {
        // Production SMTP configuration
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    } else {
        // Development: Log to console
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.ETHEREAL_USER || 'test@example.com',
                pass: process.env.ETHEREAL_PASS || 'password'
            }
        });
    }
};

// Send email helper
const sendEmail = async (options) => {
    try {
        // Skip actual email sending in development if SMTP not configured
        if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_USER) {
            console.log('📧 [DEV MODE] Email would be sent:');
            console.log('   To:', options.to);
            console.log('   Subject:', options.subject);
            console.log('   (Email sending skipped - configure SMTP in .env to enable)');
            return { success: true, messageId: 'dev-skip' };
        }

        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"CHRONOS Watch Store" <noreply@chronos.com>',
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text
        };

        const info = await transporter.sendMail(mailOptions);

        if (process.env.NODE_ENV !== 'production') {
            console.log('📧 Email sent:', info.messageId);
            console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }

        return { success: true, messageId: info.messageId };
    } catch (error) {
        // Log error but don't crash the app
        console.error('⚠️  Email send failed (non-fatal):', error.message);
        if (error.code === 'EAUTH') {
            console.error('   Gmail authentication failed. Please check:');
            console.error('   1. 2-Factor Authentication is enabled');
            console.error('   2. App Password is correct (16 characters)');
            console.error('   3. Visit: https://myaccount.google.com/apppasswords');
        }
        return { success: false, error: error.message };
    }
};

// Order confirmation email
exports.sendOrderConfirmation = async (order) => {
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <strong>${item.name}</strong><br>
                <span style="color: #666;">SL: ${item.quantity}</span>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                ${item.subtotal.toLocaleString('vi-VN')}₫
            </td>
        </tr>
    `).join('');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0B1020 0%, #070A12 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: #D6B25E; margin: 0; font-size: 32px;">CHRONOS</h1>
                <p style="color: #fff; margin: 10px 0 0;">Watch Store</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #0B1020; margin-top: 0;">Đơn hàng đã được tiếp nhận!</h2>
                
                <p>Xin chào <strong>${order.customer.name}</strong>,</p>
                
                <p>Cảm ơn bạn đã đặt hàng tại CHRONOS. Chúng tôi đã nhận được đơn hàng của bạn và đang xử lý.</p>
                
                <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #D6B25E;">
                    <h3 style="margin-top: 0; color: #D6B25E;">Thông tin đơn hàng</h3>
                    <p><strong>Mã đơn hàng:</strong> ${order.orderNumber}</p>
                    <p><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                    <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod === 'cod' ? 'COD (Thanh toán khi nhận hàng)' : 'Chuyển khoản ngân hàng'}</p>
                </div>
                
                <h3>Sản phẩm đã đặt:</h3>
                <table style="width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden;">
                    ${itemsHtml}
                    <tr>
                        <td style="padding: 10px; border-top: 2px solid #D6B25E;"><strong>Tạm tính</strong></td>
                        <td style="padding: 10px; border-top: 2px solid #D6B25E; text-align: right;">${order.itemsTotal.toLocaleString('vi-VN')}₫</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">Phí vận chuyển</td>
                        <td style="padding: 10px; text-align: right;">${order.shippingFee.toLocaleString('vi-VN')}₫</td>
                    </tr>
                    ${order.discount > 0 ? `
                    <tr>
                        <td style="padding: 10px; color: #16a34a;">Giảm giá</td>
                        <td style="padding: 10px; text-align: right; color: #16a34a;">-${order.discount.toLocaleString('vi-VN')}₫</td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td style="padding: 15px; border-top: 2px solid #D6B25E;"><strong style="font-size: 18px;">Tổng cộng</strong></td>
                        <td style="padding: 15px; border-top: 2px solid #D6B25E; text-align: right;"><strong style="font-size: 20px; color: #D6B25E;">${order.totalAmount.toLocaleString('vi-VN')}₫</strong></td>
                    </tr>
                </table>
                
                <h3>Địa chỉ giao hàng:</h3>
                <div style="background: #fff; padding: 15px; border-radius: 8px;">
                    <p style="margin: 5px 0;"><strong>${order.customer.name}</strong></p>
                    <p style="margin: 5px 0;">${order.customer.phone}</p>
                    <p style="margin: 5px 0;">${order.shippingAddress.address}</p>
                    <p style="margin: 5px 0;">${order.shippingAddress.ward}, ${order.shippingAddress.district}</p>
                    <p style="margin: 5px 0;">${order.shippingAddress.city}</p>
                </div>
                
                <div style="margin-top: 30px; text-align: center;">
                    <a href="${process.env.APP_URL || 'http://localhost:3000'}/orders/track?orderNumber=${order.orderNumber}&email=${order.customer.email}" 
                       style="display: inline-block; background: #D6B25E; color: #0B1020; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        THEO DÕI ĐơN HÀNG
                    </a>
                </div>
                
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                    Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline.<br>
                    <strong>Email:</strong> support@chronos.com<br>
                    <strong>Hotline:</strong> 1900 xxxx
                </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>&copy; 2024 CHRONOS Watch Store. All rights reserved.</p>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({
        to: order.customer.email,
        subject: `Xác nhận đơn hàng #${order.orderNumber} - CHRONOS`,
        html
    });
};

// Order status update email
exports.sendOrderStatusUpdate = async (order, oldStatus, newStatus, note) => {
    const statusMessages = {
        pending: 'Chờ xử lý',
        confirmed: 'Đã xác nhận',
        processing: 'Đang chuẩn bị hàng',
        shipping: 'Đang giao hàng',
        delivered: 'Đã giao hàng',
        cancelled: 'Đã hủy'
    };

    const statusColors = {
        pending: '#f59e0b',
        confirmed: '#3b82f6',
        processing: '#06b6d4',
        shipping: '#8b5cf6',
        delivered: '#10b981',
        cancelled: '#ef4444'
    };

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0B1020 0%, #070A12 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: #D6B25E; margin: 0; font-size: 32px;">CHRONOS</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #0B1020; margin-top: 0;">Cập nhật trạng thái đơn hàng</h2>
                
                <p>Xin chào <strong>${order.customer.name}</strong>,</p>
                
                <p>Đơn hàng <strong>#${order.orderNumber}</strong> của bạn đã được cập nhật trạng thái.</p>
                
                <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0 0 10px; color: #666;">Trạng thái mới:</p>
                    <div style="display: inline-block; background: ${statusColors[newStatus]}; color: #fff; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
                        ${statusMessages[newStatus]}
                    </div>
                    ${note ? `<p style="margin: 15px 0 0; color: #666; font-style: italic;">${note}</p>` : ''}
                </div>
                
                ${newStatus === 'shipping' ? `
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0;"><strong>📦 Đơn hàng đang được giao đến bạn!</strong></p>
                    <p style="margin: 10px 0 0;">Vui lòng để ý điện thoại để nhận hàng.</p>
                </div>
                ` : ''}
                
                ${newStatus === 'delivered' ? `
                <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0;"><strong>✅ Giao hàng thành công!</strong></p>
                    <p style="margin: 10px 0 0;">Cảm ơn bạn đã mua hàng tại CHRONOS. Đừng quên đánh giá sản phẩm nhé!</p>
                </div>
                ` : ''}
                
                <div style="margin-top: 30px; text-align: center;">
                    <a href="${process.env.APP_URL || 'http://localhost:3000'}/orders/track?orderNumber=${order.orderNumber}&email=${order.customer.email}" 
                       style="display: inline-block; background: #D6B25E; color: #0B1020; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        XEM CHI TIẾT ĐƠN HÀNG
                    </a>
                </div>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>&copy; 2024 CHRONOS Watch Store. All rights reserved.</p>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({
        to: order.customer.email,
        subject: `Đơn hàng #${order.orderNumber} - ${statusMessages[newStatus]}`,
        html
    });
};

// Password reset email
exports.sendPasswordReset = async (email, resetUrl, userName) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0B1020 0%, #070A12 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: #D6B25E; margin: 0; font-size: 32px;">CHRONOS</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #0B1020; margin-top: 0;">Đặt lại mật khẩu</h2>
                
                <p>Xin chào${userName ? ` <strong>${userName}</strong>` : ''},</p>
                
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                
                <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D6B25E;">
                    <p style="margin: 0;">Click vào nút bên dưới để đặt lại mật khẩu:</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; background: #D6B25E; color: #0B1020; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        ĐẶT LẠI MẬT KHẨU
                    </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                    Hoặc copy link sau vào trình duyệt:<br>
                    <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
                </p>
                
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; font-size: 14px;"><strong>⚠️ Lưu ý:</strong></p>
                    <ul style="margin: 10px 0 0; padding-left: 20px; font-size: 14px;">
                        <li>Link này chỉ có hiệu lực trong <strong>1 giờ</strong></li>
                        <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                    </ul>
                </div>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>&copy; 2024 CHRONOS Watch Store. All rights reserved.</p>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({
        to: email,
        subject: 'Đặt lại mật khẩu - CHRONOS',
        html
    });
};

// Welcome email (optional)
exports.sendWelcomeEmail = async (user) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0B1020 0%, #070A12 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: #D6B25E; margin: 0; font-size: 32px;">CHRONOS</h1>
                <p style="color: #fff; margin: 10px 0 0;">Chào mừng đến với thế giới đồng hồ</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #0B1020; margin-top: 0;">Chào mừng ${user.name}! 🎉</h2>
                
                <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>CHRONOS Watch Store</strong>.</p>
                
                <p>Tại CHRONOS, bạn sẽ tìm thấy:</p>
                <ul style="line-height: 2;">
                    <li>✨ Bộ sưu tập đồng hồ cao cấp từ các thương hiệu nổi tiếng</li>
                    <li>🎁 Ưu đãi và khuyến mãi độc quyền</li>
                    <li>🚚 Giao hàng miễn phí cho đơn từ 2 triệu</li>
                    <li>🛡️ Bảo hành chính hãng</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.APP_URL || 'http://localhost:3000'}/products" 
                       style="display: inline-block; background: #D6B25E; color: #0B1020; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        KHÁM PHÁ SẢN PHẨM
                    </a>
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    Cần hỗ trợ? Liên hệ với chúng tôi:<br>
                    <strong>Email:</strong> support@chronos.com<br>
                    <strong>Hotline:</strong> 1900 xxxx
                </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>&copy; 2024 CHRONOS Watch Store. All rights reserved.</p>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({
        to: user.email,
        subject: 'Chào mừng đến với CHRONOS! 🎉',
        html
    });
};

module.exports = exports;

// Contact confirmation email
exports.sendContactConfirmation = async (name, email, message) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0B1020 0%, #070A12 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: #D6B25E; margin: 0; font-size: 32px;">CHRONOS</h1>
                <p style="color: #fff; margin: 10px 0 0;">Xác nhận liên hệ</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #0B1020; margin-top: 0;">Cảm ơn bạn đã liên hệ, ${name}! 📧</h2>
                
                <p>Chúng tôi đã nhận được tin nhắn của bạn:</p>
                
                <div style="background: white; border-left: 4px solid #D6B25E; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0; color: #666;"><strong>Nội dung:</strong></p>
                    <p style="margin: 10px 0 0;">${message.replace(/\n/g, '<br>')}</p>
                </div>
                
                <p>Đội ngũ CHRONOS sẽ sớm xem xét và phản hồi với bạn trong vòng <strong>24 giờ</strong>.</p>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    Nếu bạn có thêm câu hỏi, vui lòng liên hệ:<br>
                    <strong>Email:</strong> support@chronos.com<br>
                    <strong>Hotline:</strong> 1900 1234 56
                </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>&copy; 2024 CHRONOS Watch Store. All rights reserved.</p>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({
        to: email,
        subject: 'Xác nhận liên hệ - CHRONOS',
        html
    });
};

// Contact notification email to admin
exports.sendContactNotification = async (contact) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@chronos.com';
    const subjectMap = {
        'general': 'Thắc mắc chung',
        'product': 'Tư vấn sản phẩm',
        'order': 'Theo dõi đơn hàng',
        'warranty': 'Bảo hành',
        'other': 'Khác'
    };

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0B1020 0%, #070A12 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: #D6B25E; margin: 0; font-size: 32px;">CHRONOS</h1>
                <p style="color: #fff; margin: 10px 0 0;">Tin nhắn liên hệ mới</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #0B1020; margin-top: 0;">📬 Tin nhắn liên hệ mới</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 12px 0; font-weight: bold; color: #0B1020; width: 30%;">Tên:</td>
                        <td style="padding: 12px 0;">${contact.name}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 12px 0; font-weight: bold; color: #0B1020;">Email:</td>
                        <td style="padding: 12px 0;"><a href="mailto:${contact.email}">${contact.email}</a></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 12px 0; font-weight: bold; color: #0B1020;">Điện thoại:</td>
                        <td style="padding: 12px 0;">${contact.phone || 'Không cung cấp'}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 12px 0; font-weight: bold; color: #0B1020;">Chủ đề:</td>
                        <td style="padding: 12px 0;">${subjectMap[contact.subject] || contact.subject}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; font-weight: bold; color: #0B1020;">Ngày gửi:</td>
                        <td style="padding: 12px 0;">${new Date(contact.createdAt).toLocaleString('vi-VN')}</td>
                    </tr>
                </table>
                
                <div style="background: white; border-left: 4px solid #D6B25E; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0; color: #666;"><strong>Nội dung:</strong></p>
                    <p style="margin: 10px 0 0;">${contact.message.replace(/\n/g, '<br>')}</p>
                </div>
                
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.APP_URL || 'http://localhost:3000'}/admin/contacts" 
                       style="display: inline-block; background: #D6B25E; color: #0B1020; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        XEM CHI TIẾT
                    </a>
                </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>&copy; 2024 CHRONOS Watch Store. All rights reserved.</p>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({
        to: adminEmail,
        subject: `[LIÊN HỆ] ${subjectMap[contact.subject] || contact.subject} - ${contact.name}`,
        html
    });
};
