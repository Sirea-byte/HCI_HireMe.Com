// ==================== FUNGSI GLOBAL ====================
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function getCurrentUserEmail() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    return currentUser ? currentUser.email : null;
}

function requireLogin() {
    if (!sessionStorage.getItem('isLoggedIn')) {
        window.location.href = 'register-login.html';
        return false;
    }
    return true;
}

// ==================== TOGGLE TEMA ====================
const body = document.body;

if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark');
}

const isHalamanDilihat = document.body.classList.contains('page-dilihat');
const isHalamanDisimpan = document.body.classList.contains('page-disimpan');
const toggleBtn = document.querySelector('.theme-toggle');

function updateIcon() {
    if (!toggleBtn) return;
    if (document.body.classList.contains('dark')) {
        toggleBtn.textContent = '☀️';
    } else {
        toggleBtn.textContent = '🌙';
    }
}

if (toggleBtn) {
    updateIcon();
    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateIcon();
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = isDark ? 'dark' : 'light';
        }
    });
}

// ==================== DATA LOWONGAN ====================
let dataLowongan = JSON.parse(localStorage.getItem('bossLowongan') || '[]');
let lastDataSnapshot = '';
function getDataSnapshot() {
    const lamaran = localStorage.getItem('lamaran') || '';
    const lowongan = localStorage.getItem('bossLowongan') || '';
    return lamaran + '|' + lowongan;
}

// ==================== FUNGSI DATA ====================
function getBaseData() {
    const email = getCurrentUserEmail();
    if (isHalamanDilihat) {
        if (!email) return [];
        return dataLowongan.filter(item =>
            localStorage.getItem(`dilihat-${email}-${item.id}`) === 'true'
        );
    }
    if (isHalamanDisimpan) {
        if (!email) return [];
        return dataLowongan.filter(item =>
            localStorage.getItem(`simpan-${email}-${item.id}`) === 'true'
        );
    }
    return dataLowongan;
}

function updateDilihatCount() {
    const email = getCurrentUserEmail();
    if (!email) return;
    const count = dataLowongan.filter(item =>
        localStorage.getItem(`dilihat-${email}-${item.id}`) === 'true'
    ).length;
    const el = document.querySelector('.dilihat-count');
    if (el) el.textContent = count;
}

function updateSavedCount() {
    const email = getCurrentUserEmail();
    if (!email) return;
    const count = dataLowongan.filter(item =>
        localStorage.getItem(`simpan-${email}-${item.id}`) === 'true'
    ).length;
    const el = document.querySelector('.disimpan-count');
    if (el) el.textContent = count;
}

function updateTerkirimCount() {
    const email = getCurrentUserEmail();
    if (!email) return;
    const lamaran = JSON.parse(localStorage.getItem('lamaran') || '[]');
    const count = lamaran.filter(l => l.emailPelamar === email).length;
    const el = document.querySelector('.terkirim-count');
    if (el) el.textContent = count;
}

function updateWawancaraCount() {
    const email = getCurrentUserEmail();
    if (!email) return;
    const lamaran = JSON.parse(localStorage.getItem('lamaran') || '[]');
    const count = lamaran.filter(l => l.emailPelamar === email && l.status === 'Wawancara').length;
    const el = document.querySelector('.wawancara-count');
    if (el) el.textContent = count;
}

function updateStatusCount() {
    const email = getCurrentUserEmail();
    if (!email) return;
    const lamaran = JSON.parse(localStorage.getItem('lamaran') || '[]');
    const count = lamaran.filter(l => l.emailPelamar === email && (l.status === 'Diterima' || l.status === 'Ditolak')).length;
    const el = document.querySelector('.status-count');
    if (el) el.textContent = count;
}

