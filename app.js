/* ================================
   app.js — Interactions for WeCan/EduSpark
   Author: M365 Copilot (for Ezzeldin)
   ================================ */

/* مساعد صغير لاختيار العناصر */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ========== 1) ظلّ للـ Navbar عند السكرول (تم التعديل ليكون أبيض دائمًا) ========== */
(function navbarShadowOnScroll() {
  const nav = $('nav');
  if (!nav) return;
  const toggle = () => {
    // جعل الخلفية بيضاء دائمًا
    nav.style.background = 'var(--white)'; 
    
    if (window.scrollY > 10) {
      // إضافة الظل عند السكرول فقط
      nav.style.boxShadow = '0 6px 18px rgba(0,0,0,0.06)';
    } else {
      // إزالة الظل عند العودة للأعلى مع بقاء اللون الأبيض
      nav.style.boxShadow = 'none';
    }
  };
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
})();

/* ========== 2) Smooth Scroll للروابط الداخلية ========== */
(function smoothScroll() {
  $$('.nav-links a[href^="#"], a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();

/* ========== 3) عدّادات متحركة في الإحصائيات ========== */
(function animatedCounters() {
  const counters = $$('.stats .stat-card h2, .counter');
  if (!counters.length) return;

  const parseNumberFromText = (t) => {
    const num = (t || '').replace(/[^\d.]/g, '');
    return Number(num || 0);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      obs.unobserve(el);

      const target = el.dataset.count ? Number(el.dataset.count) : parseNumberFromText(el.textContent);
      const suffix = el.dataset.suffix || (el.textContent.includes('%') ? '%' : (el.textContent.includes('+') ? '+' : ''));
      const duration = 1200; // ms
      const start = performance.now();

      const step = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const value = Math.floor(target * p).toLocaleString();
        el.textContent = `${value}${suffix}`;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.35 });

  counters.forEach(c => observer.observe(c));
})();

/* ========== 4) انيميشن ظهور للعناصر عند الدخول للشاشة ========== */
(function revealOnScroll() {
  const revealables = [
    '.feature-card',
    '.course-card',
    '.student-card',
    '.expert-card',
    '.stats .stat-card'
  ];
  const nodes = $$(revealables.join(', '));
  if (!nodes.length) return;

  nodes.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .6s ease, transform .6s ease';
  });

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      obs.unobserve(el);
    });
  }, { threshold: 0.2 });

  nodes.forEach(n => io.observe(n));
})();

/* ========== 5) Lazy Loading للصور ========== */
(function lazyImages() {
  const imgs = $$('img');
  if (!imgs.length) return;

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      if (img.complete && img.naturalWidth) {
        obs.unobserve(img);
        return;
      }
      if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
      img.style.opacity = '0';
      img.style.transition = 'opacity .6s ease';
      img.addEventListener('load', () => {
        img.style.opacity = '1';
      }, { once: true });
      obs.unobserve(img);
    });
  }, { rootMargin: '120px 0px' });

  imgs.forEach(img => io.observe(img));
})();

/* ========== 6) Toast/إشعار بسيط ========== */


/* ========== 7) زر Enroll Now → إشعار ========== */
(function enrollButtons() {
  $$('.course-card .course-footer button').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.course-card');
      const title = $('.course-content h3', card)?.textContent?.trim() || 'Course';
      Toast.show(`✅ Enrolled in: ${title}`);
    });
  });
})();

/* ========== 8) زر الميكروفون (Voice Assistant) ========== */
(function voiceAssistantMock() {
  const btn = $('.voice-btn');
  if (!btn) return;
  let busy = false;
  btn.addEventListener('click', () => {
    if (busy) return;
    busy = true;
    btn.style.opacity = '0.8';
    btn.style.pointerEvents = 'none';
    Toast.show('🎙️ Voice Assistant: Coming soon…', 'success', 2200);
    setTimeout(() => {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      busy = false;
    }, 2200);
  });
})();

