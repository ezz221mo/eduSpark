// استدعي هذا الملف في كل الصفحات
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('userEmail');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const role = userData.role;

        const navLinks = document.querySelectorAll('.nav-links a');
        const getStartedBtn = document.querySelector('.get-started');

        if (token) {
            // 1. حذف أزرار الدخول والتسجيل
            if (getStartedBtn) getStartedBtn.remove();
            
            navLinks.forEach(link => {
                const href = link.getAttribute('href');

                // 2. لو هو "أب/مدرس" -> احذف داشبورد الطالب
                if (role === 'Parent' && href === 'dashboard.html') {
                    link.remove();
                }

                // 3. لو هو "طالب" -> احذف صفحات الأبناء/المدرسين لو وجدت
                if (role === 'Student' && href === 'parent.html') {
                    link.remove();
                }
            });

            // 4. إضافة زر Logout بشكل أنيق
            const navContainer = document.querySelector('.nav-links');
            if (navContainer && !document.getElementById('logoutBtn')) {
                const logout = document.createElement('a');
                logout.id = 'logoutBtn';
                logout.href = '#';
                logout.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
                logout.style.color = 'red';
                logout.onclick = () => { localStorage.clear(); window.location.href='index.html'; };
                navContainer.appendChild(logout);
            }
        } else {
            // لو زائر: احذف الصفحات الخاصة
            navLinks.forEach(link => {
                const h = link.getAttribute('href');
                if (['dashboard.html', 'parent.html', 'courses.html', 'voice.html', 'sparky.html'].includes(h)) {
                    link.remove();
                }
            });
        }
    });
})();