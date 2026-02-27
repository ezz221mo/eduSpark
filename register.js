document.addEventListener('DOMContentLoaded', () => {
    // 1. نظام التنبيهات (Toast)
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const showToast = (message, type = 'error') => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast-fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    };

    // 2. تعريف الفورمات
    const forms = {
        student: document.getElementById('studentForm'),
        teacher: document.getElementById('teacherForm'),
        parent: document.getElementById('parentForm')
    };

    const childrenContainer = document.getElementById('childrenContainer');
    const addChildBtn = document.getElementById('addChildBtn');
    let childCount = 0;

    // دالة التحقق من السن (تستخدم للطالب فقط)
    const validateAge = (birthDateString) => {
        if (!birthDateString) return { valid: false, msg: "Please enter your date of birth."};
        const birthDate = new Date(birthDateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (birthDate > today) return { valid: false, msg: "Date of birth cannot be a future date!" };
        if (age < 12 || age > 100) return { valid: false, msg: "Age must be between 12 and 100 years."};
        return { valid: true };
    };

    const createChildField = () => {
        childCount++;
        const childDiv = document.createElement('div');
        childDiv.className = 'child-section';
        childDiv.style.marginBottom = '15px';
        childDiv.innerHTML = `
            <div class="child-header" style="display: flex; justify-content: space-between; align-items: center;">
                <h4>Student #${childCount}</h4>
                ${childCount > 1 ? '<button type="button" class="remove-child" style="color:red; background:none; border:none; cursor:pointer;">Remove</button>' : ''}
            </div>
            <div class="form-group">
                <div class="input-with-check" style="display: flex; gap: 10px; margin-top:5px;">
                    <input type="email" class="child-email-input" placeholder="student@example.com" required style="flex:1;">
                    <button type="button" class="verify-child-btn" style="padding: 0 15px; border-radius: 8px; cursor: pointer; background: #3498db; color: white; border: none;">Verify</button>
                </div>
                <small class="child-status-msg" style="display: block; margin-top: 5px; font-weight: bold;"></small>
            </div>
        `;
        childrenContainer.appendChild(childDiv);

        const verifyBtn = childDiv.querySelector('.verify-child-btn');
        const input = childDiv.querySelector('.child-email-input');
        const statusMsg = childDiv.querySelector('.child-status-msg');

        if (childCount > 1) {
            childDiv.querySelector('.remove-child').addEventListener('click', () => childDiv.remove());
        }

        verifyBtn.addEventListener('click', async () => {
            const email = input.value.trim();
            if (!email) return showToast("Please enter the student's email", "error");
            verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            verifyBtn.disabled = true;

            try {
                const response = await fetch(`https://evolve.techcrafter.dev/api/v1/auth/signup`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ 'email': email, 'password': 'CheckPassword123!', 'role': 'Student' })
                });
                const data = await response.json();
                const isAlreadyRegistered = response.status === 400 || JSON.stringify(data).includes("already registered");

                if (isAlreadyRegistered) {
                    statusMsg.innerText = "✅ Student account found!";
                    statusMsg.style.color = "#2ecc71";
                    input.dataset.verified = "true";
                } else {
                    statusMsg.innerText = "❌ Student not registered yet.";
                    statusMsg.style.color = "#e74c3c";
                    input.dataset.verified = "false";
                }
            } catch (e) {
                showToast("Connection error", "error");
            } finally {
                verifyBtn.innerHTML = 'Verify';
                verifyBtn.disabled = false;
            }
        });
    };

    if (childrenContainer) createChildField();
    if (addChildBtn) addChildBtn.addEventListener('click', createChildField);

    const handleSignup = async (formData) => {
        // فحص تطابق كلمة السر (للكل)
        if (formData.password !== formData.confirmPassword) {
            showToast("Passwords do not match!", "error");
            return;
        }

        // --- التعديل هنا: فحص التاريخ للطالب فقط ---
        if (formData.role === 'Student') {
            const ageCheck = validateAge(formData.birthDate);
            if (!ageCheck.valid) {
                showToast(ageCheck.msg, "error");
                return;
            }
        }

        // فحص فيريفاي الإيميلات للأب فقط
        if (formData.role === 'Parent' && !formData.isTeacher) {
            const allVerified = Array.from(document.querySelectorAll('.child-email-input')).every(i => i.dataset.verified === "true");
            if (!allVerified) {
                showToast("Please verify all student emails first", "error");
                return;
            }
        }

        showToast("Creating account...", "info");
        const prams = new URLSearchParams();
        prams.append('email', formData.email);
        prams.append('password', formData.password);
        
        // إرسال رتبة Parent للباك أند في حالة المدرس أو الأب
        const apiRole = (formData.role === 'Teacher' || formData.role === 'Parent') ? 'Parent' : 'Student';
        prams.append('role', apiRole);

        try {
            const response = await fetch("https://evolve.techcrafter.dev/api/v1/auth/signup", {
                method: "POST",
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: prams.toString()
            });

            const data = await response.json();

            if (response.ok) {
                showToast("✅ Success!", "success");
                setTimeout(() => window.location.href = "sing.html", 2000);
            } else {
                let backendMessage = "Registration failed";
                if (data.detail) {
                    if (Array.isArray(data.detail)) {
                        backendMessage = data.detail[0].msg || data.detail[0];
                    } else if (typeof data.detail === 'object') {
                        backendMessage = data.detail.message || JSON.stringify(data.detail);
                    } else {
                        backendMessage = data.detail;
                    }
                }
                showToast(`❌ ${backendMessage}`, "error");
            }
        } catch (e) {
            showToast("Connection error", "error");
        }
    };

    // مستمع فورم الطالب (فيه تاريخ ميلاد)
    forms.student?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSignup({
            email: document.getElementById('student-email').value,
            password: document.getElementById('student-password').value,
            confirmPassword: document.getElementById('student-confirm-password').value,
            birthDate: document.getElementById('student-birthdate').value,
            role: 'Student'
        });
    });

    // مستمع فورم الأب (بدون تاريخ ميلاد)
    forms.parent?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSignup({
            email: document.getElementById('parent-email').value,
            password: document.getElementById('parent-password').value,
            confirmPassword: document.getElementById('parent-confirm-password').value,
            role: 'Parent'
        });
    });

    // مستمع فورم المدرس (بدون تاريخ ميلاد)
    forms.teacher?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSignup({
            email: document.getElementById('teacher-email').value,
            password: document.getElementById('teacher-password').value,
            confirmPassword: document.getElementById('teacher-confirm-password').value,
            role: 'Teacher',
            isTeacher: true 
        });
    });

    document.querySelectorAll('.type-card').forEach(card => {
        card.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            localStorage.setItem('userChoice', type); 
            document.getElementById('userTypeSelection').style.display = 'none';
            document.getElementById('switchToLogin').style.display = 'none';
            if (forms[type]) forms[type].style.display = 'flex';
        });
    });

    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            Object.values(forms).forEach(f => f.style.display = 'none');
            document.getElementById('userTypeSelection').style.display = 'grid';
            document.getElementById('switchToLogin').style.display = 'block';
        });
    });

    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            input.type = input.type === 'password' ? 'text' : 'password';
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });
});