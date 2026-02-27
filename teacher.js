document.addEventListener('DOMContentLoaded', () => {

    // 1. أنيميشن عداد الأرقام (Counter Animation)
    // بيخلي الأرقام في الكروت تعد من 0 لحد القيمة المكتوبة
    const animateCounters = () => {
        const stats = document.querySelectorAll('.stat-value');
        stats.forEach(stat => {
            const target = parseInt(stat.innerText);
            let count = 0;
            const duration = 1500; // 1.5 ثانية
            const increment = target / (duration / 16); // 60fps

            const updateCount = () => {
                count += increment;
                if (count < target) {
                    stat.innerText = Math.ceil(count) + (stat.innerText.includes('%') ? '%' : '');
                    requestAnimationFrame(updateCount);
                } else {
                    stat.innerText = target + (stat.innerText.includes('%') ? '%' : '');
                }
            };
            updateCount();
        });
    };
    animateCounters();

    // 2. وظيفة التصحيح السريع المطورة (Grading Logic)
    const gradeButtons = document.querySelectorAll('.grade-btn');
    gradeButtons.forEach(btn => {
        btn.onclick = function() {
            const row = this.closest('tr');
            const studentName = row.cells[0].innerText;
            
            // إضافة تأثير Loading على الزرار
            this.innerHTML = `<span class="spinner"></span> Saving...`;
            this.style.pointerEvents = 'none'; // منع الضغط المتكرر
            
            setTimeout(() => {
                // تغيير شكل الزرار للحالة المكتملة
                this.innerHTML = "Done ✓";
                this.style.background = "var(--primary)";
                this.style.color = "white";
                this.style.borderColor = "var(--primary)";
                
                // تحديث حالة الـ Badge في الجدول
                const statusBadge = row.querySelector('.status-badge');
                if (statusBadge) {
                    statusBadge.innerText = "Graded";
                    statusBadge.className = "status-badge";
                    statusBadge.style.background = "var(--primary-light)";
                    statusBadge.style.color = "var(--primary)";
                    statusBadge.style.border = "1px solid var(--primary)";
                }

                // تحديث عداد "Pending Grades" (تاني كارت في المصفوفة)
                const pendingCard = document.querySelectorAll('.stat-value')[1];
                let currentVal = parseInt(pendingCard.innerText);
                if (currentVal > 0) {
                    pendingCard.innerText = currentVal - 1;
                    // إضافة رفة بسيطة للرقم عند التغيير
                    pendingCard.style.transform = "scale(1.2)";
                    setTimeout(() => pendingCard.style.transform = "scale(1)", 200);
                }
                
                showToast(`Great! ${studentName}'s assignment has been saved.`);
            }, 1200);
        };
    });

    // 3. توست الإشعارات بشكل أنيق (Enhanced Toast)
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'dashboard-toast';
        // إضافة الأيقونة والرسالة
        toast.innerHTML = `<div style="display:flex; align-items:center; gap:12px;">
                            <div style="background:var(--primary); border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:12px;">✓</div>
                            ${message}
                           </div>`;
        
        // الستايل هنا مكمل للـ CSS اللي عملناه
        toast.style = `
            position: fixed; bottom: 30px; right: 30px; 
            background: #1A2332; color: white;
            padding: 16px 24px; border-radius: 12px; 
            box-shadow: 0 15px 30px rgba(0,0,0,0.3);
            z-index: 1000; font-size: 14px; font-weight: 500;
            border-left: 4px solid var(--primary);
            animation: slideInRight 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = "fadeOut 0.5s forwards";
            setTimeout(() => toast.remove(), 500);
        }, 3500);
    }

    // 4. تفاعل أعمدة الرسم البياني (Chart Interaction)
    const bars = document.querySelectorAll('.bar');
    bars.forEach(bar => {
        bar.addEventListener('mouseenter', function() {
            const height = this.style.height;
            // إظهار تولتيب (Tooltip) بسيط عند الوقوف على العمود
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
});

// إضافة ستايل الـ Spinner والأنيميشن التابعة لها
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