// edit-profil.js - Form edit profil untuk kedua tipe akun
document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('form-container');
    const isUser = sessionStorage.getItem('isLoggedIn') === 'true';
    const isBoss = sessionStorage.getItem('isBossLoggedIn') === 'true';

    if (!isUser && !isBoss) {
        window.location.href = 'register-login.html';
        return;
    }

    let userData = null;
    let tipe = null;

    if (isUser) {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        userData = users.find(u => u.email === currentUser.email);
        tipe = 'user';
    } else if (isBoss) {
        const currentBoss = JSON.parse(sessionStorage.getItem('currentBoss'));
        const bosses = JSON.parse(localStorage.getItem('bossUsers') || '[]');
        userData = bosses.find(b => b.email === currentBoss.email);
        tipe = 'boss';
    }

    if (!userData) {
        alert('Data tidak ditemukan.');
        window.location.href = 'profil.html';
        return;
    }

    // Render form sesuai tipe
    if (tipe === 'user') {
        container.innerHTML = `
            <h2>Edit Profil Pencari Kerja</h2>
            <form id="edit-form">
                <label>Nama Lengkap</label>
                <input type="text" id="nama" value="${escapeHTML(userData.nama)}" required>
                <label>Jenis Kelamin</label>
                <select id="gender">
                    <option value="Laki-laki" ${userData.gender === 'Laki-laki' ? 'selected' : ''}>Laki-laki</option>
                    <option value="Perempuan" ${userData.gender === 'Perempuan' ? 'selected' : ''}>Perempuan</option>
                </select>
                <label>Tanggal Lahir</label>
                <input type="date" id="tglLahir" value="${userData.tglLahir}" required>
                <label>Alamat</label>
                <textarea id="alamat" required>${escapeHTML(userData.alamat)}</textarea>
                <label>Nomor Telepon</label>
                <input type="tel" id="telepon" value="${userData.telepon}" required>
                <label>Email</label>
                <input type="email" id="email" value="${userData.email}" required>
                <label>Password Baru (kosongkan jika tidak ingin mengubah)</label>
                <input type="password" id="password" minlength="6">
                <label>Konfirmasi Password Baru</label>
                <input type="password" id="confirm-password" minlength="6">
                <button type="submit" class="btn btn-primary" style="margin-top: 20px;">Simpan Perubahan</button>
                <button type="button" class="btn btn-outline" onclick="window.location.href='profil.html'">Batal</button>
            </form>
        `;
    } else if (tipe === 'boss') {
        container.innerHTML = `
            <h2>Edit Profil Perusahaan</h2>
            <form id="edit-form">
                <label>Nama Perusahaan</label>
                <input type="text" id="company" value="${escapeHTML(userData.company)}" required>
                <label>Email Perusahaan</label>
                <input type="email" id="email" value="${userData.email}" required>
                <label>Nomor Telepon</label>
                <input type="tel" id="phone" value="${userData.phone}" required>
                <label>Password Baru (kosongkan jika tidak ingin mengubah)</label>
                <input type="password" id="password" minlength="6">
                <label>Konfirmasi Password Baru</label>
                <input type="password" id="confirm-password" minlength="6">
                <button type="submit" class="btn btn-primary" style="margin-top: 20px;">Simpan Perubahan</button>
                <button type="button" class="btn btn-outline" onclick="window.location.href='profil.html'">Batal</button>
            </form>
        `;
    }

    // Submit form
    document.getElementById('edit-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirm-password').value;

        if (password && password !== confirm) {
            alert('Password baru tidak cocok.');
            return;
        }

        if (tipe === 'user') {
            const nama = document.getElementById('nama').value.trim();
            const gender = document.getElementById('gender').value;
            const tglLahir = document.getElementById('tglLahir').value;
            const alamat = document.getElementById('alamat').value.trim();
            const telepon = document.getElementById('telepon').value.trim();
            const email = document.getElementById('email').value.trim();

            if (!nama || !gender || !tglLahir || !alamat || !telepon || !email) {
                alert('Semua kolom wajib diisi (kecuali password).');
                return;
            }

            // Perbarui data di localStorage
            let users = JSON.parse(localStorage.getItem('users') || '[]');
            const index = users.findIndex(u => u.email === userData.email);
            if (index === -1) {
                alert('Data tidak ditemukan.');
                return;
            }
            // Jika email berubah, pastikan tidak bentrok dengan user lain
            if (email !== userData.email && users.some(u => u.email === email)) {
                alert('Email sudah digunakan oleh pengguna lain.');
                return;
            }

            users[index].nama = nama;
            users[index].gender = gender;
            users[index].tglLahir = tglLahir;
            users[index].alamat = alamat;
            users[index].telepon = telepon;
            users[index].email = email;
            if (password) users[index].password = password;

            localStorage.setItem('users', JSON.stringify(users));

            // Update session
            sessionStorage.setItem('currentUser', JSON.stringify({ nama, email }));
            alert('Profil berhasil diperbarui.');
            window.location.href = 'profil.html';

        } else if (tipe === 'boss') {
            const company = document.getElementById('company').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();

            if (!company || !email || !phone) {
                alert('Semua kolom wajib diisi.');
                return;
            }

            let bosses = JSON.parse(localStorage.getItem('bossUsers') || '[]');
            const index = bosses.findIndex(b => b.email === userData.email);
            if (index === -1) {
                alert('Data tidak ditemukan.');
                return;
            }
            if (email !== userData.email && bosses.some(b => b.email === email)) {
                alert('Email sudah digunakan oleh perusahaan lain.');
                return;
            }

            bosses[index].company = company;
            bosses[index].email = email;
            bosses[index].phone = phone;
            if (password) bosses[index].password = password;

            localStorage.setItem('bossUsers', JSON.stringify(bosses));
            sessionStorage.setItem('currentBoss', JSON.stringify({ company, email }));
            alert('Profil perusahaan berhasil diperbarui.');
            window.location.href = 'profil.html';
        }
    });
});