function updateStatusBadges() {
    const email = getCurrentUserEmail();
    if (!email) return;

    const lamaranArr = JSON.parse(localStorage.getItem('lamaran') || '[]');
    const cards = document.querySelectorAll('.lowongan-card');

    cards.forEach(card => {
        const lowonganId = card.dataset.lowonganId;
        if (!lowonganId) return;

        const lamaranUser = lamaranArr.find(l => l.emailPelamar === email && l.lowonganId === lowonganId);
        const badge = card.querySelector('.status-badge-lamaran');

        if (lamaranUser) {
            if (!badge) {
                // Buat badge baru jika belum ada (contoh: baru saja melamar dari tab lain)
                const companyEl = card.querySelector('.company-name');
                if (companyEl) {
                    const newBadge = document.createElement('span');
                    newBadge.className = 'status-badge-lamaran';
                    newBadge.textContent = lamaranUser.status;
                    setStatusBadgeColor(newBadge, lamaranUser.status);
                    companyEl.appendChild(newBadge);
                }
            } else {
                // Perbarui teks dan warna jika status berubah
                if (badge.textContent !== lamaranUser.status) {
                    badge.textContent = lamaranUser.status === 'Dilihat' ? 'Dilirik' : lamaranUser.status;
                    setStatusBadgeColor(badge, lamaranUser.status);
                }
            }
        } else {
            // Lamaran sudah dibatalkan, hapus badge
            if (badge) badge.remove();
        }
    });
}

function setStatusBadgeColor(badge, status) {
    let bgColor = '#aaa';
    switch(status) {
        case 'Terkirim': bgColor = '#f0ad4e'; break;
        case 'Dilihat': bgColor = '#5bc0de'; break;
        case 'Ditolak': bgColor = '#d9534f'; break;
        case 'Wawancara': bgColor = '#5cb85c'; break;
        case 'Diterima': bgColor = '#5cb85c'; break;
    }
    badge.style.backgroundColor = bgColor;
    badge.style.color = 'white';
}

// ==================== ELEMEN UTAMA ====================
const container = document.getElementById('list-lowongan');
const searchInput = document.getElementById('search-company');
const searchLokasi = document.getElementById('search-lokasi');
const sortSelect = document.getElementById('sort-options');
const filterPendidikan = document.getElementById('filter-pendidikan');
const filterJenis = document.getElementById('filter-jenis');

// ==================== FILTER & SORT ====================
function getFilteredAndSortedData() {
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const keywordLokasi = searchLokasi ? searchLokasi.value.trim().toLowerCase() : '';
    const sortBy = sortSelect ? sortSelect.value : 'default';
    const pendidikanFilter = filterPendidikan ? filterPendidikan.value : 'semua';
    const jenisFilter = filterJenis ? filterJenis.value : 'semua';

    let filtered = getBaseData().filter(item =>
        item.company?.toLowerCase().includes(keyword) || item.posisi?.toLowerCase().includes(keyword)
    );

    if (keywordLokasi) {
        filtered = filtered.filter(item => 
            item.lokasi && item.lokasi.toLowerCase().includes(keywordLokasi)
        );
    }

    if (pendidikanFilter !== 'semua') {
        filtered = filtered.filter(item =>
            item.pendidikan?.toLowerCase().includes(pendidikanFilter)
        );
    }

    if (jenisFilter !== 'semua') {
        filtered = filtered.filter(item =>
            item.jenis?.toLowerCase().includes(jenisFilter)
        );
    }

    if (sortBy === 'gaji-tertinggi') {
        filtered.sort((a, b) => {
            const gajiA = parseInt(a.gaji?.replace(/[^0-9]/g, '')) || 0;
            const gajiB = parseInt(b.gaji?.replace(/[^0-9]/g, '')) || 0;
            return gajiB - gajiA;
        });
    } else if (sortBy === 'gaji-terendah') {
        filtered.sort((a, b) => {
            const gajiA = parseInt(a.gaji?.replace(/[^0-9]/g, '')) || 0;
            const gajiB = parseInt(b.gaji?.replace(/[^0-9]/g, '')) || 0;
            return gajiA - gajiB;
        });
    } else if (sortBy === 'terbaru') {
        filtered.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    } else if (sortBy === 'terlama') {
        filtered.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    }

    return filtered;
}

