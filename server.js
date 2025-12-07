require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();

// إعدادات أساسية
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// إعداد EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// الاتصال بقاعدة البيانات
async function connectDB() {
    try {
        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('✅ تم الاتصال بـ MongoDB');
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ خطأ في MongoDB:', error.message);
        return false;
    }
}

// ===== Builder Routes =====

// صفحة Builder الرئيسية
app.get('/builder', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>🎨 منشئ المواقع - السحب والإفلات</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                
                body {
                    background: #f5f7fa;
                    height: 100vh;
                    overflow: hidden;
                }
                
                /* شريط التنقل */
                .navbar {
                    background: white;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    height: 70px;
                    padding: 0 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .logo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #3B82F6;
                    text-decoration: none;
                }
                
                .builder-actions {
                    display: flex;
                    gap: 10px;
                }
                
                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s;
                }
                
                .btn-primary {
                    background: #3B82F6;
                    color: white;
                }
                
                .btn-primary:hover {
                    background: #2563EB;
                    transform: translateY(-2px);
                }
                
                .btn-success {
                    background: #10B981;
                    color: white;
                }
                
                .btn-outline {
                    background: white;
                    border: 2px solid #3B82F6;
                    color: #3B82F6;
                }
                
                /* واجهة البناء */
                .builder-container {
                    display: flex;
                    height: calc(100vh - 70px);
                }
                
                /* شريط الأدوات */
                .toolbox {
                    width: 300px;
                    background: white;
                    border-right: 1px solid #e5e7eb;
                    padding: 20px;
                    overflow-y: auto;
                }
                
                .toolbox-section {
                    margin-bottom: 25px;
                }
                
                .toolbox-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 15px;
                    color: #374151;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .components-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }
                
                .component-item {
                    background: #f9fafb;
                    border: 2px dashed #d1d5db;
                    border-radius: 8px;
                    padding: 15px;
                    text-align: center;
                    cursor: move;
                    transition: all 0.2s;
                }
                
                .component-item:hover {
                    background: #e0e7ff;
                    border-color: #3B82F6;
                    transform: translateY(-2px);
                }
                
                .component-icon {
                    font-size: 1.5rem;
                    margin-bottom: 8px;
                    color: #6B7280;
                }
                
                /* منطقة البناء */
                .canvas-area {
                    flex: 1;
                    padding: 20px;
                    background: #f8fafc;
                    overflow: auto;
                }
                
                .canvas {
                    background: white;
                    min-height: 800px;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    border-radius: 12px;
                    padding: 30px;
                    position: relative;
                }
                
                .droppable-area {
                    min-height: 200px;
                    border: 3px dashed #9ca3af;
                    border-radius: 10px;
                    margin: 10px 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #6b7280;
                    background: #f9fafb;
                    transition: all 0.3s;
                }
                
                .droppable-area.active {
                    border-color: #3B82F6;
                    background: #e0e7ff;
                }
                
                /* المكونات المضافة */
                .added-component {
                    background: white;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    padding: 20px;
                    margin-bottom: 15px;
                    position: relative;
                    transition: all 0.3s;
                }
                
                .added-component:hover {
                    border-color: #3B82F6;
                }
                
                .component-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .component-actions {
                    display: flex;
                    gap: 5px;
                }
                
                .component-action-btn {
                    width: 30px;
                    height: 30px;
                    border: none;
                    border-radius: 6px;
                    background: #f3f4f6;
                    color: #6b7280;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .component-action-btn:hover {
                    background: #e5e7eb;
                }
                
                .delete-btn {
                    background: #fee2e2;
                    color: #dc2626;
                }
                
                .delete-btn:hover {
                    background: #fecaca;
                }
                
                /* شريط الخصائص */
                .properties-panel {
                    width: 300px;
                    background: white;
                    border-left: 1px solid #e5e7eb;
                    padding: 20px;
                    overflow-y: auto;
                }
                
                .properties-header {
                    margin-bottom: 20px;
                }
                
                .property-group {
                    margin-bottom: 20px;
                }
                
                .property-label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: #4b5563;
                }
                
                .property-input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                }
                
                /* معاينة حية */
                .preview-box {
                    background: #f9fafb;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    padding: 15px;
                    margin-bottom: 15px;
                    min-height: 100px;
                }
                
                /* الذكاء الاصطناعي */
                .ai-section {
                    background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
                    color: white;
                    padding: 15px;
                    border-radius: 10px;
                    margin-top: 20px;
                }
                
                .ai-btn {
                    width: 100%;
                    padding: 12px;
                    background: white;
                    color: #8b5cf6;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 10px;
                }
                
                .ai-btn:hover {
                    background: #f8fafc;
                }
                
                /* Mobile */
                @media (max-width: 1024px) {
                    .properties-panel {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <!-- شريط التنقل -->
            <nav class="navbar">
                <a href="/" class="logo">
                    🎨 منشئ المواقع
                </a>
                
                <div class="builder-actions">
                    <input type="text" id="project-name" value="مشروعي الجديد" 
                           style="padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-weight: 600;">
                    
                    <button class="btn btn-outline" onclick="saveProject()">
                        💾 حفظ
                    </button>
                    <button class="btn btn-primary" onclick="previewProject()">
                        👁️ معاينة
                    </button>
                    <button class="btn btn-success" onclick="publishProject()">
                        🚀 نشر
                    </button>
                </div>
            </nav>

            <!-- واجهة البناء -->
            <div class="builder-container">
                <!-- شريط الأدوات -->
                <div class="toolbox">
                    <div class="toolbox-section">
                        <div class="toolbox-title">
                            📦 المكونات الأساسية
                        </div>
                        <div class="components-grid">
                            <div class="component-item" draggable="true" data-type="hero">
                                <div class="component-icon">⭐</div>
                                <div>قسم البطل</div>
                            </div>
                            <div class="component-item" draggable="true" data-type="features">
                                <div class="component-icon">🔧</div>
                                <div>المميزات</div>
                            </div>
                            <div class="component-item" draggable="true" data-type="about">
                                <div class="component-icon">ℹ️</div>
                                <div>من نحن</div>
                            </div>
                            <div class="component-item" draggable="true" data-type="contact">
                                <div class="component-icon">📞</div>
                                <div>اتصل بنا</div>
                            </div>
                            <div class="component-item" draggable="true" data-type="gallery">
                                <div class="component-icon">🖼️</div>
                                <div>معرض الصور</div>
                            </div>
                            <div class="component-item" draggable="true" data-type="testimonials">
                                <div class="component-icon">💬</div>
                                <div>آراء العملاء</div>
                            </div>
                        </div>
                    </div>

                    <div class="toolbox-section">
                        <div class="toolbox-title">
                            🎨 التصميم
                        </div>
                        <div class="components-grid">
                            <div class="component-item" draggable="true" data-type="header">
                                <div class="component-icon">📋</div>
                                <div>رأس الموقع</div>
                            </div>
                            <div class="component-item" draggable="true" data-type="footer">
                                <div class="component-icon">⬇️</div>
                                <div>تذييل الموقع</div>
                            </div>
                            <div class="component-item" draggable="true" data-type="button">
                                <div class="component-icon">🔘</div>
                                <div>زر</div>
                            </div>
                            <div class="component-item" draggable="true" data-type="card">
                                <div class="component-icon">🃏</div>
                                <div>بطاقة</div>
                            </div>
                        </div>
                    </div>

                    <!-- الذكاء الاصطناعي -->
                    <div class="ai-section">
                        <div class="toolbox-title" style="color: white;">
                            🤖 مساعد الذكاء
                        </div>
                        <button class="ai-btn" onclick="openAIModal()">
                            ✨ إنشاء بالذكاء الاصطناعي
                        </button>
                        <button class="ai-btn" onclick="optimizeWithAI()" style="background: rgba(255,255,255,0.2); color: white; margin-top: 8px;">
                            🔧 تحسين التصميم
                        </button>
                    </div>
                </div>

                <!-- منطقة البناء -->
                <div class="canvas-area">
                    <div class="canvas" id="main-canvas">
                        <div class="droppable-area" id="drop-zone">
                            <div style="text-align: center; padding: 40px;">
                                <div style="font-size: 3rem; color: #9ca3af; margin-bottom: 20px;">
                                    📍
                                </div>
                                <h3 style="color: #6b7280; margin-bottom: 10px;">
                                    ابدأ ببناء موقعك
                                </h3>
                                <p style="color: #9ca3af;">
                                    اسحب المكونات من الشريط الأيسر واتركها هنا
                                </p>
                            </div>
                        </div>
                        
                        <!-- المكونات المضافة ستظهر هنا -->
                        <div id="components-container"></div>
                    </div>
                </div>

                <!-- شريط الخصائص -->
                <div class="properties-panel">
                    <div class="properties-header">
                        <h3 style="margin-bottom: 10px;">⚙️ خصائص العنصر</h3>
                        <p style="color: #6B7280; font-size: 0.9rem;" id="selected-element-info">
                            اختر عنصراً لعرض خصائصه
                        </p>
                    </div>
                    
                    <div id="properties-content">
                        <div style="text-align: center; padding: 40px 20px; color: #9CA3AF;">
                            <div style="font-size: 3rem; margin-bottom: 20px;">
                                🎯
                            </div>
                            <p>اختر عنصراً لتعديل خصائصه</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- نافذة الذكاء الاصطناعي -->
            <div id="ai-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 15px; width: 90%; max-width: 500px; padding: 30px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="font-size: 1.5rem;">🤖 مساعد الذكاء الاصطناعي</h2>
                        <button onclick="closeAIModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6B7280;">&times;</button>
                    </div>
                    
                    <textarea id="ai-prompt" 
                              style="width: 100%; padding: 15px; border: 2px solid #e5e7eb; border-radius: 10px; height: 150px; margin-bottom: 20px;"
                              placeholder="صف ما تريد إنشاءه... مثال: أريد صفحة رئيسية لموقع أعمال مع قسم مميزات وآراء العملاء ونموذج اتصال"></textarea>
                    
                    <button class="ai-btn" onclick="generateWithAI()" style="width: 100%; padding: 15px; background: #8B5CF6; color: white;">
                        ✨ أنشئ بالذكاء الاصطناعي
                    </button>
                </div>
            </div>

            <script>
                // ===== متغيرات التطبيق =====
                let components = [];
                let selectedComponent = null;
                let projectData = {
                    name: 'مشروعي الجديد',
                    components: [],
                    settings: {}
                };

                // ===== تهيئة السحب والإفلات =====
                function initDragAndDrop() {
                    const draggables = document.querySelectorAll('.component-item');
                    const canvas = document.getElementById('main-canvas');
                    const dropZone = document.getElementById('drop-zone');

                    // جعل العناصر قابلة للسحب
                    draggables.forEach(item => {
                        item.addEventListener('dragstart', (e) => {
                            e.dataTransfer.setData('component-type', item.dataset.type);
                            item.style.opacity = '0.5';
                        });

                        item.addEventListener('dragend', () => {
                            item.style.opacity = '1';
                        });
                    });

                    // منطقة الإفلات
                    canvas.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        dropZone.classList.add('active');
                    });

                    canvas.addEventListener('dragleave', () => {
                        dropZone.classList.remove('active');
                    });

                    canvas.addEventListener('drop', (e) => {
                        e.preventDefault();
                        dropZone.classList.remove('active');
                        
                        const type = e.dataTransfer.getData('component-type');
                        if (type) {
                            addComponent(type);
                        }
                    });
                }

                // ===== إضافة مكون جديد =====
                function addComponent(type) {
                    const component = {
                        id: Date.now(),
                        type: type,
                        content: getDefaultContent(type),
                        styles: getDefaultStyles(type),
                        position: components.length
                    };

                    components.push(component);
                    renderComponent(component);
                    selectComponent(component.id);
                    
                    // إخفاء منطقة الإفلات إذا كان هناك مكونات
                    if (components.length > 0) {
                        document.getElementById('drop-zone').style.display = 'none';
                    }
                }

                // ===== عرض المكون =====
                function renderComponent(component) {
                    const container = document.getElementById('components-container');
                    
                    const element = document.createElement('div');
                    element.className = 'added-component';
                    element.dataset.id = component.id;
                    
                    let html = '';
                    switch(component.type) {
                        case 'hero':
                            html = `
                                <div class="component-header">
                                    <h4>⭐ قسم البطل</h4>
                                    <div class="component-actions">
                                        <button class="component-action-btn" onclick="editComponent(${component.id})">✏️</button>
                                        <button class="component-action-btn delete-btn" onclick="deleteComponent(${component.id})">🗑️</button>
                                    </div>
                                </div>
                                <div class="preview-box">
                                    <h2 style="color: #3B82F6; margin-bottom: 10px;">${component.content.title}</h2>
                                    <p style="color: #6B7280;">${component.content.subtitle}</p>
                                    <button style="margin-top: 15px; padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 8px;">
                                        ${component.content.buttonText}
                                    </button>
                                </div>
                            `;
                            break;
                            
                        case 'features':
                            html = `
                                <div class="component-header">
                                    <h4>🔧 قسم المميزات</h4>
                                    <div class="component-actions">
                                        <button class="component-action-btn" onclick="editComponent(${component.id})">✏️</button>
                                        <button class="component-action-btn delete-btn" onclick="deleteComponent(${component.id})">🗑️</button>
                                    </div>
                                </div>
                                <div class="preview-box">
                                    <h3 style="margin-bottom: 15px;">${component.content.title}</h3>
                                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                                        ${component.content.items.map(item => `
                                            <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
                                                <div style="font-size: 1.5rem; margin-bottom: 10px;">${item.icon}</div>
                                                <p>${item.text}</p>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `;
                            break;
                            
                        default:
                            html = `
                                <div class="component-header">
                                    <h4>${component.type}</h4>
                                    <div class="component-actions">
                                        <button class="component-action-btn" onclick="editComponent(${component.id})">✏️</button>
                                        <button class="component-action-btn delete-btn" onclick="deleteComponent(${component.id})">🗑️</button>
                                    </div>
                                </div>
                                <div class="preview-box">
                                    <p>مكون ${component.type}</p>
                                </div>
                            `;
                    }
                    
                    element.innerHTML = html;
                    
                    // إضافة حدث النقر لاختيار المكون
                    element.addEventListener('click', (e) => {
                        if (!e.target.closest('.component-actions')) {
                            selectComponent(component.id);
                        }
                    });
                    
                    container.appendChild(element);
                }

                // ===== المحتوى الافتراضي =====
                function getDefaultContent(type) {
                    const defaults = {
                        hero: {
                            title: 'عنوان رئيسي جذاب',
                            subtitle: 'وصف مختصر يعبر عن موقعك أو منتجك',
                            buttonText: 'ابدأ الآن'
                        },
                        features: {
                            title: 'مميزاتنا',
                            items: [
                                { icon: '⚡', text: 'سريع' },
                                { icon: '🔒', text: 'آمن' },
                                { icon: '🎨', text: 'متجاوب' }
                            ]
                        },
                        about: {
                            title: 'من نحن',
                            content: 'نحن فريق متخصص في...'
                        },
                        contact: {
                            title: 'اتصل بنا',
                            email: 'info@example.com',
                            phone: '+966 123 456 789'
                        }
                    };
                    
                    return defaults[type] || { title: `مكون ${type}` };
                }

                function getDefaultStyles(type) {
                    const defaults = {
                        hero: {
                            backgroundColor: '#3B82F6',
                            textColor: '#FFFFFF',
                            buttonColor: '#FFFFFF',
                            buttonTextColor: '#3B82F6'
                        },
                        features: {
                            backgroundColor: '#FFFFFF',
                            textColor: '#1F2937',
                            cardBackground: '#F8FAFC'
                        }
                    };
                    
                    return defaults[type] || {};
                }

                // ===== اختيار المكون =====
                function selectComponent(id) {
                    // إزالة التحديد السابق
                    document.querySelectorAll('.added-component').forEach(el => {
                        el.style.borderColor = '#e5e7eb';
                    });
                    
                    selectedComponent = components.find(c => c.id === id);
                    
                    if (selectedComponent) {
                        const element = document.querySelector(\`[data-id="\${id}"]\`);
                        element.style.borderColor = '#3B82F6';
                        updatePropertiesPanel();
                    }
                }

                // ===== تحديث شريط الخصائص =====
                function updatePropertiesPanel() {
                    const panel = document.getElementById('properties-content');
                    const info = document.getElementById('selected-element-info');
                    
                    if (!selectedComponent) {
                        panel.innerHTML = \`
                            <div style="text-align: center; padding: 40px 20px; color: #9CA3AF;">
                                <div style="font-size: 3rem; margin-bottom: 20px;">🎯</div>
                                <p>اختر عنصراً لتعديل خصائصه</p>
                            </div>
                        \`;
                        info.textContent = 'اختر عنصراً لعرض خصائصه';
                        return;
                    }
                    
                    info.textContent = \`تعديل: \${selectedComponent.type}\`;
                    
                    let propertiesHTML = \`
                        <div class="property-group">
                            <label class="property-label">النوع</label>
                            <input type="text" class="property-input" value="\${selectedComponent.type}" disabled>
                        </div>
                    \`;
                    
                    // خصائص حسب النوع
                    switch(selectedComponent.type) {
                        case 'hero':
                            propertiesHTML += \`
                                <div class="property-group">
                                    <label class="property-label">العنوان</label>
                                    <input type="text" class="property-input" value="\${selectedComponent.content.title}" 
                                           onchange="updateComponentContent('title', this.value)">
                                </div>
                                <div class="property-group">
                                    <label class="property-label">الوصف</label>
                                    <textarea class="property-input" rows="3" 
                                              onchange="updateComponentContent('subtitle', this.value)">\${selectedComponent.content.subtitle}</textarea>
                                </div>
                                <div class="property-group">
                                    <label class="property-label">نص الزر</label>
                                    <input type="text" class="property-input" value="\${selectedComponent.content.buttonText}" 
                                           onchange="updateComponentContent('buttonText', this.value)">
                                </div>
                                <div class="property-group">
                                    <label class="property-label">لون الخلفية</label>
                                    <input type="color" class="property-input" value="\${selectedComponent.styles.backgroundColor || '#3B82F6'}" 
                                           onchange="updateComponentStyle('backgroundColor', this.value)">
                                </div>
                            \`;
                            break;
                            
                        case 'features':
                            propertiesHTML += \`
                                <div class="property-group">
                                    <label class="property-label">العنوان</label>
                                    <input type="text" class="property-input" value="\${selectedComponent.content.title}" 
                                           onchange="updateComponentContent('title', this.value)">
                                </div>
                                <div class="property-group">
                                    <label class="property-label">عدد العناصر</label>
                                    <input type="number" class="property-input" value="\${selectedComponent.content.items.length}" min="1" max="6"
                                           onchange="updateFeatureItems(this.value)">
                                </div>
                            \`;
                            break;
                    }
                    
                    propertiesHTML += \`
                        <div class="property-group">
                            <button class="btn btn-primary" onclick="saveComponentChanges()" style="width: 100%; margin-top: 20px;">
                                💾 حفظ التغييرات
                            </button>
                        </div>
                    \`;
                    
                    panel.innerHTML = propertiesHTML;
                }

                // ===== تحديث المحتوى =====
                function updateComponentContent(key, value) {
                    if (selectedComponent) {
                        selectedComponent.content[key] = value;
                        renderComponent(selectedComponent);
                    }
                }

                function updateComponentStyle(key, value) {
                    if (selectedComponent) {
                        selectedComponent.styles[key] = value;
                        renderComponent(selectedComponent);
                    }
                }

                // ===== وظائف مساعدة =====
                function editComponent(id) {
                    selectComponent(id);
                    alert('يمكنك تعديل الخصائص من الشريط الأيمن');
                }

                function deleteComponent(id) {
                    if (confirm('هل تريد حذف هذا المكون؟')) {
                        components = components.filter(c => c.id !== id);
                        document.querySelector(\`[data-id="\${id}"]\`)?.remove();
                        selectedComponent = null;
                        updatePropertiesPanel();
                        
                        // إظهار منطقة الإفلات إذا لم يكن هناك مكونات
                        if (components.length === 0) {
                            document.getElementById('drop-zone').style.display = 'flex';
                        }
                    }
                }

                function saveComponentChanges() {
                    alert('تم حفظ التغييرات بنجاح!');
                }

                // ===== الذكاء الاصطناعي =====
                function openAIModal() {
                    document.getElementById('ai-modal').style.display = 'block';
                }

                function closeAIModal() {
                    document.getElementById('ai-modal').style.display = 'none';
                }

                function generateWithAI() {
                    const prompt = document.getElementById('ai-prompt').value;
                    if (!prompt.trim()) {
                        alert('الرجاء كتابة وصف لما تريد إنشاءه');
                        return;
                    }
                    
                    alert(\`جاري إنشاء محتوى بالذكاء الاصطناعي بناءً على: "\${prompt}"\`);
                    closeAIModal();
                    
                    // إضافة مكونات افتراضية بناءً على الوصف
                    if (prompt.toLowerCase().includes('بطل') || prompt.toLowerCase().includes('رئيسي')) {
                        addComponent('hero');
                    }
                    if (prompt.toLowerCase().includes('مميز') || prompt.toLowerCase().includes('خدم')) {
                        addComponent('features');
                    }
                    if (prompt.toLowerCase().includes('اتصال') || prompt.toLowerCase().includes('تواصل')) {
                        addComponent('contact');
                    }
                }

                function optimizeWithAI() {
                    alert('جاري تحليل وتحسين التصميم باستخدام الذكاء الاصطناعي...');
                }

                // ===== إدارة المشروع =====
                function saveProject() {
                    const projectName = document.getElementById('project-name').value;
                    projectData = {
                        name: projectName,
                        components: components,
                        settings: {},
                        lastSaved: new Date().toISOString()
                    };
                    
                    localStorage.setItem('currentProject', JSON.stringify(projectData));
                    alert(\`تم حفظ المشروع "\${projectName}" بنجاح!\`);
                }

                function previewProject() {
                    if (components.length === 0) {
                        alert('أضف بعض المكونات أولاً للمعاينة');
                        return;
                    }
                    
                    // إنشاء معاينة بسيطة
                    let previewHTML = \`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>معاينة: \${projectData.name}</title>
                            <style>
                                body { font-family: Arial; padding: 20px; }
                                .preview-component { margin-bottom: 30px; padding: 20px; border: 2px dashed #ccc; }
                            </style>
                        </head>
                        <body>
                            <h1>معاينة المشروع: \${projectData.name}</h1>
                    \`;
                    
                    components.forEach(comp => {
                        previewHTML += \`
                            <div class="preview-component">
                                <h3>مكون: \${comp.type}</h3>
                                <pre>\${JSON.stringify(comp.content, null, 2)}</pre>
                            </div>
                        \`;
                    });
                    
                    previewHTML += '</body></html>';
                    
                    // فتح نافذة جديدة للمعاينة
                    const previewWindow = window.open('', '_blank');
                    previewWindow.document.write(previewHTML);
                }

                function publishProject() {
                    if (components.length === 0) {
                        alert('أضف بعض المكونات أولاً للنشر');
                        return;
                    }
                    
                    const projectName = document.getElementById('project-name').value;
                    
                    fetch('/api/publish', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: projectName,
                            components: components,
                            settings: projectData.settings
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert(\`✅ تم نشر موقعك بنجاح!\n🔗 الرابط: \${data.url}\`);
                        } else {
                            alert(\`❌ فشل النشر: \${data.message}\`);
                        }
                    })
                    .catch(error => {
                        alert(\`❌ خطأ في النشر: \${error.message}\`);
                    });
                }

                // ===== تهيئة التطبيق =====
                document.addEventListener('DOMContentLoaded', () => {
                    initDragAndDrop();
                    
                    // تحميل مشروع محفوظ
                    const savedProject = localStorage.getItem('currentProject');
                    if (savedProject) {
                        projectData = JSON.parse(savedProject);
                        document.getElementById('project-name').value = projectData.name;
                        components = projectData.components || [];
                        
                        // عرض المكونات المحفوظة
                        components.forEach(comp => renderComponent(comp));
                        
                        if (components.length > 0) {
                            document.getElementById('drop-zone').style.display = 'none';
                        }
                    }
                    
                    // إغلاق نافذة الذكاء عند النقر خارجها
                    document.getElementById('ai-modal').addEventListener('click', function(e) {
                        if (e.target === this) {
                            closeAIModal();
                        }
                    });
                });
            </script>
        </body>
        </html>
    `);
});

