
// teacher.js — Teacher Dashboard controller (use FIRST name with "Mr.")

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Session check ----------
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const token = localStorage.getItem('accessToken');
  if (!user && !token) {
    window.location.href = 'sing.html';
    return;
  }

  // ---------- Name helpers ----------
  const resolveFullName = (u) => {
    if (!u) return 'Teacher';
    const fn = (u.firstName || '').trim();
    const ln = (u.lastName || '').trim();
    if (fn || ln) return `${fn} ${ln}`.replace(/\s+/g, ' ').trim();
    if (u.name && u.name.trim()) return u.name.trim();
    if (u.full_name && u.full_name.trim()) return u.full_name.trim();
    if (u.email) return u.email.split('@')[0];
    return 'Teacher';
  };

  const resolveFirstName = (u) => {
    // أولًا جرّب firstName إن كان متخزن
    const fn = (u?.firstName || '').trim();
    if (fn) return fn;
    // وإلا: خُد أول كلمة من الاسم الكامل أو من قبل @
    const full = resolveFullName(u);
    return (full.split(' ').filter(Boolean)[0]) || 'Teacher';
  };

  const getInitials = (full) => {
    const parts = (full || '').split(' ').filter(Boolean);
    if (parts.length === 0) return 'TE';
    if (parts.length === 1) return (parts[0][0] || 'T').toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const fullName = resolveFullName(user);   // "Ahmed Ali"
  const first    = resolveFirstName(user);  // "Ahmed"
  const initials = getInitials(fullName);   // "AA"

  // ---------- Inject into UI ----------
  // Sidebar profile name → Mr. + FIRST name
  const sideNameEl = document.querySelector('.sidebar-profile .name');
  if (sideNameEl) sideNameEl.textContent = `Mr. ${first}`;

  // Sidebar avatar (initials)
  const sideAvatarEl = document.querySelector('.sidebar-profile .avatar');
  if (sideAvatarEl) sideAvatarEl.textContent = initials;

  // Greeting line: “Good Morning, Mr. {FirstName}! …”
  const greetingPEl = document.querySelector('.greeting p');
  if (greetingPEl) {
    // مثال نصّك الحالي:
    // "Good Morning, Mr. Anderson! You have 3 classes today."
    const text = greetingPEl.textContent || '';
    const tailMatch = text.match(/!\s*(.*)$/); // كل اللي بعد علامة التعجب
    const defaultTail = 'You have 3 classes today.';
    const tail = tailMatch ? tailMatch[1] : defaultTail;
    greetingPEl.textContent = `Good Morning, Mr. ${first}! ${tail}`.replace(/\s{2,}/g, ' ').trim();
  }

  // ---------- باقي تفاعلات الداشبورد كما هي ----------

  // 1) Counter animation for cards (".stat-value")
  const animateCounters = () => {
    const stats = document.querySelectorAll('.stat-value');
    stats.forEach(stat => {
      const hasPercent = stat.innerText.includes('%');
      const target = parseInt(stat.innerText.replace(/\D/g, ''), 10);
      if (isNaN(target)) return;
      let count = 0;
      const duration = 1500; // ~1.5s
      const increment = target / (duration / 16); // ~60fps

      const updateCount = () => {
        count += increment;
        if (count < target) {
          stat.innerText = Math.ceil(count) + (hasPercent ? '%' : '');
          requestAnimationFrame(updateCount);
        } else {
          stat.innerText = target + (hasPercent ? '%' : '');
        }
      };
      updateCount();
    });
  };
  animateCounters();

  // 2) Grading logic
  const gradeButtons = document.querySelectorAll('.grade-btn');
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'dashboard-toast';
    toast.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="background:var(--primary); border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:12px;">✓</div>
        ${message}
      </div>`;
    toast.style = `
      position: fixed; bottom: 30px; right: 30px; 
      background: #1A2332; color: white;
      padding: 16px 24px; border-radius: 12px; 
      box-shadow: 0 15px 30px rgba(0,0,0,0.3);
      z-index: 1000; font-size: 14px; font-weight: 500;
      border-left: 4px solid var(--primary);
      animation: slideInRight 0.5s cubic-bezier(0.68,-0.55,0.265,1.55) forwards;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = "fadeOut 0.5s forwards";
      setTimeout(() => toast.remove(), 500);
    }, 3500);
  };

  gradeButtons.forEach(btn => {
    btn.onclick = function() {
      const row = this.closest('tr');
      const studentName = row?.cells?.[0]?.innerText || 'student';
      this.innerHTML = `<span class="spinner"></span> Saving...`;
      this.style.pointerEvents = 'none';
      setTimeout(() => {
        this.innerHTML = "Done ✓";
        this.style.background = "var(--primary)";
        this.style.color = "white";
        this.style.borderColor = "var(--primary)";
        const statusBadge = row?.querySelector('.status-badge');
        if (statusBadge) {
          statusBadge.innerText = "Graded";
          statusBadge.className = "status-badge";
          statusBadge.style.background = "var(--primary-light)";
          statusBadge.style.color = "var(--primary)";
          statusBadge.style.border = "1px solid var(--primary)";
        }
        const pendingCard = document.querySelectorAll('.stat-value')[1];
        if (pendingCard) {
          const hasPercent = pendingCard.innerText.includes('%');
          let currentVal = parseInt(pendingCard.innerText.replace(/\D/g, ''), 10);
          if (!isNaN(currentVal) && currentVal > 0 && !hasPercent) {
            pendingCard.innerText = (currentVal - 1);
            pendingCard.style.transform = "scale(1.2)";
            setTimeout(() => pendingCard.style.transform = "scale(1)", 200);
          }
        }
        showToast(`Great! ${studentName}'s assignment has been saved.`);
      }, 1200);
    };
  });

  // 3) Chart bars hover tooltip
  const bars = document.querySelectorAll('.bar');
  bars.forEach(bar => {
    bar.addEventListener('mouseenter', function() {
      const height = this.style.height || (this.getAttribute('data-value') ? `${this.getAttribute('data-value')}%` : '');
      const tooltip = document.createElement('div');
      tooltip.className = 'chart-tooltip';
      tooltip.innerText = height;
      tooltip.style = `
        position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
        background: var(--text); color: white; padding: 4px 8px;
        border-radius: 4px; font-size: 10px; pointer-events: none;
      `;
      this.appendChild(tooltip);
    });
    bar.addEventListener('mouseleave', function() {
      const tooltip = this.querySelector('.chart-tooltip');
      if (tooltip) tooltip.remove();
    });
  });

  // 4) Inject spinner & animations styles
  const extraStyles = document.createElement('style');
  extraStyles.innerHTML = `
    .spinner {
      width: 12px; height: 12px;
      border: 2px solid #ffffff; border-bottom-color: transparent;
      border-radius: 50%; display: inline-block;
      animation: rotation 1s linear infinite; margin-right: 8px;
    }
    @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes fadeOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(20px); } }
    @keyframes slideInRight { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
  `;
  document.head.appendChild(extraStyles);
});
