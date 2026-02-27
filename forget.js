document.addEventListener('DOMContentLoaded', () => {
    const forgotForm = document.getElementById('forgotPasswordForm');
    const formState = document.getElementById('formState');
    const successState = document.getElementById('successState');
    const emailInput = document.getElementById('email');

    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailValue = emailInput.value;
            const submitBtn = forgotForm.querySelector('.btn-submit');
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('https://evolve.techcrafter.dev/api/v1/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailValue })
                });

                if (response.ok) {
                    // أول ما الإيميل يتبعت بنجاح، هنخزن الإيميل في الـ Session عشان نحتاجه في الصفحة الجاية
                    sessionStorage.setItem('userEmail', emailValue);
                    
                    // إظهار رسالة النجاح (اللي فيها زرار ينقله لصفحة تغيير الباسورد)
                    formState.style.display = 'none';
                    successState.style.display = 'block';
                    
                    // تحويل تلقائي بعد 3 ثواني لصفحة تغيير الباسورد
                    setTimeout(() => {
                        window.location.href = 'change-password.html'; 
                    }, 3000);

                } else {
                    const data = await response.json();
                    throw new Error(data.message || 'Error');
                }
            } catch (error) {
                alert('Error: ' + error.message);
                submitBtn.innerHTML = 'Send Reset Link';
                submitBtn.disabled = false;
            }
        });
    }
});