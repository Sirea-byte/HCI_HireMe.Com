document.addEventListener('DOMContentLoaded', function () {
    if (!document.body.classList.contains('page-cv')) return;

    const email = getCurrentUserEmail();   // dari script.js
    if (!email) {
        window.location.href = 'register-login.html';
        // tidak perlu return, karena tidak ada kode lain di bawahnya
        // tapi boleh tetap return asal di dalam fungsi
        return;
    }

    const container = document.getElementById('cv-status-container');
    const currentCV = JSON.parse(localStorage.getItem(`currentCV-${email}`));

    function renderStatus() {
        if (!container) return;
        if (!currentCV) {
            container.innerHTML = `
                <div class="cv-empty">
                    <p>Anda belum memiliki CV.</p>
                    <button class="btn btn-primary" onclick="window.location.href='edit-cv.html'">➕ Buat CV</button>
                </div>
            `;
        } else {
            const pengalamanCount = currentCV.pengalaman ? currentCV.pengalaman.length : 0;
            const pendidikanMenengahCount = currentCV.pendidikanMenengah ? currentCV.pendidikanMenengah.length : 0;
            const pendidikanTinggiCount = currentCV.pendidikanTinggi ? currentCV.pendidikanTinggi.length : 0;
            const skillCount = currentCV.skill ? currentCV.skill.length : 0;

            container.innerHTML = `
                <div class="cv-summary">
                    <h3>${escapeHTML(currentCV.nama)}</h3>
                    <p><strong>Deskripsi:</strong> ${escapeHTML(currentCV.deskripsi || '-')}</p>
                    <p><strong>Pengalaman Kerja:</strong> ${pengalamanCount} entri</p>
                    <p><strong>Pendidikan Menengah:</strong> ${pendidikanMenengahCount} entri</p>
                    <p><strong>Pendidikan Tinggi:</strong> ${pendidikanTinggiCount} entri</p>
                    <p><strong>Skill:</strong> ${skillCount} entri</p>
                    <p><strong>Terakhir diperbarui:</strong> ${currentCV.tanggal}</p>
                    <button class="btn btn-primary" onclick="window.location.href='edit-cv.html?edit=true'">✏️ Edit CV</button>
                    <button class="btn btn-outline" id="hapus-cv" style="margin-left:8px;">🗑️ Hapus CV</button>
                </div>
            `;

            document.getElementById('hapus-cv').addEventListener('click', () => {
                if (confirm('Hapus CV permanen?')) {
                    localStorage.removeItem(`currentCV-${email}`);
                    window.location.reload();
                }
            });
        }
    }

    renderStatus();
});