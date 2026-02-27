
    // Initialize Chart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeLearningChart();
    updateGreeting();
});

// Initialize Learning Activity Chart
function initializeLearningChart() {
    const ctx = document.getElementById('learningChart');
    
    if (!ctx) return;
    
    // Create gradient for area chart
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Learning Hours',
                data: [2, 3.5, 2.8, 4.2, 3.8, 4.5, 3.2],
                borderColor: '#10b981',
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#10b981',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1f2937',
                    padding: 12,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#374151',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            return context.parsed.y + ' hours';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return value;
                        },
                        color: '#9ca3af',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: '#f3f4f6',
                        drawBorder: false
                    },
                    border: {
                        display: false
                    }
                },
                x: {
                    ticks: {
                        color: '#9ca3af',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        display: false
                    },
                    border: {
                        display: false
                    }
                }
            }
        }
    });
}

// Update greeting based on time
function updateGreeting() {
    const greetingElement = document.querySelector('.greeting');
    if (!greetingElement) return;
    
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    let greeting = 'Good Morning';
    if (hours >= 12 && hours < 17) {
        greeting = 'Good Afternoon';
    } else if (hours >= 17) {
        greeting = 'Good Evening';
    }
    
    const timeString = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}`;
    greetingElement.textContent = `${greeting} ${timeString}`;
}

// Update greeting every minute
setInterval(updateGreeting, 60000);

// Premium Button Handler
const premiumBtn = document.querySelector('.premium-btn');
if (premiumBtn) {
    premiumBtn.addEventListener('click', function() {
        console.log('Manage subscription clicked');
        alert('Redirecting to subscription management...');
    });
}

// Report Button Handler
const reportBtn = document.querySelector('.icon-btn');
if (reportBtn) {
    reportBtn.addEventListener('click', function() {
        const originalText = this.innerHTML;
        this.innerHTML = `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Generating...
        `;
        this.disabled = true;
        
        setTimeout(() => {
            alert('Report generated successfully!');
            this.innerHTML = originalText;
            this.disabled = false;
        }, 2000);
    });
}

// View Messages Link Handler
const viewMessagesLink = document.querySelector('.view-messages');
if (viewMessagesLink) {
    viewMessagesLink.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('View all messages clicked');
        alert('Opening messages...');
    });
}

// Assignment Item Click Handler
const assignmentItems = document.querySelectorAll('.assignment-item');
assignmentItems.forEach(item => {
    item.addEventListener('click', function() {
        console.log('Assignment clicked:', this.querySelector('.assignment-title').textContent);
        // Add navigation or modal opening logic here
    });
    
    // Add hover effect
    item.style.cursor = 'pointer';
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(4px)';
        this.style.transition = 'transform 0.2s';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0)';
    });
});

// Animate stats on scroll
function animateStats() {
    const statValue = document.querySelector('.stat-value.large');
    if (!statValue) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateValue(statValue, 0, 85, 1500);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });
    
    observer.observe(statValue);
}

// Animate number counting
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end + '%';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '%';
        }
    }, 16);
}

// Initialize animations
animateStats();

// Add ripple effect to buttons
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Apply ripple effect to buttons
const buttons = document.querySelectorAll('.login-btn, .premium-btn, .icon-btn');
buttons.forEach(button => {
    button.addEventListener('click', createRipple);
});

// Add CSS for ripple effect dynamically
const style = document.createElement('style');
style.textContent = `
    button {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .welcome-section,
    .chart-card,
    .assignments-card,
    .premium-badge,
    .feedback-card {
        animation: fadeIn 0.5s ease-out;
    }
    
    .chart-card {
        animation-delay: 0.1s;
    }
    
    .assignments-card {
        animation-delay: 0.2s;
    }
    
    .premium-badge {
        animation-delay: 0.15s;
    }
    
    .feedback-card {
        animation-delay: 0.25s;
    }
`;
document.head.appendChild(style);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add notification for new feedback
function showNotification() {
    // This would typically be triggered by real-time data
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
        <span style="font-size: 0.875rem; color: #374151;">New feedback from Mrs. Smith</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add slide animations
const slideStyle = document.createElement('style');
slideStyle.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(slideStyle);

// Console welcome message
console.log('%c🎓 Welcome to EduSpark Student Dashboard', 'color: #10b981; font-size: 18px; font-weight: bold;');
console.log('%cKeep up the great work, Alex! 🌟', 'color: #6b7280; font-size: 14px;');
 

// 3. Assignment Status Highlighter
function highlightUrgentTasks() {
    const tasks = document.querySelectorAll('.assignment-item');
    tasks.forEach(task => {
        const dateText = task.querySelector('.assignment-date').textContent;
        if (dateText.toLowerCase().includes('days ago')) {
            task.style.borderLeft = '4px solid #ef4444'; // Red border for old tasks
            const warning = document.createElement('span');
            warning.innerHTML = '⚠️ Overdue';
            warning.style.cssText = 'color:#ef4444; font-size:10px; font-weight:bold; margin-left:10px;';
            task.querySelector('.assignment-info').appendChild(warning);
        }
    });
}
highlightUrgentTasks(); 

