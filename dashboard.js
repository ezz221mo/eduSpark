// Dashboard Control Center - EVOLVE
document.addEventListener('DOMContentLoaded', () => {
    // 1. تعريف العناصر من الـ HTML
    const userNameSidebar = document.querySelector('.user-name');
    const userNameWelcome = document.querySelector('.welcome-text h1');
    const logoutBtn = document.createElement('li'); // هنضيف زرار خروج برمجياً

    // 2. التحقق من وجود التوكن (هل المستخدم مسجل دخول؟)
    // const token = localStorage.getItem('accessToken');

    if (!token) {
        // لو مفيش توكن، اطرده لصفحة اللوجين فوراً
        window.location.href = 'sing.html';
        return;
    }

    // 3. دالة جلب بيانات المستخدم من السيرفر
    async function fetchUserProfile() {
        try {
            const response = await fetch('https://evolve.atharbackroom.site/api/v1/users/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const userData = await response.json();
                updateUI(userData);
            } else {
                // لو التوكن منتهي أو غير صالح
                handleAuthError();
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            // ممكن تعرض رسالة "أنت تعمل في وضع الأوفلاين"
        }
    }

    // 4. تحديث الصفحة بالبيانات الحقيقية
    function updateUI(user) {
        // استخراج الاسم من الإيميل لو الـ full_name مش موجود
        const displayName = user.full_name || user.email.split('@')[0];
        
        if (userNameSidebar) userNameSidebar.textContent = displayName;
        if (userNameWelcome) userNameWelcome.innerHTML = `Welcome back, ${displayName}! 👋`;
        
        console.log("User Data Loaded:", user);
    }

    // 5. معالجة أخطاء تسجيل الدخول
    function handleAuthError() {
        localStorage.removeItem('accessToken'); // امسح التوكن البايظ
        window.location.href = 'sing.html';
    }

    // 6. إضافة وظيفة تسجيل الخروج (Logout)
    function setupLogout() {
        // هنضيف زرار خروج في آخر القائمة الجانبية
        const menu = document.querySelector('.sidebar-menu');
        logoutBtn.innerHTML = `
            <a href="#" id="logout-link" style="color: #ff5252;">
                <span>🚪</span>
                <span>Logout</span>
            </a>
        `;
        menu.appendChild(logoutBtn);

        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if(confirm("Are you sure you want to logout?")) {
                localStorage.removeItem('accessToken');
                window.location.href = 'sing.html';
            }
        });
    }

    // تشغيل العمليات
    fetchUserProfile();
    setupLogout();
});

// دالة Sparky (اختياري لو عايز تنقلها هنا)
function openSparky() {
    alert('Sparky AI is coming soon to help you! 🤖✨');
}
// بيانات المستخدم (ممكن مستقبلاً تجيبها من Database أو API)
const userData = {
    name: "Ahmed Ali",
    level: "Level 5 Explorer",
    xp: 750,
    maxXp: 1000,
    studyTime: "14.2h",
    badges: 12,
    activePoints: 5,
    currentProgress: 65 // النسبة المئوية للتقدم
};

// 1. تحديث بيانات المستخدم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    updateDashboardUI();
    handleSidebarNavigation();
});

function updateDashboardUI() {
    // تحديث الأسماء
    document.getElementById('user-name-sidebar').textContent = userData.name;
    document.getElementById('user-name-welcome').textContent = `Welcome back, ${userData.name.split(' ')[0]}! 👋`;
    
    // تحديث المستوى والـ XP
    document.getElementById('user-level').textContent = userData.level;
    document.getElementById('user-xp').textContent = `${userData.xp} / ${userData.maxXp} XP`;

    // تحديث شريط التقدم بحركة (Animation)
    const progressFill = document.getElementById('main-progress-bar');
    const progressText = document.querySelector('.progress-percentage');
    
    setTimeout(() => {
        progressFill.style.width = userData.currentProgress + '%';
        progressText.textContent = userData.currentProgress + '%';
    }, 500);

    // تحديث الكروت (Statistics) - مثال لتحديث أول كارت
    const statsCards = document.querySelectorAll('.stat-value');
    if(statsCards.length >= 3) {
        statsCards[0].textContent = userData.studyTime;
        statsCards[1].textContent = userData.badges;
        statsCards[2].textContent = userData.activePoints;
    }
}

// 2. تفعيل التنقل في القائمة الجانبية (Sidebar)
function handleSidebarNavigation() {
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // إزالة الـ active من الجميع
            menuItems.forEach(i => i.classList.remove('active'));
            // إضافة الـ active للعنصر اللي ضغطنا عليه
            this.classList.add('active');
        });
    });
}

// 3. وظيفة زر Ask Sparky و الـ Badge
function openSparky() {
    alert("🤖 Sparky is waking up... How can I help you today?");
}

// إضافة Event Listener لزر الـ Navbar
document.querySelector('.btn-ask-sparky')?.addEventListener('click', openSparky);

// 4. تأثير تفاعلي لكروت الاقتراحات (Suggestions)
const suggestionCards = document.querySelectorAll('.suggestion-card');
suggestionCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = "translateY(-5px)";
        card.style.transition = "0.3s ease";
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = "translateY(0)";
    });
});