document.addEventListener('DOMContentLoaded', () => {
    const auth = typeof firebase !== 'undefined' ? firebase.auth() : null;
    const googleProvider = auth ? new firebase.auth.GoogleAuthProvider() : null;
    const loginForm = document.getElementById('loginForm');

    const showToast = (message, type = 'error') => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast-fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    };

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const emailValue = document.getElementById('email').value;
            const passwordValue = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            submitBtn.disabled = true;

            const loginPrams = new URLSearchParams();
            loginPrams.append('username', emailValue);
            loginPrams.append('password', passwordValue);

            try {
                const response = await fetch('https://evolve.techcrafter.dev/api/v1/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
                    body: loginPrams.toString()
                });

                const data = await response.json(); 

                if (response.ok) {
                    localStorage.setItem('accessToken', data.access_token);
                    
                    const userResponse = await fetch('https://evolve.techcrafter.dev/api/v1/users/me', {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${data.access_token}`, 'Accept': 'application/json' }
                    });

                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        localStorage.setItem('userData', JSON.stringify(userData));
                        
                        showToast(`Welcome back, ${userData.full_name || 'User'}!`, 'success');

                        setTimeout(() => {
                            // --- التعديل الجوهري للتوجيه بناءً على الاختيار المسبق ---
                            const userChoice = localStorage.getItem('userChoice');

                            if (userData.role === 'Parent') {
                                if (userChoice === 'teacher') {
                                    window.location.href = 'teacher.html';
                                } else {
                                    window.location.href = 'parent.html';
                                }
                            } else {
                                window.location.href = 'dashboard.html';
                            }
                        }, 1500);
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                } else {
                    let backendError = "Login failed";
                    if (data.detail) {
                        if (Array.isArray(data.detail)) {
                            backendError = data.detail[0].msg || data.detail[0];
                        } else if (typeof data.detail === 'object') {
                            backendError = data.detail.message || JSON.stringify(data.detail);
                        } else {
                            backendMessage = data.detail;
                        }
                    }
                    showToast(`❌ ${backendError}`, 'error');
                }
            } catch (error) {
                showToast('Server connection error!', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // جوجل (تسجيل الدخول الاجتماعي)
    const googleBtn = document.querySelector('.social-btn.google');
    if (googleBtn && auth) {
        googleBtn.addEventListener('click', async () => {
            try {
                const result = await auth.signInWithPopup(googleProvider);
                showToast(`Welcome ${result.user.displayName}!`, 'success');
                localStorage.setItem('userData', JSON.stringify({role: 'Student', full_name: result.user.displayName}));
                setTimeout(() => { window.location.href = "dashboard.html"; }, 1500);
            } catch (error) { 
                showToast(error.message, 'error'); 
            }
        });
    }
});

// ميزة إظهار/إخفاء كلمة السر
const togglePasswordBtns = document.querySelectorAll('.toggle-password'); 
togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const passwordInput = this.parentElement.querySelector('input');
        const icon = this.querySelector('i');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});
