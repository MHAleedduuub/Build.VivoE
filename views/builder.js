<%- include('layouts/main') -%>

<div class="bg-white rounded-xl shadow-lg p-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">
        <i class="fas fa-paint-brush text-blue-500"></i> منشئ المواقع
    </h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- شريط الأدوات -->
        <div class="lg:col-span-1 bg-gray-50 p-4 rounded-lg">
            <h3 class="font-bold text-lg mb-4">🧰 أدوات البناء</h3>
            
            <div class="space-y-2">
                <div class="p-3 bg-white border rounded cursor-move hover:bg-blue-50" onclick="addComponent('hero')">
                    <i class="fas fa-star text-blue-500"></i>
                    <span class="mr-2">قسم البطل</span>
                </div>
                
                <div class="p-3 bg-white border rounded cursor-move hover:bg-green-50" onclick="addComponent('features')">
                    <i class="fas fa-th-large text-green-500"></i>
                    <span class="mr-2">المميزات</span>
                </div>
                
                <div class="p-3 bg-white border rounded cursor-move hover:bg-yellow-50" onclick="addComponent('contact')">
                    <i class="fas fa-envelope text-yellow-500"></i>
                    <span class="mr-2">اتصال</span>
                </div>
                
                <button onclick="openAIModal()" class="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded mt-4">
                    <i class="fas fa-robot"></i> مساعد الذكاء
                </button>
            </div>
        </div>
        
        <!-- منطقة البناء -->
        <div class="lg:col-span-3">
            <div class="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[500px]" id="buildArea">
                <p class="text-center text-gray-500">اسحب المكونات هنا لبناء موقعك</p>
            </div>
            
            <div class="mt-6 flex space-x-4 rtl:space-x-reverse">
                <button class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                    <i class="fas fa-save"></i> حفظ
                </button>
                <button class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
                    <i class="fas fa-eye"></i> معاينة
                </button>
                <button class="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600">
                    <i class="fas fa-rocket"></i> نشر
                </button>
            </div>
        </div>
    </div>
</div>

<!-- نافذة الذكاء الاصطناعي -->
<div id="aiModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50">
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl">
        <div class="bg-white rounded-lg shadow-xl p-6">
            <h3 class="text-xl font-bold mb-4">🤖 مساعد الذكاء الاصطناعي</h3>
            <textarea class="w-full p-3 border rounded h-32 mb-4" placeholder="أوصف موقعك المثالي..."></textarea>
            <button class="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600">
                <i class="fas fa-magic mr-2"></i> أنشئ الموقع
            </button>
        </div>
    </div>
</div>

<script>
function addComponent(type) {
    const area = document.getElementById('buildArea');
    const component = document.createElement('div');
    component.className = 'bg-white p-4 rounded-lg shadow mb-4';
    component.innerHTML = `
        <div class="flex justify-between items-center">
            <h4 class="font-bold">مكون ${type}</h4>
            <button onclick="this.parentElement.parentElement.remove()" class="text-red-500">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <p class="text-gray-600 mt-2">هذا مكون تجريبي</p>
    `;
    area.appendChild(component);
}

function openAIModal() {
    document.getElementById('aiModal').classList.remove('hidden');
}

// إغلاق النافذة عند النقر خارجها
document.getElementById('aiModal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.add('hidden');
    }
});
</script>
