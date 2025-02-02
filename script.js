// الإعدادات العامة
const API_KEY = 'AIzaSyDjMwL_OQEy-qCvBj8SuLH1vjERqyCRY3w';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// العناصر
const elements = {
    chatBox: document.getElementById('chat-box'),
    messageInput: document.getElementById('message-input'),
    sendBtn: document.getElementById('send-btn'),
    fileInput: document.getElementById('file-input'),
    filePreview: document.getElementById('file-preview')
};

// تحويل الملف إلى أيقونة
const getFileIcon = (type) => {
    const icons = {
        'image/': 'fa-image',
        'application/pdf': 'fa-file-pdf',
        'text/plain': 'fa-file-alt',
        'application/msword': 'fa-file-word'
    };
    return Object.entries(icons).find(([key]) => type.includes(key))?.[1] || 'fa-file';
};

// عرض الملفات المختارة
const showSelectedFiles = () => {
    elements.filePreview.innerHTML = '';
    Array.from(elements.fileInput.files).forEach(file => {
        const div = document.createElement('div');
        div.className = 'file-chip flex items-center gap-2 px-4 py-2 rounded-lg';
        div.innerHTML = `
            <i class="fas ${getFileIcon(file.type)} text-purple-400"></i>
            <span class="text-gray-300">${file.name}</span>
            <button class="text-red-400 hover:text-red-300" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        elements.filePreview.appendChild(div);
    });
};

// إضافة رسالة للشاشة
const addMessage = (sender, content) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `p-4 rounded-xl text-white ${sender}-message 
        ${sender === 'user' ? 'message-user ml-auto w-3/4' : 'message-bot w-3/4'}`;
    
    if (typeof content === 'object') {
        // معالجة الملفات
        messageDiv.innerHTML = `
            <div class="flex items-center gap-4">
                <i class="fas ${getFileIcon(content.type)} text-2xl"></i>
                <div>
                    <p class="font-bold">${content.name}</p>
                    <p class="text-sm text-gray-300">${(content.size/1024).toFixed(1)}KB</p>
                </div>
            </div>
        `;
    } else {
        // معالجة النصوص
        messageDiv.innerHTML = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 p-3 rounded-lg"><code>$1</code></pre>');
    }

    elements.chatBox.appendChild(messageDiv);
    elements.chatBox.scrollTop = elements.chatBox.scrollHeight;
};

// إرسال الطلب
const handleSubmit = async () => {
    const message = elements.messageInput.value.trim();
    const files = Array.from(elements.fileInput.files);

    if (!message && files.length === 0) return;

    try {
        // إضافة رسائل المستخدم
        if (message) addMessage('user', message);
        files.forEach(file => addMessage('user', file));

        // إرسال الطلب للخادم (مثال)
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: message },
                        // يمكن إضافة معالجة الملفات هنا
                    ]
                }]
            })
        });

        const data = await response.json();
        addMessage('bot', data.candidates[0].content.parts[0].text);

    } catch (error) {
        addMessage('bot', `⚠️ خطأ: ${error.message}`);
    }

    // إعادة التعيين
    elements.messageInput.value = '';
    elements.fileInput.value = '';
    elements.filePreview.innerHTML = '';
};

// الأحداث
elements.sendBtn.addEventListener('click', handleSubmit);
elements.fileInput.addEventListener('change', showSelectedFiles);
elements.messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSubmit();
});

// سحب وإفلات الملفات
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.fileInput.files = e.dataTransfer.files;
    showSelectedFiles();
});
