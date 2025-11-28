// تهيئة AOS للأنيميشن
document.addEventListener('DOMContentLoaded', function() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });
    }

    // تأثير التمرير على الهيدر
    window.addEventListener('scroll', function() {
        const header = document.getElementById('header');
        if (header && window.scrollY > 100) {
            header.classList.add('scrolled');
        } else if (header) {
            header.classList.remove('scrolled');
        }
    });

    // تأثير الكتابة للنصوص
    initTypingEffect();
    initScrollAnimations();
    
    // تأثيرات إضافية للكروت
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.05)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // التحقق من تسجيل الدخول وعرض بيانات المستخدم
    const currentUser = getCurrentUser();
    if (currentUser) {
        const userInfoElement = document.getElementById('user-info');
        if (userInfoElement) {
            userInfoElement.innerHTML = `
                <div class="user-display">
                    <span class="user-avatar">${currentUser.data.avatar}</span>
                    <span>مرحباً، ${currentUser.data.name}</span>
                    <button onclick="logout()" class="logout-btn">تسجيل خروج</button>
                </div>
            `;
        }
    }
    
    // تحميل البيانات حسب الصفحة
    if (document.getElementById('student-posts-container')) {
        loadPosts('student', 'student-posts-container');
    }
    
    if (document.getElementById('teacher-posts-container')) {
        loadPosts('teacher', 'teacher-posts-container');
    }
    
    if (document.getElementById('complaints-list')) {
        loadComplaints();
    }
});

// تأثير الكتابة للنصوص
function initTypingEffect() {
    const typingElements = document.querySelectorAll('.typing-text');
    typingElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        
        // بدء الكتابة بعد تحميل الصفحة
        setTimeout(typeWriter, 1000);
    });
}

// تأثير الظهور للعناصر
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                if (entry.target.classList.contains('fly-in')) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            }
        });
    }, observerOptions);

    // مراقبة العناصر
    document.querySelectorAll('.fly-in, .fade-in-element, .news-item').forEach(el => {
        observer.observe(el);
    });
}

// تحميل المنشورات من localStorage
function loadPosts(type, containerId) {
    const posts = JSON.parse(localStorage.getItem(`${type}Posts`)) || [];
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    // إذا لم يكن هناك منشورات
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="no-posts">
                <i class="fas fa-comments fa-3x" style="color: #ddd; margin-bottom: 15px;"></i>
                <h3>لا توجد منشورات بعد</h3>
                <p>كن أول من يشارك في المنتدى!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = createPostElement(post, type);
        container.appendChild(postElement);
    });
}

// إنشاء عنصر منشور
function createPostElement(post, type) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-card';
    postDiv.innerHTML = `
        <div class="post-header">
            <div class="user-avatar">${post.avatar}</div>
            <div class="user-info">
                <strong>${post.authorName}</strong>
                <span class="post-date">${post.date}</span>
            </div>
        </div>
        <div class="post-content">
            <p>${post.content}</p>
        </div>
        <div class="post-stats">
            <span>${post.likes} إعجابات</span>
            <span>${post.comments ? post.comments.length : 0} تعليق</span>
        </div>
        <div class="post-buttons">
            <button class="post-btn like-btn" onclick="likePost('${type}', ${post.id}, this)">
                <i class="fas fa-heart"></i>
                <span>أعجبني</span>
            </button>
            <button class="post-btn" onclick="toggleComments(${post.id})">
                <i class="fas fa-comment"></i>
                <span>تعليق</span>
            </button>
        </div>
        <div class="comments-section" id="comments-${post.id}" style="display: none;">
            <div class="comments-list" id="comments-list-${post.id}">
                ${renderComments(post.comments)}
            </div>
            <div class="add-comment">
                <input type="text" id="comment-input-${post.id}" placeholder="اكتب تعليقك...">
                <button onclick="addComment('${type}', ${post.id})">نشر</button>
            </div>
        </div>
    `;
    
    return postDiv;
}

// عرض التعليقات
function renderComments(comments) {
    if (!comments || comments.length === 0) {
        return '<p class="no-comments">لا توجد تعليقات بعد</p>';
    }
    
    return comments.map(comment => `
        <div class="comment">
            <div class="comment-avatar">${comment.avatar}</div>
            <div class="comment-content">
                <strong>${comment.authorName}</strong>
                <p>${comment.content}</p>
                <span class="comment-date">${comment.date}</span>
            </div>
        </div>
    `).join('');
}

