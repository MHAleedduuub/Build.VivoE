// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 موقع إنشاء المواقع جاهز!');
    
    // التحقق من حالة المستخدم
    checkUserStatus();
    
    // إضافة event listeners
    initEventListeners();
    
    // تحميل البيانات الأولية
    loadInitialData();
});

// التحقق من حالة المستخدم
function checkUserStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        // المستخدم مسجل الدخول
        document.body.classList.add('user-logged-in');
    } else {
        // مستخدم زائر
        document.body.classList.add('user-guest');
    }
}

// تهيئة event listeners
function initEventListeners() {
    // تنشيط القوائم
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // أزرار التنبيهات
    const alertCloseButtons = document.querySelectorAll('.alert-close');
    alertCloseButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.style.display = 'none';
        });
    });
}

// تحميل البيانات الأولية
async function loadInitialData() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        console.log('✅ حالة الخادم:', data);
    } catch (error) {
        console.error('❌ خطأ في تحميل البيانات:', error);
    }
}

// إظهار/إخفاء القائمة المتنقلة
function toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    mobileMenu.classList.toggle('active');
}

// إظهار التنبيه
function showAlert(message, type = 'info', duration = 5000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} fixed top-4 right-4 z-50`;
    alertDiv.innerHTML = `
        <div class="flex items-center">
            <span>${message}</span>
            <button class="alert-close mr-2 text-xl">&times;</button>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // إضافة event listener للإغلاق
    alertDiv.querySelector('.alert-close').addEventListener('click', () => {
        alertDiv.remove();
    });
    
    // إزالة تلقائية بعد المدة
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, duration);
}

// تنسيق التاريخ
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// نسخ النص
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => showAlert('تم النسخ!', 'success'))
        .catch(err => showAlert('فشل النسخ', 'error'));
}