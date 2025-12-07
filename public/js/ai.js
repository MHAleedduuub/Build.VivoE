class AIGenerator {
    constructor() {
        this.apiKey = null;
        this.init();
    }
    
    async init() {
        this.loadAPIKey();
        await this.checkAPIStatus();
    }
    
    loadAPIKey() {
        // تحميل المفتاح من localStorage أو البيئة
        this.apiKey = localStorage.getItem('gemini_api_key') || 
                      window.geminiApiKey;
    }
    
    async checkAPIStatus() {
        try {
            const response = await fetch('/api/ai/status');
            const data = await response.json();
            return data.available;
        } catch (error) {
            console.error('❌ الذكاء الاصطناعي غير متوفر:', error);
            return false;
        }
    }
    
    async generateWebsite(prompt, options = {}) {
        try {
            showLoading('جاري إنشاء الموقع بالذكاء الاصطناعي...');
            
            const response = await fetch('/ai/generate-website', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    prompt: prompt,
                    type: options.type || 'business',
                    style: options.style || 'modern',
                    colors: options.colors || ['#3B82F6', '#10B981'],
                    pages: options.pages || ['home', 'about', 'contact']
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // عرض النتيجة
                displayGeneratedWebsite(data.data);
                return data.data;
            } else {
                throw new Error(data.message || 'فشل في الإنشاء');
            }
        } catch (error) {
            showAlert(`❌ ${error.message}`, 'error');
            throw error;
        } finally {
            hideLoading();
        }
    }
    
    async optimizeContent(content, target = 'seo') {
        try {
            const response = await fetch('/ai/optimize-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, target })
            });
            
            return await response.json();
        } catch (error) {
            console.error('خطأ في تحسين المحتوى:', error);
            throw error;
        }
    }
    
    async generateContent(topic, options = {}) {
        try {
            const response = await fetch('/ai/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    tone: options.tone || 'professional',
                    length: options.length || 'medium'
                })
            });
            
            return await response.json();
        } catch (error) {
            console.error('خطأ في توليد المحتوى:', error);
            throw error;
        }
    }
    
    async analyzeImage(imageFile) {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            
            const response = await fetch('/ai/analyze-image', {
                method: 'POST',
                body: formData
            });
            
            return await response.json();
        } catch (error) {
            console.error('خطأ في تحليل الصورة:', error);
            throw error;
        }
    }
}

// تهيئة الذكاء الاصطناعي
const aiGenerator = new AIGenerator();

// دالة لعرض النتائج
function displayGeneratedWebsite(data) {
    const previewArea = document.getElementById('ai-preview');
    previewArea.innerHTML = `
        <div class="generated-website">
            <div class="preview-header">
                <h3>✅ تم إنشاء الموقع بنجاح</h3>
                <button onclick="applyWebsite()" class="btn btn-success">تطبيق التصميم</button>
            </div>
            <div class="code-preview">
                <div class="code-tabs">
                    <button class="tab-btn active" onclick="showTab('html')">HTML</button>
                    <button class="tab-btn" onclick="showTab('css')">CSS</button>
                    <button class="tab-btn" onclick="showTab('js')">JavaScript</button>
                </div>
                <div class="tab-content">
                    <pre id="html-tab" class="active"><code>${escapeHTML(data.html)}</code></pre>
                    <pre id="css-tab"><code>${escapeHTML(data.css)}</code></pre>
                    <pre id="js-tab"><code>${escapeHTML(data.js)}</code></pre>
                </div>
            </div>
        </div>
    `;
}

// دالة الهروب HTML
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// إظهار/إخفاء التبويبات
function showTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content pre').forEach(tab => {
        tab.classList.remove('active');
    });
    
    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// تطبيق التصميم
function applyWebsite() {
    // تطبيق التصميم على البناء
    showAlert('تم تطبيق التصميم على منشئ المواقع', 'success');
}