// ==================== RENDER LIST ====================
function renderList(data) {
    if (!container) return;

    container.innerHTML = '';

    if (data.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';

    const email = getCurrentUserEmail();
    const lamaranArr = JSON.parse(localStorage.getItem('lamaran') || '[]'); // satu deklarasi

    data.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'lowongan-card';

        // Nama perusahaan
        const companyEl = document.createElement('h3');
        companyEl.className = 'company-name';
        companyEl.textContent = item.company || 'Perusahaan';

        // Badge hanya jika sudah login
        if (email) {
            if (localStorage.getItem(`simpan-${email}-${item.id}`) === 'true') {
                const badge = document.createElement('span');
                badge.className = 'status-badge-simpan';
                badge.textContent = 'Tersimpan';
                companyEl.appendChild(badge);
            }
            if (localStorage.getItem(`dilihat-${email}-${item.id}`) === 'true') {
                const badge = document.createElement('span');
                badge.className = 'status-badge';
                badge.textContent = 'Dilihat';
                companyEl.appendChild(badge);
            }

            // Badge status lamaran
            const lamaranUser = lamaranArr.find(l => l.emailPelamar === email && l.lowonganId === item.id);
            if (lamaranUser) {
                const statusBadge = document.createElement('span');
                statusBadge.className = 'status-badge-lamaran';
                const displayStatus = lamaranUser.status === 'Dilihat' ? 'Dilirik' : lamaranUser.status;
                statusBadge.textContent = displayStatus;
                let bgColor = '#aaa';
                switch(lamaranUser.status) {
                    case 'Terkirim': bgColor = '#f0ad4e'; break;
                    case 'Dilihat': bgColor = '#5bc0de'; break;
                    case 'Ditolak': bgColor = '#d9534f'; break;
                    case 'Wawancara': bgColor = '#5cb85c'; break;
                    case 'Diterima': bgColor = '#5cb85c'; break;
                }
                statusBadge.style.backgroundColor = bgColor;
                statusBadge.style.color = 'white';
                statusBadge.style.padding = '2px 8px';
                statusBadge.style.borderRadius = '12px';
                statusBadge.style.fontSize = '11px';
                statusBadge.style.marginLeft = '6px';
                companyEl.appendChild(statusBadge);
            }
        }

        if (item.edited) {
            const editTag = document.createElement('span');
            editTag.className = 'tag-edited';
            editTag.textContent = 'Diedit';
            companyEl.appendChild(editTag);

            if (item.editedFields && item.editedFields.includes('deskripsi')) {
                const descTag = document.createElement('span');
                descTag.className = 'tag-edited tag-deskripsi-edited';
                descTag.textContent = 'Deskripsi diubah';
                descTag.style.marginLeft = '4px';
                companyEl.appendChild(descTag);
            }
        }

        card.appendChild(companyEl);

        // Posisi
        const posisiEl = document.createElement('p');
        posisiEl.className = 'job-position';
        posisiEl.textContent = item.posisi || '';
        if (item.editedFields && item.editedFields.includes('posisi')) {
            posisiEl.style.color = '#f0ad4e';
            posisiEl.style.fontWeight = 'bold';
        }
        card.appendChild(posisiEl);


        const infoRow = document.createElement('div');
        infoRow.className = 'info-row';
        const infoFields = [
            { field: 'gaji', value: item.gaji },
            { field: 'lokasi', value: item.lokasi },
            { field: 'jenis', value: item.jenis },
            { field: 'pendidikan', value: item.pendidikan },
            { field: 'jamKerja', value: item.jamKerja },
            { field: 'umur', value: item.umur },
            ...(Array.isArray(item.tags) ? item.tags.map(tag => ({ field: 'tags', value: tag })) : [])
        ].filter(info => info.value);

        infoFields.forEach(info => {
            const span = document.createElement('span');
            span.className = 'info-item';
            const editedFields = item.editedFields || [];
            if (editedFields.includes(info.field)) {
                span.classList.add('edited-field');
            }
            span.textContent = info.value;
            infoRow.appendChild(span);
        });
        card.appendChild(infoRow);

        
        // Expand button
        const expandBtn = document.createElement('button');
        expandBtn.className = 'expand-btn';
        expandBtn.innerHTML = 'Lihat Detail <span class="arrow">▶</span>';
        card.appendChild(expandBtn);

        // Detail panel
        const detailPanel = document.createElement('div');
        detailPanel.className = 'detail-panel';

        const deskripsiEl = document.createElement('p');
        deskripsiEl.className = 'deskripsi-text';
        deskripsiEl.textContent = item.deskripsi || '';
        detailPanel.appendChild(deskripsiEl);

        // Action buttons
        const actionDiv = document.createElement('div');
        actionDiv.className = 'action-buttons';

        // Tombol hapus khusus halaman Dilihat
        if (isHalamanDilihat && email) {
            const hapusBtn = document.createElement('button');
            hapusBtn.className = 'btn btn-delete';
            hapusBtn.textContent = '🗑️ Hapus';
            hapusBtn.addEventListener('click', () => {
                localStorage.removeItem(`dilihat-${email}-${item.id}`);
                localStorage.removeItem(`simpan-${email}-${item.id}`);
                card.remove();
                updateDilihatCount();
                updateSavedCount();
                if (getBaseData().length === 0) {
                    container.style.display = 'none';
                }
            });
            actionDiv.appendChild(hapusBtn);
        }

        const cvKey = `currentCV-${email}`;
        const hasCV = email && !!localStorage.getItem(cvKey);
        const sudahMelamar = email && lamaranArr.some(l => l.emailPelamar === email && l.lowonganId === item.id);
        const lamaranDitolak = email && lamaranArr.some(l => l.emailPelamar === email && l.lowonganId === item.id && l.status === 'Ditolak');

        const lamarBtn = document.createElement('button');
        lamarBtn.className = 'btn btn-primary lamar-btn';  

        if (!email) {
            lamarBtn.textContent = '📄 Lamar Sekarang';
        } else if (!hasCV) {
            lamarBtn.textContent = '📄 Buat CV dulu';
            lamarBtn.style.opacity = '0.7';
        } else if (lamaranDitolak) {
            lamarBtn.textContent = '❌ Ditolak';
            lamarBtn.disabled = true;
            lamarBtn.style.backgroundColor = '#d9534f';
            lamarBtn.style.color = 'white';
            lamarBtn.style.opacity = '0.7';
        } else if (sudahMelamar) {
            lamarBtn.textContent = '❌ Batalkan Lamaran';
            lamarBtn.style.backgroundColor = '#d9534f';
            lamarBtn.style.color = 'white';
        } else {
            lamarBtn.textContent = '📄 Lamar Sekarang';
        }

        lamarBtn.addEventListener('click', () => {
            if (!requireLogin()) return;

            const currentLamaranArr = JSON.parse(localStorage.getItem('lamaran') || '[]');
            const lamaranSekarang = currentLamaranArr.find(l => l.emailPelamar === getCurrentUserEmail() && l.lowonganId === item.id);
            if (lamaranSekarang && lamaranSekarang.status === 'Ditolak') {
                alert('Maaf, lamaran Anda untuk lowongan ini telah ditolak. Anda tidak dapat melamar kembali.');
                return;
            }

            const currentCV = localStorage.getItem(`currentCV-${getCurrentUserEmail()}`);
            if (!currentCV) {
                alert('Anda harus memiliki CV untuk melamar. Silakan buat CV terlebih dahulu.');
                window.location.href = 'cv.html';
                return;
            }

            const existingIndex = currentLamaranArr.findIndex(
                l => l.emailPelamar === getCurrentUserEmail() && l.lowonganId === item.id
            );
            const isCurrentlyApplied = existingIndex !== -1;

            if (isCurrentlyApplied) {
                if (confirm('Batalkan lamaran ini? Anda dapat melamar kembali nanti.')) {
                    currentLamaranArr.splice(existingIndex, 1);
                    localStorage.setItem('lamaran', JSON.stringify(currentLamaranArr));
                    updateTerkirimCount();
                    

                    const statusBadge = card.querySelector('.status-badge-lamaran');
                    if (statusBadge) statusBadge.remove();

                    lamarBtn.textContent = '📄 Lamar Sekarang';
                    lamarBtn.style.backgroundColor = '';   
                    lamarBtn.style.color = '';
                    lamarBtn.style.opacity = '1';
                    lamarBtn.disabled = false;

                    alert('Lamaran berhasil dibatalkan.');
                }
                return;
            }

            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            if (!currentUser || !currentUser.nama) {
                alert('Sesi login tidak valid. Silakan login ulang.');
                sessionStorage.clear();
                window.location.href = 'register-login.html';
                return;
            }

            const lamaranBaru = {
                id: Date.now().toString(),
                lowonganId: item.id,
                bossEmail: item.bossEmail,
                emailPelamar: getCurrentUserEmail(),
                namaPelamar: currentUser.nama,
                status: 'Terkirim',
                tanggal: new Date().toISOString()
            };
            currentLamaranArr.push(lamaranBaru);
            localStorage.setItem('lamaran', JSON.stringify(currentLamaranArr));
            updateTerkirimCount();
        
            lamarBtn.textContent = '❌ Batalkan Lamaran';
            lamarBtn.style.backgroundColor = '#d9534f';
            lamarBtn.style.color = 'white';
            lamarBtn.style.opacity = '1';
            lamarBtn.disabled = false;

            const badge = document.createElement('span');
            badge.className = 'status-badge-lamaran';
            badge.textContent = 'Terkirim';
            badge.style.backgroundColor = '#f0ad4e';
            badge.style.color = 'white';
            badge.style.padding = '2px 8px';
            badge.style.borderRadius = '12px';
            badge.style.fontSize = '11px';
            badge.style.marginLeft = '6px';
            companyEl.appendChild(badge);

            alert('Lamaran berhasil dikirim!');
        });

        const hubungiBtn = document.createElement('button');
        hubungiBtn.className = 'btn btn-outline';
        hubungiBtn.textContent = '📞 Hubungi';
        hubungiBtn.addEventListener('click', () => {
            alert('Nomor telepon perusahaan belum tersedia. Anda dapat mengirim email melalui tombol di samping.');
        });

        const emailBtn = document.createElement('button');
        emailBtn.className = 'btn btn-email';
        emailBtn.textContent = '✉️ Email';
        emailBtn.addEventListener('click', () => {
            if (item.emailPerusahaan) {
                window.location.href = `mailto:${item.emailPerusahaan}`;
            } else {
                alert('Email perusahaan tidak tersedia.');
            }
        });

        const simpanBtn = document.createElement('button');
        simpanBtn.className = 'btn btn-save';
        const saveKey = email ? `simpan-${email}-${item.id}` : null;
        const isSaved = saveKey ? localStorage.getItem(saveKey) === 'true' : false;
        simpanBtn.textContent = isSaved ? '✅ Tersimpan' : '🔖 Simpan';

        simpanBtn.addEventListener('click', () => {
            if (!requireLogin()) return;
            const currentEmail = getCurrentUserEmail();
            const key = `simpan-${currentEmail}-${item.id}`;
            const nowSaved = localStorage.getItem(key) === 'true';
            if (nowSaved) {
                localStorage.removeItem(key);
                simpanBtn.textContent = '🔖 Simpan';
                const badge = card.querySelector('.status-badge-simpan');
                if (badge) badge.remove();
            } else {
                localStorage.setItem(key, 'true');
                simpanBtn.textContent = '✅ Tersimpan';
                const badge = document.createElement('span');
                badge.className = 'status-badge-simpan';
                badge.textContent = 'Tersimpan';
                companyEl.appendChild(badge);
            }
            updateSavedCount();
        });

        actionDiv.appendChild(simpanBtn);
        actionDiv.appendChild(lamarBtn);
        actionDiv.appendChild(hubungiBtn);
        actionDiv.appendChild(emailBtn);
        detailPanel.appendChild(actionDiv);
        card.appendChild(detailPanel);

        expandBtn.addEventListener('click', () => {
            const isOpen = detailPanel.classList.contains('open');
            if (isOpen) {
                detailPanel.classList.remove('open');
                expandBtn.classList.remove('expanded');
                expandBtn.innerHTML = 'Lihat Detail <span class="arrow">▶</span>';
            } else {
                detailPanel.classList.add('open');
                expandBtn.classList.add('expanded');
                expandBtn.innerHTML = 'Sembunyikan <span class="arrow">▼</span>';

                const currentEmail = getCurrentUserEmail();
                if (currentEmail) {
                    const dilihatKey = `dilihat-${currentEmail}-${item.id}`;
                    if (!localStorage.getItem(dilihatKey)) {
                        localStorage.setItem(dilihatKey, 'true');
                        const badge = document.createElement('span');
                        badge.className = 'status-badge';
                        badge.textContent = 'Dilihat';
                        companyEl.appendChild(badge);
                        updateDilihatCount();
                    }
                }
            }
        });
        card.dataset.lowonganId = item.id;
        container.appendChild(card);
    });

    updateDilihatCount();
    updateSavedCount();
    updateTerkirimCount();
    updateWawancaraCount();
    updateStatusCount();
    lastDataSnapshot = getDataSnapshot();
}
// ==================== EVENT LISTENER ====================
if (searchInput) {
    searchInput.addEventListener('input', () => renderList(getFilteredAndSortedData()));
}
if (sortSelect) {
    sortSelect.addEventListener('change', () => renderList(getFilteredAndSortedData()));
}
if (filterPendidikan) {
    filterPendidikan.addEventListener('change', () => renderList(getFilteredAndSortedData()));
}
if (filterJenis) {
    filterJenis.addEventListener('change', () => renderList(getFilteredAndSortedData()));
}
if (searchLokasi) {
    searchLokasi.addEventListener('input', () => renderList(getFilteredAndSortedData()));
}

