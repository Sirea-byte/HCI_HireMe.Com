document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('profil-container');
    // const logoutBtn = document.getElementById('logout-btn'); // tidak digunakan lagi

    const isUser = sessionStorage.getItem('isLoggedIn') === 'true';
    const isBoss = sessionStorage.getItem('isBossLoggedIn') === 'true';

    if (!isUser && !isBoss) {
        window.location.href = 'register-login.html';
        return;
    }

    let userData = null;

    if (isUser) {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'register-login.html';
            return;
        }
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        userData = users.find(u => u.email === currentUser.email);
        if (!userData) {
            alert('Data pengguna tidak ditemukan.');
            sessionStorage.clear();
            window.location.href = 'register-login.html';
            return;
        }
        tampilkanProfilPencariKerja(userData);
    } else if (isBoss) {
        const currentBoss = JSON.parse(sessionStorage.getItem('currentBoss'));
        if (!currentBoss) {
            window.location.href = 'boss-login.html';
            return;
        }
        const bosses = JSON.parse(localStorage.getItem('bossUsers') || '[]');
        userData = bosses.find(b => b.email === currentBoss.email);
        if (!userData) {
            alert('Data perusahaan tidak ditemukan.');
            sessionStorage.clear();
            window.location.href = 'boss-login.html';
            return;
        }
        tampilkanProfilPerusahaan(userData);
    }

    // Fungsi untuk pencari kerja
    function tampilkanProfilPencariKerja(data) {
        container.innerHTML = `
            <div class="profil-card">
                <h2 style="color: var(--main-sub);">Profil Pencari Kerja</h2>
                <table class="profil-table">
                    <tr><td>Nama Lengkap</td><td>: ${escapeHTML(data.nama)}</td></tr>
                    <tr><td>Jenis Kelamin</td><td>: ${data.gender}</td></tr>
                    <tr><td>Tanggal Lahir</td><td>: ${data.tglLahir}</td></tr>
                    <tr><td>Alamat</td><td>: ${escapeHTML(data.alamat)}</td></tr>
                    <tr><td>Nomor Telepon</td><td>: ${data.telepon}</td></tr>
                    <tr><td>Email</td><td>: ${data.email}</td></tr>
                </table>
                <div class="profil-actions">
                    <button class="btn btn-primary" id="btn-edit">✏️ Edit Profil</button>
                    <button class="btn btn-outline" id="btn-logout">🚪 Logout</button>
                </div>
            </div>
        `;

        // Event Edit
        document.getElementById('btn-edit').addEventListener('click', () => {
            window.location.href = 'edit-profil.html';
        });

        // Event Logout
        document.getElementById('btn-logout').addEventListener('click', () => {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('currentUser');
            window.location.href = 'register-login.html';
        });
    }

    // Fungsi untuk perusahaan
    function tampilkanProfilPerusahaan(data) {
        container.innerHTML = `
            <div class="profil-card">
                <h2 style="color: var(--main-sub);">Profil Perusahaan</h2>
                <table class="profil-table">
                    <tr><td>Nama Perusahaan</td><td>: ${escapeHTML(data.company)}</td></tr>
                    <tr><td>Email Perusahaan</td><td>: ${data.email}</td></tr>
                    <tr><td>Nomor Telepon</td><td>: ${data.phone}</td></tr>
                </table>
                <div class="profil-actions">
                    <button class="btn btn-primary" id="btn-edit">✏️ Edit Profil</button>
                    <button class="btn btn-outline" id="btn-logout">🚪 Logout</button>
                </div>
            </div>
        `;

        document.getElementById('btn-edit').addEventListener('click', () => {
            window.location.href = 'edit-profil.html';
        });

        document.getElementById('btn-logout').addEventListener('click', () => {
            sessionStorage.removeItem('isBossLoggedIn');
            sessionStorage.removeItem('currentBoss');
            window.location.href = 'boss-login.html';
        });
    }
});