// API للنشر
app.post('/api/publish', async (req, res) => {
    try {
        const { name, components } = req.body;
        
        // هنا سيكون كود النشر على Vercel
        res.json({
            success: true,
            message: 'تم النشر بنجاح (وضع تجريبي)',
            url: `https://${name.toLowerCase().replace(/ /g, '-')}.vercel.app`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// API لتحميل المشروع
app.get('/api/project/:id', (req, res) => {
    res.json({
        success: true,
        project: {
            id: req.params.id,
            name: 'مشروع محفوظ',
            components: [],
            lastModified: new Date().toISOString()
        }
    });
});

// ===== بقية الـ Routes =====

// الرئيسية
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>منشئ المواقع</title>
            <style>
                body { font-family: Arial; text-align: center; padding: 50px; }
                h1 { color: #3B82F6; }
                a { display: inline-block; margin: 10px; padding: 15px 30px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; }
            </style>
        </head>
        <body>
            <h1>🎨 منشئ المواقع بالذكاء الاصطناعي</h1>
            <p>أنشئ مواقع ويب احترافية بدون كتابة كود</p>
            <a href="/builder">🚀 ابدأ البناء</a>
            <a href="/api/health">📊 حالة النظام</a>
        </body>
        </html>
    `);
});

// بقية API routes...

// ===== بدء السيرفر =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`🚀 السيرفر يعمل على: http://localhost:${PORT}`);
    console.log(`🎨 Builder متاح على: http://localhost:${PORT}/builder`);
    await connectDB();
});

module.exports = app;
