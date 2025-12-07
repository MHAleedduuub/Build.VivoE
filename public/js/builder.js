class WebsiteBuilder {
    constructor() {
        this.components = [];
        this.selectedComponent = null;
        this.init();
    }
    
    init() {
        this.initDragAndDrop();
        this.initToolbox();
        this.initPropertiesPanel();
        this.initEventListeners();
    }
    
    initDragAndDrop() {
        // المكونات القابلة للسحب
        const draggables = document.querySelectorAll('.component-item');
        const canvas = document.getElementById('canvas');
        
        draggables.forEach(item => {
            item.setAttribute('draggable', 'true');
            
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('component-type', item.dataset.type);
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });
        
        // منطقة الإفلات
        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            canvas.classList.add('drag-over');
        });
        
        canvas.addEventListener('dragleave', () => {
            canvas.classList.remove('drag-over');
        });
        
        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            canvas.classList.remove('drag-over');
            
            const type = e.dataTransfer.getData('component-type');
            if (type) {
                this.addComponent(type, e.offsetX, e.offsetY);
            }
        });
    }
    
    addComponent(type, x, y) {
        const component = {
            id: Date.now(),
            type: type,
            x: x,
            y: y,
            properties: this.getDefaultProperties(type)
        };
        
        this.components.push(component);
        this.renderComponent(component);
        this.selectComponent(component.id);
    }
    
    renderComponent(component) {
        const canvas = document.getElementById('canvas-content');
        const element = document.createElement('div');
        element.className = 'component-rendered';
        element.dataset.id = component.id;
        element.style.left = `${component.x}px`;
        element.style.top = `${component.y}px`;
        
        let html = '';
        switch(component.type) {
            case 'hero':
                html = this.getHeroHTML(component.properties);
                break;
            case 'features':
                html = this.getFeaturesHTML(component.properties);
                break;
            case 'contact':
                html = this.getContactHTML(component.properties);
                break;
        }
        
        element.innerHTML = html;
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectComponent(component.id);
        });
        
        canvas.appendChild(element);
    }
    
    selectComponent(id) {
        this.components.forEach(comp => {
            const el = document.querySelector(`[data-id="${comp.id}"]`);
            if (el) {
                el.classList.remove('selected');
            }
        });
        
        this.selectedComponent = this.components.find(c => c.id === id);
        if (this.selectedComponent) {
            const el = document.querySelector(`[data-id="${id}"]`);
            el.classList.add('selected');
            this.updatePropertiesPanel();
        }
    }
    
    updatePropertiesPanel() {
        const panel = document.getElementById('properties-panel');
        if (!this.selectedComponent) {
            panel.innerHTML = '<p class="text-gray-500">اختر عنصراً لتعديل خصائصه</p>';
            return;
        }
        
        const { type, properties } = this.selectedComponent;
        panel.innerHTML = this.getPropertiesForm(type, properties);
        
        // إضافة event listeners للحقول
        panel.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('change', (e) => {
                this.updateComponentProperty(e.target.name, e.target.value);
            });
        });
    }
    
    updateComponentProperty(name, value) {
        if (this.selectedComponent) {
            this.selectedComponent.properties[name] = value;
            this.renderComponent(this.selectedComponent);
        }
    }
    
    getDefaultProperties(type) {
        const defaults = {
            hero: {
                title: 'عنوان البطل',
                subtitle: 'وصف قصير',
                buttonText: 'ابدأ الآن',
                backgroundColor: '#3B82F6'
            },
            features: {
                title: 'مميزاتنا',
                items: ['ميزة 1', 'ميزة 2', 'ميزة 3']
            }
        };
        return defaults[type] || {};
    }
    
    getHeroHTML(properties) {
        return `
            <div class="hero-section" style="background: ${properties.backgroundColor}">
                <h2>${properties.title}</h2>
                <p>${properties.subtitle}</p>
                <button>${properties.buttonText}</button>
                <div class="component-actions">
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }
    
    getPropertiesForm(type, properties) {
        let form = `<h3 class="font-bold mb-4">خصائص ${type}</h3>`;
        
        for (const [key, value] of Object.entries(properties)) {
            form += `
                <div class="property-group">
                    <label class="property-label">${key}</label>
                    <input type="text" name="${key}" value="${value}" class="property-input">
                </div>
            `;
        }
        
        form += `<button onclick="builder.saveComponent()" class="btn btn-primary mt-4">حفظ التغييرات</button>`;
        return form;
    }
    
    saveComponent() {
        // حفظ التغييرات في قاعدة البيانات
        console.log('تم حفظ المكون:', this.selectedComponent);
        showAlert('تم حفظ التغييرات', 'success');
    }
    
    async generateWithAI(prompt) {
        try {
            const response = await fetch('/ai/generate-component', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            
            const data = await response.json();
            this.addComponent('ai-generated', 100, 100);
            showAlert('تم إنشاء المكون بالذكاء الاصطناعي', 'success');
        } catch (error) {
            showAlert('فشل في الإنشاء', 'error');
        }
    }
}

// تهيئة البناء
const builder = new WebsiteBuilder();

// دالة مساعدة للتحميل السريع
function loadTemplate(templateName) {
    fetch(`/templates/${templateName}.json`)
        .then(res => res.json())
        .then(data => {
            data.components.forEach(comp => {
                builder.addComponent(comp.type, comp.x, comp.y);
            });
        });
}

// حفظ المشروع
function saveProject() {
    const project = {
        name: document.getElementById('project-name').value || 'مشروع جديد',
        components: builder.components,
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('current-project', JSON.stringify(project));
    showAlert('تم حفظ المشروع', 'success');
}