// إعجاب بالمنشور
function likePost(type, postId, button) {
    const newLikes = likePostInStorage(type, postId);
    
    // تحديث الزر
    const likeCount = button.parentElement.previousElementSibling.querySelector('span');
    likeCount.textContent = `${newLikes} إعجابات`;
    
    // تأثير على الزر
    button.classList.add('liked');
    setTimeout(() => {
        button.classList.remove('liked');
    }, 1000);
}

// إظهار/إخفاء التعليقات
function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection.style.display === 'none') {
        commentsSection.style.display = 'block';
    } else {
        commentsSection.style.display = 'none';
    }
}

// إضافة تعليق
function addComment(type, postId) {
    const commentInput = document.getElementById(`comment-input-${postId}`);
    const content = commentInput.value.trim();
    
    if (!content) return;
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('يجب تسجيل الدخول أولاً');
        return;
    }
    
    const commentData = {
        authorName: currentUser.data.name,
        content: content,
        avatar: currentUser.data.avatar
    };
    
    addCommentToPost(type, postId, commentData);
    commentInput.value = '';
    loadPosts(type, `${type}-posts-container`);
}

// تحميل الشكاوى
function loadComplaints() {
    const complaints = JSON.parse(localStorage.getItem('complaints')) || [];
    const container = document.getElementById('complaints-list');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    complaints.forEach(complaint => {
        const complaintElement = document.createElement('div');
        complaintElement.className = 'complaint-item';
        complaintElement.innerHTML = `
            <div class="complaint-header">
                <strong>${complaint.name}</strong>
                <span class="complaint-date">${complaint.date}</span>
            </div>
            <div class="complaint-type">${getComplaintType(complaint.type)}</div>
            <h4>${complaint.subject}</h4>
            <p>${complaint.message}</p>
            <div class="complaint-footer">
                <span class="complaint-category">${complaint.category}</span>
                <span class="complaint-status ${complaint.status === 'تم الحل' ? 'solved' : 'pending'}">${complaint.status}</span>
            </div>
        `;
        container.appendChild(complaintElement);
    });
}

// تحويل نوع الشكوى لنص
function getComplaintType(type) {
    const types = {
        'complaint': 'شكوى',
        'suggestion': 'اقتراح',
        'inquiry': 'استفسار',
        'appreciation': 'شكر وتقدير'
    };
    return types[type] || type;
}

// تأثيرات الصفحات الداخلية
function initPageAnimations() {
    const elements = document.querySelectorAll('.fade-in-element, .news-item');
    elements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
    });
}

// استدعاء تأثيرات الصفحات
if (document.querySelector('.page-header')) {
    initPageAnimations();
}

// وظائف إضافية للمنتدى
function addNewPost(type) {
    const postInput = document.getElementById(`newPost${type.charAt(0).toUpperCase() + type.slice(1)}`);
    const content = postInput.value.trim();
    
    if (!content) {
        alert('يرجى كتابة محتوى المنشور');
        return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('يجب تسجيل الدخول أولاً');
        return;
    }

    const postData = {
        authorName: currentUser.data.name,
        content: content,
        avatar: currentUser.data.avatar,
        likes: 0,
        comments: []
    };

    // إضافة المنشور
    addPost(type, postData);
    
    // مسح حقل الإدخال
    postInput.value = '';
    
    // إعادة تحميل المنشورات
    loadPosts(type, `${type}-posts-container`);
    
    // تأثير النجاح
    showSuccessMessage('تم نشر منشورك بنجاح!');
}

// إظهار رسالة نجاح
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideInRight 0.5s ease;
    `;
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}// وظيفة مشاركة الموقع على واتساب
function shareOnWhatsApp() {
    const websiteUrl = window.location.href;
    const message = `🏫 منصة عبدالسند يمامة الثانوية الإلكترونية 🌟\n\n${websiteUrl}\n\n✅ دخول الطلاب: 12345678901234 / student123\n✅ دخول المعلمين: 12345678901236 / teacher123`;
    
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// إضافة زر المشاركة تلقائياً
function addWhatsAppShareButton() {
    const shareButton = document.createElement('button');
    shareButton.innerHTML = '<i class="fab fa-whatsapp"></i> مشاركة على واتساب';
    shareButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #25D366;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: 'Cairo', sans-serif;
    `;
    
    shareButton.addEventListener('click', shareOnWhatsApp);
    document.body.appendChild(shareButton);
}

// استدعاء الوظيفة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', addWhatsAppShareButton);