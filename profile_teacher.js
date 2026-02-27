// 1. عداد الأرقام الاحترافي
const animateCounters = () => {
    const counters = document.querySelectorAll('.stat-num');
    counters.forEach(counter => {
        const target = parseFloat(counter.innerText.replace(/[^0-9.]/g, ''));
        const suffix = counter.innerText.replace(/[0-9.]/g, '');
        let count = 0;
        const speed = 100; // كلما قل زادت السرعة
        
        const update = () => {
            const increment = target / speed;
            if(count < target) {
                count += increment;
                counter.innerText = count.toFixed(suffix === ' ⭐' ? 1 : 0) + suffix;
                setTimeout(update, 10);
            } else {
                counter.innerText = target + suffix;
            }
        };
        update();
    });
};

// 2. تشغيل الأنيميشن عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', animateCounters); 

