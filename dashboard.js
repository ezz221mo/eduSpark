// dashboard.js
document.addEventListener('DOMContentLoaded', () => {
  const localData = JSON.parse(localStorage.getItem('currentUser'));
  const token = localStorage.getItem('accessToken');

  // لازم يكون فيه session (زي ما كنت عاملها): لو مفيش → login
  if (!localData && !token) {
    window.location.href = 'sing.html';
    return;
  }

  // Helpers
  const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const generateAvatar = () => {
    const emojis = ['🦊','🐼','🐯','🦁','🐨','🐵','🐸','🐧','🦄','🐱','🐶','🐻','🐹','🐰','🦉','🐙','🐢','🐳','🦖','🐝','🦋','🔥','⭐','⚡'];
    return randomFrom(emojis);
  };

  function getDisplayName(data) {
    const first = (data.firstName || '').trim();
    const last  = (data.lastName || '').trim();
    if (first || last) return `${first} ${last}`.replace(/\s+/g, ' ').trim();
    if (data.name) return data.name;
    if (data.full_name) return data.full_name;
    if (data.email) return data.email.split('@')[0];
    return "Explorer";
  }

  function ensureAvatar(data) {
    if (data && !data.avatar) {
      data.avatar = generateAvatar();
      localStorage.setItem('currentUser', JSON.stringify(data));
    }
    return data?.avatar || '👤';
  }

  function updateDashboardUI(data) {
    // اسم العرض
    const displayName = getDisplayName(data);
    const firstName = displayName.split(' ')[0] || displayName;

    // Sidebar name
    const sidebarName = document.getElementById('user-name-sidebar');
    if (sidebarName) sidebarName.textContent = displayName;

    // Welcome header (بالإنجليزي دايمًا حسب طلبك)
    const welcomeHeader = document.getElementById('user-name-welcome');
    if (welcomeHeader) {
      welcomeHeader.textContent = `Welcome back, ${firstName}! 👋`;
    }

    // Avatar
    const avatarValue = ensureAvatar(data);
    const avatarEl = document.querySelector('.user-avatar');
    if (avatarEl) {
      avatarEl.textContent = avatarValue; // بما إنها div نصية في HTML اللي بعتّه
      // لو هتستخدم صورة بدل Emoji، بدّل لأسلوب background-image أو <img>
    }

    // Level / XP
    if (data.level && document.getElementById('user-level')) {
      document.getElementById('user-level').textContent = data.level;
    }
    if (document.getElementById('user-xp')) {
      const xp = data.xp ?? 0;
      const maxXp = data.maxXp ?? 1000;
      document.getElementById('user-xp').textContent = `${xp} / ${maxXp} XP`;
    }

    // Progress bar
    const progressFill = document.getElementById('main-progress-bar');
    if (progressFill && (data.currentProgress || data.currentProgress === 0)) {
      setTimeout(() => {
        progressFill.style.width = data.currentProgress + '%';
        const percentText = document.querySelector('.progress-percentage');
        if (percentText) percentText.textContent = data.currentProgress + '%';
      }, 500);
    }
  }

  async function syncWithServer() {
    if (token) {
      try {
        const response = await fetch('https://evolve.atharbackroom.site/api/v1/users/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (response.ok) {
          const serverData = await response.json();

          const merged = {
            ...localData,
            ...serverData,
            // حافظ على أسماء الـ local لو السيرفر مش راجع
            firstName: localData?.firstName || serverData?.firstName,
            lastName:  localData?.lastName  || serverData?.lastName,
            name: serverData?.name || serverData?.full_name || localData?.name,
            avatar: localData?.avatar || serverData?.avatar // أولويّة للـ local
          };

          updateDashboardUI(merged);
          localStorage.setItem('currentUser', JSON.stringify(merged));
        }
      } catch {
        console.log("Working in offline mode with cached data.");
      }
    }
  }

  // ✅ شلت إضافة زر Logout الديناميكي—هتستخدم الزر اللي أنت مركّبه في الصفحة
  // function setupLogout() {...}  // (تم الحذف)

  if (localData) {
    // ضمن وجود Avatar للمستخدم الحالي
    if (!localData.avatar) {
      localData.avatar = '👤';
      localStorage.setItem('currentUser', JSON.stringify(localData));
    }
    updateDashboardUI(localData);
  }
  syncWithServer();
});

// Sparky
function openSparky() {
  alert("🤖 Sparky is waking up... How can I help you today?");
}
document.querySelector('.btn-ask-sparky')?.addEventListener('click', openSparky);

// Hover effects
document.querySelectorAll('.suggestion-card').forEach(card => {
  card.addEventListener('mouseenter', () => card.style.transform = "translateY(-5px)");
  card.addEventListener('mouseleave', () => card.style.transform = "translateY(0)");
});