// ==================== REMINDER LOGIN ====================
const reminder = document.getElementById('reminderLogin');
const loginLink = document.getElementById('loginLink');
const closeReminder = document.getElementById('closeReminder');

function isLoggedIn() {
    return sessionStorage.getItem('isLoggedIn') === 'true';
}

function updateReminder() {
    if (!reminder) return;
    if (isLoggedIn()) {
        reminder.classList.add('hidden');
    } else {
        reminder.classList.remove('hidden');
    }
}

if (closeReminder) {
    closeReminder.addEventListener('click', () => {
        reminder.classList.add('hidden');
    });
}

if (loginLink) {
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'register-login.html';
    });
}

updateReminder();

// ==================== PANEL PENGATURAN ====================
const gearButton = document.getElementById('gearButton');
const settingsPanel = document.getElementById('settingsPanel');
const themeSelect = document.getElementById('themeSelect');
const notifSelect = document.getElementById('notifSelect');
const langSelect = document.getElementById('langSelect');

if (gearButton && settingsPanel) {
    gearButton.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPanel.classList.toggle('visible');
    });

    document.addEventListener('click', (e) => {
        if (!settingsPanel.contains(e.target) && e.target !== gearButton) {
            settingsPanel.classList.remove('visible');
        }
    });
}

if (themeSelect) {
    themeSelect.value = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
    themeSelect.addEventListener('change', () => {
        const val = themeSelect.value;
        document.body.classList.toggle('dark', val === 'dark');
        localStorage.setItem('theme', val);
        if (typeof updateIcon === 'function') updateIcon();
    });
}

