// boss-auth.js - Login/Register untuk Penyedia Lowongan
document.addEventListener('DOMContentLoaded', () => {
    // Cek apakah sudah login sebagai boss
    if (sessionStorage.getItem('isBossLoggedIn') === 'true') {
        window.location.href = 'home-boss.html';
        return;
    }

    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-boss-form');
    const registerForm = document.getElementById('register-boss-form');

    // Toggle tabs
    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        clearErrors();
    });
    tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        clearErrors();
    });

    // Register Boss
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const company = document.getElementById('reg-company').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;
        const errorEl = document.getElementById('register-error');

        if (!company || !email || !phone || !password || !confirm) {
            errorEl.textContent = 'Semua kolom wajib diisi.';
            return;
        }
        if (password !== confirm) {
            errorEl.textContent = 'Password tidak cocok.';
            return;
        }
        if (password.length < 6) {
            errorEl.textContent = 'Password minimal 6 karakter.';
            return;
        }

        const bosses = JSON.parse(localStorage.getItem('bossUsers') || '[]');
        if (bosses.find(b => b.email === email)) {
            errorEl.textContent = 'Email sudah terdaftar.';
            return;
        }

        bosses.push({ company, email, phone, password });
        localStorage.setItem('bossUsers', JSON.stringify(bosses));
        alert('Pendaftaran berhasil! Silakan login.');
        registerForm.reset();
        tabLogin.click();
    });

    // Login Boss
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');

        if (!email || !password) {
            errorEl.textContent = 'Mohon isi semua kolom.';
            return;
        }

        const bosses = JSON.parse(localStorage.getItem('bossUsers') || '[]');
        const boss = bosses.find(b => b.email === email && b.password === password);
        if (boss) {
            sessionStorage.setItem('isBossLoggedIn', 'true');
            sessionStorage.setItem('currentBoss', JSON.stringify({ company: boss.company, email: boss.email }));
            window.location.href = 'home-boss.html';
        } else {
            errorEl.textContent = 'Email atau password salah.';
        }
    });

    function clearErrors() {
        document.getElementById('login-error').textContent = '';
        document.getElementById('register-error').textContent = '';
    }
});