/* ========== 9) Favorite (❤️) للدورات ========== */
(function favoritesForCourses() {
  const KEY = 'fav_courses_v1';
  function loadFavs() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  }
  function saveFavs(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); }
  const favs = new Set(loadFavs());

  $$('.course-card').forEach((card, i) => {
    const id = card.dataset.id || `course_${i}`;
    card.dataset.id = id;
    let heart = $('.fav-toggle', card);
    if (!heart) {
      heart = document.createElement('button');
      heart.className = 'fav-toggle';
      heart.innerHTML = '❤';
      heart.style.position = 'absolute';
      heart.style.bottom = '12px';
      heart.style.right = '60px';
      heart.style.background = 'rgba(255,255,255,0.9)';
      heart.style.border = '1px solid #eee';
      heart.style.borderRadius = '20px';
      heart.style.padding = '6px 10px';
      heart.style.cursor = 'pointer';
      heart.style.boxShadow = '0 6px 16px rgba(0,0,0,.08)';
      $('.course-image', card)?.appendChild(heart);
    }
    const applyState = () => {
      if (favs.has(id)) {
        heart.style.color = '#e11d48';
      } else {
        heart.style.color = '#666';
      }
    };
    applyState();
    heart.addEventListener('click', (e) => {
      e.stopPropagation();
      if (favs.has(id)) {
        favs.delete(id);
        Toast.show('💔 Removed from favorites', 'error');
      } else {
        favs.add(id);
        Toast.show('❤️ Added to favorites');
      }
      saveFavs([...favs]);
      applyState();
    });
  });
})();

/* ========== 10) تأثير الكتابة في شات Sparky ========== */
(function sparkyTyping() {
  const botBubble = $$('.chat-container .chat-bubble').find(el => !el.classList.contains('user-q'));
  if (!botBubble) return;
  const fullText = botBubble.textContent.trim().replace(/^"|"$/g, '');
  botBubble.textContent = '';
  let i = 0;
  const type = () => {
    botBubble.textContent = fullText.slice(0, i) + (i % 3 === 0 ? '|' : '');
    i++;
    if (i <= fullText.length) {
      setTimeout(type, 18);
    } else {
      botBubble.textContent = fullText;
    }
  };
  setTimeout(type, 400);
})();

/* ========== 11) زر رجوع للأعلى ========== */
(function backToTop() {
  const btn = document.createElement('button');
  btn.textContent = '↑';
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '24px',
    left: '24px',
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: 'var(--primary-green)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(0,0,0,.15)',
    display: 'none',
    zIndex: '9999'
  });
  document.body.appendChild(btn);
  const toggle = () => {
    btn.style.display = (window.scrollY > 400) ? 'grid' : 'none';
    btn.style.placeItems = 'center';
  };
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ========== 12) تبديل الثيم (فاتح/داكن) ========== */
(function themeToggle() {
  const nav = $('nav');
  if (!nav) return;
  const KEY = 'theme_pref_v1';
  const saved = localStorage.getItem(KEY) || 'light';
  document.documentElement.dataset.theme = saved;
  const btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.textContent = saved === 'dark' ? '🌙' : '☀️';
  Object.assign(btn.style, {
    background: '#f0efe9',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '20px',
    cursor: 'pointer'
  });
  const links = $('.nav-links', nav);
  (links || nav).appendChild(btn);
  const applyTheme = (mode) => {
    document.documentElement.dataset.theme = mode;
    btn.textContent = mode === 'dark' ? '🌙' : '☀️';
    localStorage.setItem(KEY, mode);
    if (mode === 'dark') {
      document.documentElement.style.setProperty('--bg-cream', '#0f172a');
      document.documentElement.style.setProperty('--text-black', '#e5e7eb');
      document.body.style.backgroundColor = 'var(--bg-cream)';
      document.body.style.color = 'var(--text-black)';
    } else {
      document.documentElement.style.setProperty('--bg-cream', '#f9f8f3');
      document.documentElement.style.setProperty('--text-black', '#333333');
      document.body.style.backgroundColor = 'var(--bg-cream)';
      document.body.style.color = 'var(--text-black)';
    }
  };
  applyTheme(saved);
  btn.addEventListener('click', () => {
    const next = (document.documentElement.dataset.theme === 'dark') ? 'light' : 'dark';
    applyTheme(next);
  });
})();

