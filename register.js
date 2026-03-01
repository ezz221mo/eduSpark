
// register.js
document.addEventListener('DOMContentLoaded', () => {
  // Toast
  if (!document.getElementById('toast-container')) {
    const c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c);
  }
  const showToast = (m, t='error') => {
    const c = document.getElementById('toast-container');
    const d = document.createElement('div'); d.className = `toast ${t}`; d.innerHTML = `<span>${m}</span>`;
    c.appendChild(d); setTimeout(()=>{ d.classList.add('toast-fade-out'); setTimeout(()=>d.remove(),500); }, 4000);
  };

  // Forms
  const forms = {
    student: document.getElementById('studentForm'),
    teacher: document.getElementById('teacherForm'),
    parent:  document.getElementById('parentForm')
  };

  // Helpers
  const validateAge = (dob) => {
    if (!dob) return { valid:false, msg:"Please enter your date of birth." };
    const b = new Date(dob), t = new Date();
    let age = t.getFullYear()-b.getFullYear();
    const md = t.getMonth()-b.getMonth();
    if (md<0 || (md===0 && t.getDate()<b.getDate())) age--;
    if (b>t) return { valid:false, msg:"Date of birth cannot be a future date!" };
    if (age<12 || age>100) return { valid:false, msg:"Age must be between 12 and 100 years." };
    return { valid:true };
  };
  const pick = (arr)=>arr[Math.floor(Math.random()*arr.length)];
  const genAvatar = ()=>{
    const emojis = ['🦊','🐼','🐯','🦁','🐨','🐵','🐸','🐧','🦄','🐱','🐶','🐻','🐹','🐰','🦉','🐙','🐢','🐳','🦖','🐝','🦋','🔥','⭐','⚡','👨‍🏫','👩‍🏫','🎓'];
    return pick(emojis);
  };

  // Parent: verify children (نفس منطقك السابق) — اختياري
  const childrenContainer = document.getElementById('childrenContainer');
  const addChildBtn = document.getElementById('addChildBtn');
  let childCount = 0;
  const createChildField = () => {
    childCount++;
    const el = document.createElement('div');
    el.className = 'child-section';
    el.style.marginBottom = '15px';
    el.innerHTML = `
      <div class="child-header" style="display:flex;justify-content:space-between;align-items:center;">
        <h4>Student #${childCount}</h4>
        ${childCount>1?'<button type="button" class="remove-child" style="color:red;background:none;border:none;cursor:pointer;">Remove</button>':''}
      </div>
      <div class="form-group">
        <div class="input-with-check" style="display:flex;gap:10px;margin-top:5px;">
          <input type="email" class="child-email-input" placeholder="student@example.com" required style="flex:1;">
          <button type="button" class="verify-child-btn" style="padding:0 15px;border-radius:8px;cursor:pointer;background:#3498db;color:#fff;border:none;">Verify</button>
        </div>
        <small class="child-status-msg" style="display:block;margin-top:5px;font-weight:bold;"></small>
      </div>
    `;
    childrenContainer.appendChild(el);

    const verifyBtn = el.querySelector('.verify-child-btn');
    const input = el.querySelector('.child-email-input');
    const status = el.querySelector('.child-status-msg');

    if (childCount>1) el.querySelector('.remove-child').addEventListener('click', ()=> el.remove());

    verifyBtn.addEventListener('click', async ()=>{
      const email = input.value.trim();
      if (!email) return showToast("Please enter the student's email");
      verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; verifyBtn.disabled = true;
      try {
        const resp = await fetch('https://evolve.techcrafter.dev/api/v1/auth/signup', {
          method:'POST',
          headers:{'Content-Type':'application/x-www-form-urlencoded'},
          body: new URLSearchParams({ email, password:'CheckPassword123!', role:'Student' })
        });
        const data = await resp.json();
        const exists = resp.status===400 || JSON.stringify(data).includes("already registered");
        if (exists) { status.innerText='✅ Student account found!'; status.style.color='#2ecc71'; input.dataset.verified='true'; }
        else { status.innerText='❌ Student not registered yet.'; status.style.color='#e74c3c'; input.dataset.verified='false'; }
      } catch { showToast('Connection error'); }
      finally { verifyBtn.innerHTML='Verify'; verifyBtn.disabled=false; }
    });
  };
  if (childrenContainer) createChildField();
  if (addChildBtn) addChildBtn.addEventListener('click', createChildField);

  // Signup core
  const handleSignup = async (formData) => {
    if (formData.password !== formData.confirmPassword) return showToast('Passwords do not match!');
    const fn = (formData.firstName||'').trim(), ln = (formData.lastName||'').trim();
    if (!fn || !ln) return showToast('Please enter both first and last names.');
    if (fn.length<2 || ln.length<2) return showToast('First and last names must be at least 2 characters.');

    if (formData.role==='Student') {
      const age = validateAge(formData.birthDate);
      if (!age.valid) return showToast(age.msg);
    }
    if (formData.role==='Parent' && !formData.isTeacher) {
      const allVerified = Array.from(document.querySelectorAll('.child-email-input')).every(i => i.dataset.verified==='true');
      if (!allVerified) return showToast('Please verify all student emails first');
    }

    showToast('Creating account...', 'info');

    const prams = new URLSearchParams();
    prams.append('email', formData.email);
    prams.append('password', formData.password);
    prams.append('role', (formData.role==='Teacher'||formData.role==='Parent')?'Parent':'Student');

    const displayName = `${fn} ${ln}`.replace(/\s+/g,' ').trim() || formData.email.split('@')[0];
    const avatar = genAvatar();

    try {
      const resp = await fetch('https://evolve.techcrafter.dev/api/v1/auth/signup', {
        method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: prams.toString()
      });
      const data = await resp.json();

      if (resp.ok) {
        showToast('✅ Success!', 'success');

        // اجمع بيانات خاصة بالمدرس لو الدور Teacher
        let teacherSpecValue = null, teacherSpecLabel = null, teacherBio = null;
        if (formData.role === 'Teacher') {
          const specSelect = document.getElementById('teacher-specialization');
          if (specSelect) {
            teacherSpecValue = specSelect.value || null;
            const opt = specSelect.options[specSelect.selectedIndex];
            teacherSpecLabel = opt ? opt.textContent.trim() : teacherSpecValue;
          }
          const bioEl = document.getElementById('teacher-bio');
          teacherBio = bioEl ? bioEl.value.trim() : null;
        }

        const user = {
          firstName: fn,
          lastName: ln,
          name: displayName,
          avatar,
          email: formData.email,
          role: formData.role,                 // Teacher | Student | Parent (UI role)
          // teacher-specific:
          teacherSpecValue,
          teacherSpecLabel,
          teacherBio,
          // extras:
          level:'Level 1 Explorer',
          xp:0,
          currentProgress:45
        };
        localStorage.setItem('currentUser', JSON.stringify(user));

        const token = data?.access_token || data?.token || data?.data?.access_token || null;
        if (token) localStorage.setItem('accessToken', token);

        // بعد التسجيل → صفحة الدخول
        setTimeout(()=>window.location.href='sing.html',800);

      } else {
        let msg = 'Registration failed';
        if (data.detail) {
          if (Array.isArray(data.detail)) msg = data.detail[0].msg || data.detail[0];
          else if (typeof data.detail==='object') msg = data.detail.message || JSON.stringify(data.detail);
          else msg = data.detail;
        }
        showToast(`❌ ${msg}`);
      }
    } catch { showToast('Connection error'); }
  };

  // Listeners
  forms.student?.addEventListener('submit', e=>{
    e.preventDefault();
    handleSignup({
      firstName: document.getElementById('student-firstname')?.value||'',
      lastName:  document.getElementById('student-lastname')?.value||'',
      email:     document.getElementById('student-email').value,
      password:  document.getElementById('student-password').value,
      confirmPassword: document.getElementById('student-confirm-password').value,
      birthDate: document.getElementById('student-birthdate').value,
      role: 'Student'
    });
  });
  forms.parent?.addEventListener('submit', e=>{
    e.preventDefault();
    handleSignup({
      firstName: document.getElementById('parent-firstname')?.value||'',
      lastName:  document.getElementById('parent-lastname')?.value||'',
      email:     document.getElementById('parent-email').value,
      password:  document.getElementById('parent-password').value,
      confirmPassword: document.getElementById('parent-confirm-password').value,
      role: 'Parent'
    });
  });
  forms.teacher?.addEventListener('submit', e=>{
    e.preventDefault();
    handleSignup({
      firstName: document.getElementById('teacher-firstname')?.value||'',
      lastName:  document.getElementById('teacher-lastname')?.value||'',
      email:     document.getElementById('teacher-email').value,
      password:  document.getElementById('teacher-password').value,
      confirmPassword: document.getElementById('teacher-confirm-password').value,
      role: 'Teacher',
      isTeacher: true
    });
  });

  // UI
  document.querySelectorAll('.type-card').forEach(card=>{
    card.addEventListener('click', function(){
      const type = this.getAttribute('data-type');
      localStorage.setItem('userChoice', type);
      document.getElementById('userTypeSelection').style.display='none';
      document.getElementById('switchToLogin').style.display='none';
      const f = { student:forms.student, teacher:forms.teacher, parent:forms.parent };
      if (f[type]) f[type].style.display='flex';
    });
  });
  document.querySelectorAll('.back-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.register-form').forEach(f=>f.style.display='none');
      document.getElementById('userTypeSelection').style.display='grid';
      document.getElementById('switchToLogin').style.display='block';
    });
  });
  document.querySelectorAll('.toggle-password').forEach(btn=>{
    btn.addEventListener('click', function(){
      const input = this.parentElement.querySelector('input');
      input.type = input.type==='password' ? 'text' : 'password';
      this.querySelector('i').classList.toggle('fa-eye-slash');
    });
  });
});
