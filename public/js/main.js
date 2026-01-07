// ==========================================
// CHRONOS - Main JavaScript
// ==========================================

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const title = document.getElementById('toast-title');
    const msg = document.getElementById('toast-message');

    if (!toast) {
        // Create toast if not exists
        const toastHtml = `
      <div id="toast" class="fixed bottom-8 right-8 bg-dark border border-gold/30 text-white px-6 py-4 rounded shadow-2xl z-[100] flex items-center gap-3 transition-all duration-300">
        <iconify-icon icon="lucide:check-circle" class="text-gold" id="toast-icon"></iconify-icon>
        <div>
          <h5 class="text-sm font-bold" id="toast-title">Thành công</h5>
          <p class="text-xs text-muted" id="toast-message"></p>
        </div>
      </div>
    `;
        document.body.insertAdjacentHTML('beforeend', toastHtml);
    }

    const toastEl = document.getElementById('toast');
    const iconEl = document.getElementById('toast-icon');

    if (type === 'success') {
        toastEl.classList.remove('border-red-500/30');
        toastEl.classList.add('border-gold/30');
        iconEl.setAttribute('icon', 'lucide:check-circle');
        iconEl.classList.remove('text-red-400');
        iconEl.classList.add('text-gold');
        document.getElementById('toast-title').textContent = 'Thành công';
    } else {
        toastEl.classList.remove('border-gold/30');
        toastEl.classList.add('border-red-500/30');
        iconEl.setAttribute('icon', 'lucide:alert-circle');
        iconEl.classList.remove('text-gold');
        iconEl.classList.add('text-red-400');
        document.getElementById('toast-title').textContent = 'Lỗi';
    }

    document.getElementById('toast-message').textContent = message;
    toastEl.classList.remove('hidden', 'translate-y-24');

    setTimeout(() => {
        toastEl.classList.add('translate-y-24');
        setTimeout(() => toastEl.classList.add('hidden'), 300);
    }, 3000);
}

// Add to Cart
async function addToCart(productId, quantity = 1) {
    try {
        const response = await fetch('/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: parseInt(quantity) })
        });

        const data = await response.json();

        if (data.success) {
            showToast(data.message || 'Đã thêm vào giỏ hàng');
            // Update cart badge
            const badges = document.querySelectorAll('.cart-badge, [data-cart-count]');
            badges.forEach(badge => {
                badge.textContent = data.cart.totalQty;
                badge.style.display = 'flex';
            });
        } else {
            showToast(data.message || 'Có lỗi xảy ra', 'error');
        }
    } catch (error) {
        console.error('Add to cart error:', error);
        showToast('Có lỗi xảy ra', 'error');
    }
}

// Update Cart
async function updateCart(productId, quantity) {
    if (quantity < 1) {
        removeFromCart(productId);
        return;
    }

    try {
        const response = await fetch('/cart/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: parseInt(quantity) })
        });

        const data = await response.json();

        if (data.success) {
            location.reload();
        } else {
            showToast(data.message || 'Có lỗi xảy ra', 'error');
        }
    } catch (error) {
        console.error('Update cart error:', error);
        showToast('Có lỗi xảy ra', 'error');
    }
}

// Remove from Cart
async function removeFromCart(productId) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
        const response = await fetch(`/cart/remove/${productId}`, { method: 'DELETE' });
        const data = await response.json();

        if (data.success) {
            location.reload();
        } else {
            showToast(data.message || 'Có lỗi xảy ra', 'error');
        }
    } catch (error) {
        console.error('Remove from cart error:', error);
        showToast('Có lỗi xảy ra', 'error');
    }
}

// Clear Cart
async function clearCart() {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) return;

    try {
        const response = await fetch('/cart/clear', { method: 'DELETE' });
        const data = await response.json();

        if (data.success) {
            location.reload();
        }
    } catch (error) {
        console.error('Clear cart error:', error);
        showToast('Có lỗi xảy ra', 'error');
    }
}

// Apply Coupon
async function applyCoupon() {
    const code = document.getElementById('couponCode')?.value?.trim();

    if (!code) {
        showToast('Vui lòng nhập mã giảm giá', 'error');
        return;
    }

    try {
        const response = await fetch('/cart/apply-coupon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });

        const data = await response.json();

        if (data.success) {
            showToast(data.message || 'Đã áp dụng mã giảm giá');
            location.reload();
        } else {
            showToast(data.message || 'Mã giảm giá không hợp lệ', 'error');
        }
    } catch (error) {
        console.error('Apply coupon error:', error);
        showToast('Có lỗi xảy ra', 'error');
    }
}

// Toggle Wishlist
async function toggleWishlist(productId) {
    try {
        const response = await fetch(`/users/wishlist/${productId}`, { method: 'POST' });

        if (response.status === 401) {
            window.location.href = '/auth/login';
            return;
        }

        const data = await response.json();

        if (data.success) {
            showToast(data.message || 'Đã cập nhật danh sách yêu thích');
        } else {
            showToast(data.message || 'Có lỗi xảy ra', 'error');
        }
    } catch (error) {
        console.error('Toggle wishlist error:', error);
        window.location.href = '/auth/login';
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}