if (notifSelect) {
    notifSelect.value = localStorage.getItem('notifikasi') === 'nonaktif' ? 'nonaktif' : 'aktif';
    notifSelect.addEventListener('change', () => {
        localStorage.setItem('notifikasi', notifSelect.value);
    });
}

if (langSelect) {
    langSelect.value = localStorage.getItem('bahasa') === 'en' ? 'en' : 'id';
    langSelect.addEventListener('change', () => {
        localStorage.setItem('bahasa', langSelect.value);
        alert('Bahasa diubah menjadi ' + (langSelect.value === 'id' ? 'Indonesia' : 'English'));
    });
}

// ==================== INISIALISASI ====================
function checkAndRefresh() {
    const currentSnapshot = getDataSnapshot();
    if (currentSnapshot !== lastDataSnapshot && container) {
        dataLowongan = JSON.parse(localStorage.getItem('bossLowongan') || '[]');
        renderList(getFilteredAndSortedData());
    }
}



document.addEventListener('DOMContentLoaded', () => {
    if (container) {
        renderList(getFilteredAndSortedData());
    }
    setInterval(() => {
        checkAndRefresh();
        updateStatusBadges();
    }, 5000);
    updateSavedCount();
    updateDilihatCount();
    updateTerkirimCount();
    updateWawancaraCount();
    updateStatusCount();
});