/* ========== 13) قوائم موبايل (هامبرجر) ========== */
(function mobileMenuOptional() {
  const nav = $('nav');
  const links = $('.nav-links', nav);
  if (!nav || !links) return;
  let burger = $('.hamburger', nav);
  if (!burger) {
    burger = document.createElement('button');
    burger.className = 'hamburger';
    burger.textContent = '☰';
    Object.assign(burger.style, {
      background: '#fff',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'none'
      
    });
    nav.insertBefore(burger, links);
  }
  const mq = window.matchMedia('(max-width: 992px)');
  const update = () => {
    burger.style.display = mq.matches ? 'block' : 'none';
    if (!mq.matches) links.style.display = 'flex';
    else links.style.display = 'none';
  };
  update();
  mq.addEventListener('change', update);
  burger.addEventListener('click', () => {
    const isOpen = links.style.display === 'flex';
    links.style.display = isOpen ? 'none' : 'flex';
    links.style.flexDirection = 'column';
    links.style.gap = '14px';
    links.style.background = '#fff';
    links.style.position = 'absolute';
    links.style.right = '0';
    links.style.left = '0';
    links.style.width = '100%'
    links.style.top = '70px';
    links.style.padding = '16px';
    links.style.border = '1px solid #eee';
    links.style.borderRadius = '12px';
    links.style.boxShadow = '0 10px 24px rgba(0,0,0,.12)';
  });
})();



