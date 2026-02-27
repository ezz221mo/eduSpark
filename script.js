       // Initialize Chart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeChart();
});

// Initialize Platform Growth Chart
function initializeChart() {
    const ctx = document.getElementById('growthChart');
    
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Users',
                data: [45, 52, 38, 45, 30, 48],
                backgroundColor: '#10b981',
                borderRadius: 8,
                barThickness: 40
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                            return 'Users: ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 60,
                    ticks: {
                        stepSize: 20,
                        callback: function(value) {
                            return value;
                        },
                        color: '#6b7280',
                        font: {
                            size: 12
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
                        color: '#6b7280',
                        font: {
                            size: 12
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

// Generate Report Button Click Handler
const generateBtn = document.querySelector('.generate-btn');
if (generateBtn) {
    generateBtn.addEventListener('click', function() {
        // Show loading state
        const originalText = this.textContent;
        this.textContent = 'Generating...';
        this.disabled = true;
        
        // Simulate report generation
        setTimeout(() => {
            alert('Report generated successfully!');
            this.textContent = originalText;
            this.disabled = false;
        }, 1500);
    });
}

// Add animation to stat cards on scroll
function animateOnScroll() {
    const statCards = document.querySelectorAll('.stat-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    entry.target.style.transition = 'opacity 0.5s, transform 0.5s';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    statCards.forEach(card => {
        observer.observe(card);
    });
}

// Initialize animations
animateOnScroll();

// Update time for recent signups
function updateSignupTimes() {
    const times = document.querySelectorAll('.signup-time');
    times.forEach(time => {
        // This would normally update based on real timestamps
        // For demo purposes, we're keeping static times
    });
}

// Search functionality
const searchInput = document.querySelector('.search-input');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        // Add your search logic here
        console.log('Searching for:', searchTerm);
    });
}

// Notification button click handler
const notificationBtn = document.querySelector('.icon-btn');
if (notificationBtn) {
    notificationBtn.addEventListener('click', function() {
        // Show notifications dropdown
        console.log('Notifications clicked');
        // You can add a dropdown menu here
    });
}

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

// Apply ripple effect to all buttons
const buttons = document.querySelectorAll('.login-btn, .generate-btn');
buttons.forEach(button => {
    button.addEventListener('click', createRipple);
});

// Console welcome message
console.log('%c🎓 EduSpark Admin Dashboard', 'color: #10b981; font-size: 20px; font-weight: bold;');
console.log('%cMaking learning magical ✨', 'color: #6b7280; font-size: 14px;');