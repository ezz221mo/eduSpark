
// profile_teacher.js

// 1) Animated counters
const animateCounters = () => {
  const counters = document.querySelectorAll('.stat-num');
  counters.forEach(c=>{
    const target = parseFloat(c.innerText.replace(/[^0-9.]/g,''));
    const suffix = c.innerText.replace(/[0-9.]/g,'');
    let count=0, speed=100;
    const update=()=>{
      const inc = target/speed;
      if (count<target) { count+=inc; c.innerText = count.toFixed(suffix.includes('⭐')?1:0)+suffix; setTimeout(update,10); }
      else c.innerText = target + suffix;
    };
    update();
  });
};

// 2) Helpers
const randomFrom = (arr)=>arr[Math.floor(Math.random()*arr.length)];
const genAvatar = ()=>{
  const emojis=['🦊','🐼','🐯','🦁','🐨','🐵','🐸','🐧','🦄','🐱','🐶','🐻','🐹','🐰','🦉','🐙','🐢','🐳','🦖','🐝','🦋','🔥','⭐','⚡','👨‍🏫','👩‍🏫','🎓'];
  return randomFrom(emojis);
};
const getNameParts = (u)=>{
  const fn=(u?.firstName||'').trim(), ln=(u?.lastName||'').trim();
  if (fn||ln) return {fn,ln};
  const fb = u?.name || u?.full_name || (u?.email?u.email.split('@')[0]:'Teacher');
  const parts = fb.split(' ').filter(Boolean);
  return { fn: parts[0]||'Teacher', ln: parts.slice(1).join(' ')||'' };
};

// 3) Main
window.addEventListener('DOMContentLoaded', ()=>{
  animateCounters();

  const localUser = JSON.parse(localStorage.getItem('currentUser')||'null');
  const token = localStorage.getItem('accessToken');

  // Session guard
  if (!localUser && !token) {
    window.location.href = 'sing.html';
    return;
  }

  const user = localUser || {};
  const { fn, ln } = getNameParts(user);
  const full = [fn, ln].join(' ').replace(/\s+/g,' ').trim();
  const profName = `Prof. ${full || 'Teacher'}`;

  // اسم البروفايل
  const profileNameEl = document.querySelector('.profile-name');
  if (profileNameEl) profileNameEl.textContent = profName;

  // Avatar (emoji)
  const avatarEl = document.querySelector('.avatar');
  if (avatarEl) {
    if (!user.avatar) {
      user.avatar = genAvatar();
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    avatarEl.textContent = user.avatar;
  }

  // Specialization → .profile-role
  const roleEl = document.querySelector('.profile-role');
  if (roleEl) {
    if (user.teacherSpecLabel) {
      roleEl.textContent = user.teacherSpecLabel;
    }
  }

  // About Me → استبدال النص الافتراضي بالـ teacherBio لو موجود
  const aboutCard = Array.from(document.querySelectorAll('.card')).find(
    sec => sec.querySelector('h2')?.textContent?.trim().toLowerCase() === 'about me'
  );
  if (aboutCard && user.teacherBio) {
    const h2 = aboutCard.querySelector('h2');
    // امسح المحتوى بعد العنوان وحط فقرة جديدة بالبايو + سيب الـ cert-section لو موجودة
    const certSection = aboutCard.querySelector('.cert-section');
    // امسح كل العقد بعد h2
    let node = h2.nextSibling;
    while (node && node !== certSection) {
      const next = node.nextSibling;
      aboutCard.removeChild(node);
      node = next;
    }
    // ضيف فقرة البايو
    const p = document.createElement('p');
    p.id = 'dynamic-about';
    p.textContent = user.teacherBio;
    aboutCard.insertBefore(p, certSection || null);
  }

  // Optional: welcome header لو عندك عنصر
  const welcomeHeader = document.getElementById('user-name-welcome');
  if (welcomeHeader) welcomeHeader.textContent = `Welcome back, ${fn || 'Teacher'}! 👋`;

  // Optional: sync from server (non-blocking)
  (async ()=>{
    if (!token) return;
    try {
      const r = await fetch('https://evolve.atharbackroom.site/api/v1/users/me', {
        method:'GET', headers:{'Authorization':`Bearer ${token}`,'Accept':'application/json'}
      });
      if (r.ok) {
        const s = await r.json();
        const merged = {
          ...user, ...s,
          firstName: user?.firstName || s?.firstName,
          lastName:  user?.lastName  || s?.lastName,
          name: s?.name || s?.full_name || user?.name,
          avatar: user?.avatar || s?.avatar,
          teacherSpecLabel: user?.teacherSpecLabel, // خليك بالأولوية للمحلي
          teacherBio: user?.teacherBio
        };
        localStorage.setItem('currentUser', JSON.stringify(merged));

        const parts = getNameParts(merged);
        const fullName = [parts.fn, parts.ln].join(' ').replace(/\s+/g,' ').trim();
        if (profileNameEl) profileNameEl.textContent = `Prof. ${fullName || 'Teacher'}`;
        if (avatarEl) avatarEl.textContent = merged.avatar || '👨‍🏫';
        if (welcomeHeader) welcomeHeader.textContent = `Welcome back, ${parts.fn || 'Teacher'}! 👋`;
        if (roleEl && merged.teacherSpecLabel) roleEl.textContent = merged.teacherSpecLabel;
        if (aboutCard && merged.teacherBio) {
          const h2 = aboutCard.querySelector('h2');
          const certSection = aboutCard.querySelector('.cert-section');
          // امسح المحتوى بين h2 و cert-section
          let node = h2.nextSibling;
          while (node && node !== certSection) {
            const next = node.nextSibling;
            aboutCard.removeChild(node);
            node = next;
          }
          const p = document.createElement('p');
          p.id = 'dynamic-about';
          p.textContent = merged.teacherBio;
          aboutCard.insertBefore(p, certSection || null);
        }
      }
    } catch {
      console.log('Profile teacher: offline/cached mode.');
    }
  })();
});