const chatMessages = document.getElementById('chatMessages');
        const chatInput = document.getElementById('chatInput');
        const typingIndicator = document.getElementById('typingIndicator');

        // Bot responses database
        const botResponses = {
            'solar system': 'The Solar System is amazing! 🌍 It consists of the Sun at the center, and eight planets that orbit around it: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Each planet is unique with its own characteristics. Would you like to learn more about a specific planet?',
            'coding': 'Great choice! 💻 I recommend starting with "Learn Programming in Python from Scratch". It\'s perfect for beginners and covers all the fundamentals. The course has 12 lessons, takes about 18 hours, and costs 429 EGP. Should I enroll you?',
            'math': 'Perfect! 🎓 I can create a custom math learning path for you. Let\'s start with:\n\n1. Basic Algebra (2 weeks)\n2. Geometry Fundamentals (3 weeks)\n3. Introduction to Calculus (4 weeks)\n\nEach section includes video lessons, practice exercises, and quizzes. Ready to start?',
            'hello': 'Hello! 👋 I\'m so happy to help you learn today! What would you like to explore?',
            'help': 'I can help you with:\n• 📚 Finding courses on any topic\n• 💡 Explaining difficult concepts\n• 🎯 Creating custom learning paths\n• ✅ Tracking your progress\n• 🤔 Answering your questions\n\nWhat interests you most?',
            'default': 'That\'s an interesting question! 🤔 Let me help you with that. I can explain this topic in a simple way, or recommend relevant courses. What would you prefer?'
        };

        function addMessage(text, isBot = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isBot ? 'bot-message' : 'user-message'}`;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = text;
            
            messageDiv.appendChild(contentDiv);
            
            // Insert before typing indicator
            chatMessages.insertBefore(messageDiv, typingIndicator);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function showTyping() {
            typingIndicator.classList.add('active');
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function hideTyping() {
            typingIndicator.classList.remove('active');
        }

        function getBotResponse(userMessage) {
            const lowerMessage = userMessage.toLowerCase();
            
            for (let key in botResponses) {
                if (lowerMessage.includes(key)) {
                    return botResponses[key];
                }
            }
            
            return botResponses['default'];
        }

        function sendMessage() {
            const message = chatInput.value.trim();
            
            if (message === '') return;
            
            // Add user message
            addMessage(message, false);
            chatInput.value = '';
            
            // Show typing indicator
            showTyping();
            
            // Simulate bot response delay
            setTimeout(() => {
                hideTyping();
                const response = getBotResponse(message);
                addMessage(response, true);
            }, 1500);
        }

        function sendQuickAction(action) {
            chatInput.value = action;
            sendMessage();
        }

        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }

        // Auto-focus input on load
        window.onload = function() {
            chatInput.focus();
        };
        // --- 1. البحث الحي (Live Search) ---
// بيبحث بالاسم أو المادة أول بأول
function filterTeachers() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const cards = document.querySelectorAll('.teacher-card');

    cards.forEach(card => {
        const name = card.getAttribute('data-name').toLowerCase();
        const subject = card.getAttribute('data-subject').toLowerCase();
        
        if (name.includes(filter) || subject.includes(filter)) {
            card.style.display = "block";
            card.style.animation = "fadeIn 0.4s ease forwards";
        } else {
            card.style.display = "none";
        }
    });
}

// --- 2. نظام التفضيل (Favorite System) ---
// كود يخلي المستخدم يدوس على أيقونة القلب (لو ضفتها) أو يحفظ المدرس
function toggleFavorite(btn) {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    if (btn.classList.contains('active')) {
        icon.style.color = "#ef4444"; // Red color
        alert("Teacher added to your favorites!");
    } else {
        icon.style.color = "#ccc";
    }
}

// --- 3. زرار الصعود للأعلى (Scroll To Top) ---


function topFunction() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // صعود ناعم
    });
}

// --- 4. تأثيرات تفاعلية للكروت (Hover Effects) ---
document.querySelectorAll('.teacher-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.borderColor = "#6366f1";
    });
    card.addEventListener('mouseleave', () => {
        card.style.borderColor = "transparent";
    });
});

// --- 5. وظيفة Profile View (فتح مودال أو صفحة) ---
function viewProfile(name) {
    console.log("Loading profile for: " + name);
    // ممكن هنا تفتح نافذة منبثقة (Modal) فيها تفاصيل أكتر
    alert("Full profile for " + name + " is coming soon in the next update!");
}
// 1. فلترة الكورسات حسب التصنيف
function filterCategory(category, btn) {
    // تغيير شكل الزرار النشط
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cards = document.querySelectorAll('.course-card');
    
    cards.forEach(card => {
        const courseCat = card.getAttribute('data-category');
        if (category === 'all' || courseCat === category) {
            card.style.display = "block";
            card.style.animation = "fadeIn 0.5s ease";
        } else {
            card.style.display = "none";
        }
    });
}

// 2. البحث الحي عن الكورسات
function searchCourses() {
    const input = document.getElementById('courseSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.course-card');

    cards.forEach(card => {
        const title = card.querySelector('.course-title').innerText.toLowerCase();
        if (title.includes(input)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

// 3. محاكاة التسجيل في الكورس (Enrollment)
/* ============================================================
   Updated Course & Cart Logic with Auth Check
   ============================================================ */

// 1. مصفوفة لتخزين الكورسات المختارة
let cart = JSON.parse(localStorage.getItem('evolve_cart')) || [];

// 2. دالة تحديث العداد في الهيدر
function updateCartCount() {
    const countElement = document.getElementById('cart-count');
    if (countElement) countElement.innerText = cart.length;
}

// 3. رسالة التنبيه (Toast)
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: #333; color: #fff; padding: 12px 25px; border-radius: 30px;
        z-index: 1000; font-size: 14px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// 4. منطق الأزرار (Enroll & Cart)
document.querySelectorAll('.enroll-btn').forEach((button, index) => {
    const card = button.closest('.course-card');
    const courseTitle = card.querySelector('.course-title').innerText;

    // تحديث شكل الزرار عند تحميل الصفحة بناءً على الكارت
    if (cart.some(item => item.title === courseTitle)) {
        button.innerText = "Remove from Cart";
        button.style.background = "#ef4444";
        button.classList.add('enrolled');
    }

    button.addEventListener('click', function() {
        // --- حارس تسجيل الدخول ---
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert("⚠️ عفواً، يجب تسجيل الدخول أولاً لتتمكن من إضافة الكورسات للعربة!");
            // window.location.href = 'sing.html'; // فعل ده لو عايز تحوله لصفحة الدخول فوراً
            return;
        }

        const courseData = {
            id: index,
            title: courseTitle,
            price: card.querySelector('.course-price').innerText,
            image: card.querySelector('.course-image').src,
            instructor: card.querySelector('.course-instructor').innerText
        };

        const itemIndex = cart.findIndex(item => item.title === courseData.title);

        if (itemIndex > -1) {
            // الحالة: الكورس موجود فعلاً -> (حذف)
            cart.splice(itemIndex, 1);
            this.innerText = "Enroll Now";
            this.style.background = ""; // يرجع للونه الأصلي في الـ CSS
            this.classList.remove('enrolled');
            showToast("💔 Removed from cart");
        } else {
            // الحالة: الكورس مش موجود -> (إضافة)
            cart.push(courseData);
            this.innerText = "Remove from Cart";
            this.style.background = "#ef4444";
            this.classList.add('enrolled');
            showToast("✅ Added to your cart!");
        }

        // حفظ التغييرات وتحديث العداد
        localStorage.setItem('evolve_cart', JSON.stringify(cart));
        updateCartCount();
    });
});

// 5. زر الصعود للأعلى
window.onscroll = function() {
    const btn = document.getElementById("scrollTopBtn");
    if (btn) {
        if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
            btn.style.display = "flex";
        } else {
            btn.style.display = "none";
        }
    }
};

function topFunction() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// تشغيل العداد لأول مرة
updateCartCount();
