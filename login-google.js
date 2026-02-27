import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { firebaseConfig } from "./evolve-web-app.js";

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 2. كود الزرار
const googleBtn = document.querySelector('.social-btn.google'); // تأكد من الـ Selector الصح

if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // 3. تخزين البيانات عشان تروح لصفحة البروفايل (الشغل اللي اتفقنا عليه)
            const userData = {
                full_name: user.displayName,
                profile_pic: user.photoURL,
                email: user.email,
                role: 'Student' // جوجل عادة للطلبة، إلا لو حددت غير كدة
            };
            
            localStorage.setItem('userData', JSON.stringify(userData));
            console.log("Data saved for:", userData.full_name);

            // 4. التوجيه التلقائي
            window.location.href = "dashboard.html"; 

        } catch (error) {
            console.error("Login Error:", error.code, error.message);
            alert("حدث خطأ أثناء تسجيل الدخول بجوجل");
        }
    });
}