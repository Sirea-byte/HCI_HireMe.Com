// auth.js - Halaman Login/Register
document.addEventListener('DOMContentLoaded', () => {
    // Cek apakah sudah login? Jika ya, langsung redirect ke home
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'home.html';
        return;
    }

    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    

    // Toggle tab
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

    // Login method change
    const loginMethod = document.getElementById('login-method');
    const loginCredential = document.getElementById('login-credential');
    loginMethod.addEventListener('change', () => {
        if (loginMethod.value === 'email') {
            loginCredential.placeholder = 'Masukkan email';
            loginCredential.type = 'email';
        } else {
            loginCredential.placeholder = 'Masukkan nomor telepon';
            loginCredential.type = 'tel';
        }
        loginCredential.value = '';
    });

    // Register handler
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nama = document.getElementById('reg-nama').value.trim();
        const gender = document.getElementById('reg-gender').value;
        const tgl = document.getElementById('reg-tgl').value;
        const alamat = document.getElementById('reg-alamat').value.trim();
        const telepon = document.getElementById('reg-telepon').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;
        const errorEl = document.getElementById('register-error');

        // Validasi
        if (!nama || !gender || !tgl || !alamat || !telepon || !email || !password || !confirm) {
            errorEl.textContent = 'Semua kolom wajib diisi.';
            return;
        }
        if (password !== confirm) {
            errorEl.textContent = 'Password dan konfirmasi tidak cocok.';
            return;
        }
        if (password.length < 6) {
            errorEl.textContent = 'Password minimal 6 karakter.';
            return;
        }

        // Simpan user ke localStorage (simulasi database)
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        // Cek apakah email atau telepon sudah terdaftar
        const exist = users.find(u => u.email === email || u.telepon === telepon);
        if (exist) {
            errorEl.textContent = 'Email atau nomor telepon sudah terdaftar.';
            return;
        }

        const newUser = {
            id: Date.now().toString(),
            nama,
            gender,
            tglLahir: tgl,
            alamat,
            telepon,
            email,
            password // tentu saja di aplikasi nyata harus di-hash!
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        alert('Pendaftaran berhasil! Silakan login.');
        // Reset form & pindah ke tab login
        registerForm.reset();
        tabLogin.click();
    });

    // Login handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const method = loginMethod.value;
        const credential = loginCredential.value.trim();
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');

        if (!credential || !password) {
            errorEl.textContent = 'Mohon isi semua kolom.';
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        let user = null;
        if (method === 'email') {
            user = users.find(u => u.email === credential && u.password === password);
        } else {
            user = users.find(u => u.telepon === credential && u.password === password);
        }

        if (user) {
            // Simpan sesi login
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('currentUser', JSON.stringify({ nama: user.nama, email: user.email }));
            sessionStorage.setItem('currentUserId', user.id);       
            sessionStorage.setItem('currentUserName', user.nama);    
            // Redirect ke home
            window.location.href = 'home.html';
        } else {
            errorEl.textContent = 'Kredensial tidak valid. Periksa kembali.';
        }
    });

    function clearErrors() {
        document.getElementById('login-error').textContent = '';
        document.getElementById('register-error').textContent = '';
    }
});