// connector.js - ربط الصفحات بـ Node.js API

class AppConnector {
    constructor() {
        this.apiBase = '/api';
        this.init();
    }
    
    init() {
        // التحقق من اتصال الخادم
        this.checkServerStatus();
        
        // إضافة event listeners للأزرار الديناميكية
        this.bindDynamicButtons();
        
        // التحقق من حالة المستخدم
        this.checkUserStatus();
    }
    
    async checkServerStatus() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            
            console.log('✅ حالة الخادم:', data);
            
            // إضافة badge في شريط التنقل
            this.addStatusBadge(data);
            
        } catch (error) {
            console.error('❌ لا يمكن الاتصال بالخادم:', error);
            this.showOfflineWarning();
        }
    }
    
    addStatusBadge(data) {
        // إضافة مؤشر الحالة في الصفحة
        const statusHtml = `
            <div id="server-status" style="position: fixed; bottom: 20px; right: 20px; background: ${data.database === 'connected' ? '#10B981' : '#EF4444'}; color: white; padding: 10px 15px; border-radius: 20px; font-size: 0.9rem; z-index: 1000;">
                <i class="fas fa-server"></i>
                ${data.database === 'connected' ? '✅ متصل' : '❌ غير متصل'}
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', statusHtml);
    }
    
    showOfflineWarning() {
        const warningHtml = `
            <div style="position: fixed; top: 20px; right: 20px; left: 20px; background: #F59E0B; color: white; padding: 15px; border-radius: 10px; z-index: 1000; text-align: center;">
                <i class="fas fa-exclamation-triangle"></i>
                الوضع التجريبي - بعض المميزات قد لا تعمل
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', warningHtml);
    }
    
    bindDynamicButtons() {
        // ربط أزرار الذكاء الاصطناعي
        document.querySelectorAll('[data-ai-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleAIAction(e.target.dataset.aiAction);
            });
        });
        
        // ربط أزرار النشر على Vercel
        document.querySelectorAll('[data-vercel-deploy]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleVercelDeploy(e.target.dataset.vercelDeploy);
            });
        });
    }
    
    async handleAIAction(action) {
        try {
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: action })
            });
            
            const data = await response.json();
            this.showNotification(data.message, 'success');
            
        } catch (error) {
            this.showNotification('فشل في الاتصال بالذكاء الاصطناعي', 'error');
        }
    }
    
    async handleVercelDeploy(siteName) {
        try {
            const response = await fetch('/api/vercel/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ siteName: siteName })
            });
            
            const data = await response.json();
            this.showNotification(data.message, 'success');
            
        } catch (error) {
            this.showNotification('فشل في النشر على Vercel', 'error');
        }
    }
    
    checkUserStatus() {
        // التحقق من وجود بيانات مستخدم في localStorage
        const userData = localStorage.getItem('userData');
        
        if (userData) {
            const user = JSON.parse(userData);
            this.updateUIForLoggedInUser(user);
        } else {
            this.updateUIForGuest();
        }
    }
    
    updateUIForLoggedInUser(user) {
        // تحديث واجهة المستخدم للمستخدم المسجل
        document.querySelectorAll('.user-guest').forEach(el => {
            el.style.display = 'none';
        });
        
        document.querySelectorAll('.user-logged-in').forEach(el => {
            el.style.display = 'block';
        });
        
        // تحديث اسم المستخدم
        document.querySelectorAll('.user-name').forEach(el => {
            el.textContent = user.name || 'مستخدم';
        });
    }
    
    updateUIForGuest() {
        // تحديث واجهة المستخدم للزائر
        document.querySelectorAll('.user-logged-in').forEach(el => {
            el.style.display = 'none';
        });
        
        document.querySelectorAll('.user-guest').forEach(el => {
            el.style.display = 'block';
        });
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div>${message}</div>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// تهيئة الموصل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.appConnector = new AppConnector();
});