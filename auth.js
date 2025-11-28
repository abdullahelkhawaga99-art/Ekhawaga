// بيانات المستخدمين الافتراضية
const defaultUsers = {
    students: [
        {
            id: "12345678901234",
            name: "أحمد محمد أحمد",
            grade: "2 ثانوي - ب",
            password: "student123",
            avatar: "👦",
            joined: "2023-09-01"
        },
        {
            id: "12345678901235", 
            name: "سارة محمود عبدالله",
            grade: "3 ثانوي - أ",
            password: "student123",
            avatar: "👧",
            joined: "2023-09-01"
        }
    ],
    teachers: [
        {
            id: "12345678901236",
            name: "أحمد علي إبراهيم",
            subject: "math",
            password: "teacher123",
            avatar: "👨‍🏫",
            joined: "2020-09-01"
        },
        {
            id: "12345678901237",
            name: "نادية محمد حسن", 
            subject: "arabic",
            password: "teacher123",
            avatar: "👩‍🏫",
            joined: "2019-09-01"
        },
        {
            id: "12345678901238",
            name: "محمود سعيد يوسف",
            subject: "physics",
            password: "teacher123",
            avatar: "👨‍🏫",
            joined: "2021-09-01"
        }
    ]
};

// تهيئة البيانات في localStorage
function initializeData() {
    if (!localStorage.getItem('students')) {
        localStorage.setItem('students', JSON.stringify(defaultUsers.students));
    }
    
    if (!localStorage.getItem('teachers')) {
        localStorage.setItem('teachers', JSON.stringify(defaultUsers.teachers));
    }
    
    if (!localStorage.getItem('complaints')) {
        localStorage.setItem('complaints', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('studentPosts')) {
        localStorage.setItem('studentPosts', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('teacherPosts')) {
        localStorage.setItem('teacherPosts', JSON.stringify([]));
    }
}

// استدعاء التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
});

// دالة التحقق من تسجيل دخول الطالب
function authenticateStudent(nationalId, password) {
    const students = JSON.parse(localStorage.getItem('students'));
    const student = students.find(s => s.id === nationalId && s.password === password);
    return student;
}

// دالة التحقق من تسجيل دخول المعلم
function authenticateTeacher(nationalId, password) {
    const teachers = JSON.parse(localStorage.getItem('teachers'));
    const teacher = teachers.find(t => t.id === nationalId && t.password === password); 
    return teacher;
}

// دالة تسجيل خروج
function logout() {
    localStorage.removeItem('currentStudent');
    localStorage.removeItem('currentTeacher');
    window.location.href = '../index.html';
}

// دالة التحقق من وجود مستخدم مسجل
function checkAuth() {
    return localStorage.getItem('currentStudent') || localStorage.getItem('currentTeacher');
}

// دالة الحصول على بيانات المستخدم الحالي
function getCurrentUser() {
    const student = localStorage.getItem('currentStudent');
    const teacher = localStorage.getItem('currentTeacher');
    
    if (student) {
        return { type: 'student', data: JSON.parse(student) };
    } else if (teacher) {
        return { type: 'teacher', data: JSON.parse(teacher) };
    }
    
    return null;
}

// دالة إضافة شكوى جديدة
function addComplaint(complaintData) {
    const complaints = JSON.parse(localStorage.getItem('complaints'));
    const newComplaint = {
        id: Date.now(),
        ...complaintData,
        date: new Date().toLocaleString('ar-EG'),
        status: 'قيد المراجعة'
    };
    complaints.push(newComplaint);
    localStorage.setItem('complaints', JSON.stringify(complaints));
    return newComplaint;
}

// دالة إضافة منشور جديد
function addPost(type, postData) {
    const posts = JSON.parse(localStorage.getItem(`${type}Posts`)) || [];
    const newPost = {
        id: Date.now(),
        ...postData,
        date: new Date().toLocaleString('ar-EG'),
        likes: 0,
        comments: []
    };
    posts.unshift(newPost); // إضافة في البداية
    localStorage.setItem(`${type}Posts`, JSON.stringify(posts));
    return newPost;
}

// دالة إضافة تعليق
function addCommentToPost(type, postId, commentData) {
    const posts = JSON.parse(localStorage.getItem(`${type}Posts`));
    const postIndex = posts.findIndex(post => post.id == postId);
    
    if (postIndex !== -1) {
        if (!posts[postIndex].comments) {
            posts[postIndex].comments = [];
        }
        
        const newComment = {
            id: Date.now(),
            ...commentData,
            date: new Date().toLocaleString('ar-EG')
        };
        
        posts[postIndex].comments.push(newComment);
        localStorage.setItem(`${type}Posts`, JSON.stringify(posts));
        return newComment;
    }
    return null;
}

// دالة زيادة الإعجابات
function likePost(type, postId) {
    const posts = JSON.parse(localStorage.getItem(`${type}Posts`));
    const postIndex = posts.findIndex(post => post.id == postId);
    
    if (postIndex !== -1) {
        posts[postIndex].likes++;
        localStorage.setItem(`${type}Posts`, JSON.stringify(posts));
        return posts[postIndex].likes;
    }
    return 0;
}

// دالة مساعدة للإعجاب بالمنشور
function likePostInStorage(type, postId) {
    const posts = JSON.parse(localStorage.getItem(`${type}Posts`));
    const postIndex = posts.findIndex(post => post.id == postId);
    
    if (postIndex !== -1) {
        posts[postIndex].likes++;
        localStorage.setItem(`${type}Posts`, JSON.stringify(posts));
        return posts[postIndex].likes;
    }
    return 0;
}