
document.addEventListener('DOMContentLoaded', () => {
    // Cek login boss
    if (sessionStorage.getItem('isBossLoggedIn') !== 'true') {
        window.location.href = 'boss-login.html';
        return;
    }

    const boss = JSON.parse(sessionStorage.getItem('currentBoss'));
    const bossEmail = boss.email;

    // Ambil data lowongan bos dari localStorage
    const STORAGE_KEY = 'bossLowongan';
    const LAMARAN_KEY = 'lamaran';

    // Lowongan yang dibuat oleh boss ini
    let dataLowongan = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        .filter(l => l.bossEmail === bossEmail);



    // Data lamaran (semua)
    let dataLamaran = JSON.parse(localStorage.getItem(LAMARAN_KEY) || '[]');

    // ========== RINGKASAN ==========
    function updateRingkasan() {
        const totalPelamar = dataLamaran.filter(l => l.bossEmail === bossEmail && l.status !== 'Diterima' && l.status !== 'Ditolak').length;
        const totalWawancara = dataLamaran.filter(l => l.bossEmail === bossEmail && l.status === 'Wawancara' && l.status !== 'Diterima' && l.status !== 'Ditolak').length;
        document.getElementById('total-pelamar').textContent = totalPelamar;
        document.getElementById('total-wawancara').textContent = totalWawancara;
    }

    // ========== RENDER LIST LOWONGAN ==========
    const container = document.getElementById('boss-lowongan-container');
    const searchInput = document.getElementById('search-company');
    const sortSelect = document.getElementById('sort-options');
    const filterPendidikan = document.getElementById('filter-pendidikan');
    const filterJenis = document.getElementById('filter-jenis');

    function renderList(data) {
        container.innerHTML = '';
        if (data.length === 0) {
            container.innerHTML = '<p style="text-align:center; color: var(--text-subtitle); padding: 20px;">Anda belum memiliki Lowongan.</p>';
            return;
        }

        data.forEach(item => {
            const jumlahPelamar = dataLamaran.filter(l => l.lowonganId === item.id && l.status !== 'Diterima' && l.status !== 'Ditolak').length;
            const card = document.createElement('div');
            card.className = 'lowongan-card';
            card.innerHTML = `
                <h3 class="company-name">${escapeHTML(item.posisi)}</h3>
                <p class="job-position">${escapeHTML(item.lokasi)} | ${item.jenis}</p>
                <div class="info-row">
                    <span class="info-item">${item.gaji || '-'}</span>
                    <span class="info-item">${item.pendidikan || '-'}</span>
                    <span class="info-item">${item.jamKerja || '-'}</span>
                    <span class="info-item">${item.umur || '-'}</span>
                    ${(Array.isArray(item.tags) ? item.tags : []).map(t => `<span class="info-item">${t}</span>`).join('')}
                </div>
                <div style="margin-top:8px; font-weight:600; color: var(--text-title);">👥 Pelamar: ${jumlahPelamar}</div>
                <div class="action-buttons" style="margin-top:10px;">
                    <button class="btn btn-outline btn-lihat-detail" data-id="${item.id}">Lihat Detail</button>
                    <button class="btn btn-outline btn-edit" data-id="${item.id}">✏️ Edit</button>
                    <button class="btn btn-delete btn-hapus" data-id="${item.id}">🗑️ Hapus</button>
                </div>
            `;
            container.appendChild(card);
        });

        // Event listener untuk tombol di kartu
        document.querySelectorAll('.btn-lihat-detail').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                bukaDetail(id);
            });
        });
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                editLowongan(id);
            });
        });
        document.querySelectorAll('.btn-hapus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                hapusLowongan(id);
            });
        });
    }

    function getFilteredAndSortedData() {
        const keyword = searchInput.value.trim().toLowerCase();
        const sortBy = sortSelect.value;
        const pendidikanFilter = filterPendidikan.value;
        const jenisFilter = filterJenis.value;

        let filtered = dataLowongan.filter(item =>
            item.posisi.toLowerCase().includes(keyword)
        );

        if (pendidikanFilter !== 'semua') {
            filtered = filtered.filter(item => item.pendidikan && item.pendidikan.toLowerCase().includes(pendidikanFilter));
        }
        if (jenisFilter !== 'semua') {
            filtered = filtered.filter(item => item.jenis && item.jenis.toLowerCase().includes(jenisFilter));
        }

        // Sort
        if (sortBy === 'gaji-tertinggi') {
            filtered.sort((a, b) => (parseInt(b.gaji?.replace(/[^0-9]/g, '') || 0)) - (parseInt(a.gaji?.replace(/[^0-9]/g, '') || 0)));
        } else if (sortBy === 'gaji-terendah') {
            filtered.sort((a, b) => (parseInt(a.gaji?.replace(/[^0-9]/g, '') || 0)) - (parseInt(b.gaji?.replace(/[^0-9]/g, '') || 0)));
        } else if (sortBy === 'terbaru') {
            filtered.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        } else if (sortBy === 'terlama') {
            filtered.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
        }
        return filtered;
    }

    function getDataPelamar(emailPelamar) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === emailPelamar) || {};
        const cv = JSON.parse(localStorage.getItem(`currentCV-${emailPelamar}`)) || {};
        return { user, cv };
    }

    function refresh() {
        dataLowongan = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').filter(l => l.bossEmail === bossEmail);
        dataLamaran = JSON.parse(localStorage.getItem(LAMARAN_KEY) || '[]');
        updateRingkasan();
        renderList(getFilteredAndSortedData());
    }

    // ========== MODAL TAMBAH/EDIT ==========
    const modalLowongan = document.getElementById('modal-lowongan');
    const formLowongan = document.getElementById('form-lowongan');
    const btnTambah = document.getElementById('btn-tambah-lowongan');
    const btnBatal = document.getElementById('btn-batal');

    btnTambah.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Tambah Lowongan Baru';
        formLowongan.reset();
        document.getElementById('lowongan-id').value = '';
        modalLowongan.classList.add('active');
    });

    btnBatal.addEventListener('click', () => {
        modalLowongan.classList.remove('active');
    });

    formLowongan.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('lowongan-id').value;
        const posisi = document.getElementById('posisi').value.trim();
        const lokasi = document.getElementById('lokasi').value.trim();
        const jenis = document.getElementById('jenis').value;
        const gaji = document.getElementById('gaji').value.trim();
        const pendidikan = document.getElementById('pendidikan').value.trim();
        const jamKerja = document.getElementById('jam-kerja').value.trim();
        const umur = document.getElementById('umur').value.trim();
        const tags = document.getElementById('tags').value.trim();
        const deskripsi = document.getElementById('deskripsi').value.trim();
        const emailPerusahaan = document.getElementById('email-perusahaan').value.trim();

        const lowongan = {
            id: id || Date.now().toString(),
            company: boss.company,
            bossEmail,
            posisi,
            lokasi,
            jenis,
            gaji,
            pendidikan,
            jamKerja,
            umur,
            tags: tags.split(',').map(t => t.trim()).filter(t => t),
            deskripsi,
            emailPerusahaan,
            tanggal: new Date().toISOString().split('T')[0]
        };

        if (id) {
            const original = window.originalLowongan;
            const editedFields = [];
            if (original) {
                if (original.posisi !== posisi) editedFields.push('posisi');
                if (original.lokasi !== lokasi) editedFields.push('lokasi');
                if (original.jenis !== jenis) editedFields.push('jenis');
                if (original.gaji !== gaji) editedFields.push('gaji');
                if (original.pendidikan !== pendidikan) editedFields.push('pendidikan');
                if (original.jamKerja !== jamKerja) editedFields.push('jamKerja');
                if (original.umur !== umur) editedFields.push('umur');
                if (original.deskripsi !== deskripsi) editedFields.push('deskripsi');
                // Tags: bandingkan array setelah diubah ke string
                if (JSON.stringify(original.tags) !== JSON.stringify(tags)) editedFields.push('tags');
                if (original.emailPerusahaan !== emailPerusahaan) editedFields.push('emailPerusahaan');
            }
            lowongan.edited = true;
            lowongan.editedFields = editedFields;
        } else {
            lowongan.edited = false;
            lowongan.editedFields = [];
        }

        let all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (id) {
            // Edit
            const idx = all.findIndex(l => l.id === id);
            if (idx !== -1) all[idx] = lowongan;
        } else {
            all.push(lowongan);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        modalLowongan.classList.remove('active');
        refresh();
    });

    // Edit lowongan (buka modal dengan data)
    function editLowongan(id) {
        const item = dataLowongan.find(l => l.id === id);
        if (!item) return;
        window.originalLowongan = { ...item };
        document.getElementById('modal-title').textContent = 'Edit Lowongan';
        document.getElementById('lowongan-id').value = item.id;
        document.getElementById('posisi').value = item.posisi || '';
        document.getElementById('lokasi').value = item.lokasi || '';
        document.getElementById('jenis').value = item.jenis || 'Full-time';
        document.getElementById('gaji').value = item.gaji || '';
        document.getElementById('pendidikan').value = item.pendidikan || '';
        document.getElementById('jam-kerja').value = item.jamKerja || '';
        document.getElementById('umur').value = item.umur || '';
        document.getElementById('tags').value = (item.tags || []).join(', ');
        document.getElementById('deskripsi').value = item.deskripsi || '';
        document.getElementById('email-perusahaan').value = item.emailPerusahaan || '';
        modalLowongan.classList.add('active');
    }

    // Hapus lowongan
    function hapusLowongan(id) {
         if (confirm('Hapus lowongan ini? Semua lamaran akan ditolak.')) {
            let all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            all = all.filter(l => l.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
            
            // Tolak semua lamaran yang terkait
            let lamaranArr = JSON.parse(localStorage.getItem(LAMARAN_KEY) || '[]');
            lamaranArr.forEach(l => {
                if (l.lowonganId === id) {
                    l.status = 'Ditolak';
                }
            });
            localStorage.setItem(LAMARAN_KEY, JSON.stringify(lamaranArr));
            refresh();
        }
    }

    // ========== MODAL DETAIL + PELAMAR ==========
    const modalDetail = document.getElementById('modal-detail');
    const detailContent = document.getElementById('detail-content');
    document.getElementById('btn-tutup-detail').addEventListener('click', () => {
        modalDetail.classList.remove('active');
    });

    function bukaDetail(id) {
        const lowongan = dataLowongan.find(l => l.id === id);
        if (!lowongan) return;
        const pelamarList = dataLamaran.filter(l => l.lowonganId === id && l.status !== 'Diterima' && l.status !== 'Ditolak');
        let html = `
            <p><strong>Posisi:</strong> ${escapeHTML(lowongan.posisi)}</p>
            <p><strong>Lokasi:</strong> ${escapeHTML(lowongan.lokasi)}</p>
            <p><strong>Jenis:</strong> ${lowongan.jenis}</p>
            <p><strong>Gaji:</strong> ${lowongan.gaji || '-'}</p>
            <p><strong>Deskripsi:</strong> ${escapeHTML(lowongan.deskripsi || '-')}</p>
            <hr>
            <h4>Daftar Pelamar (${pelamarList.length})</h4>
        `;
        if (pelamarList.length === 0) {
            html += '<p>Belum ada pelamar.</p>';
        } 
        else {
            html += '<ul>';
            pelamarList.forEach(p => {
                const { user, cv } = getDataPelamar(p.emailPelamar);
                const pendidikan = cv.pendidikanTinggi?.slice(-1)[0]?.jenjang_tinggi || 
                                cv.pendidikanMenengah?.slice(-1)[0]?.jenjang || 'Tidak diketahui';
                html += `<li>
                    <strong>${escapeHTML(p.namaPelamar)}</strong> (${p.emailPelamar})<br>
                    Pendidikan: ${pendidikan}<br>
                    Status: <em>${p.status}</em><br>
                    <button class="btn btn-sm btn-outline lihat-pelamar" data-email="${p.emailPelamar}" data-lowongan="${id}">Lihat Selengkapnya</button>
                </li>`;
            });
            html += '</ul>';
        }
        detailContent.innerHTML = html;
        modalDetail.classList.add('active');

        document.querySelectorAll('.lihat-pelamar').forEach(btn => {
            btn.addEventListener('click', () => {
                const emailPel = btn.dataset.email;
                const lowId = btn.dataset.lowongan;
                lihatDetailPelamar(emailPel, lowId);
            });
        });

        // Event listener untuk tombol ubah status (bonus)
        document.querySelectorAll('.ubah-status').forEach(btn => {
            btn.addEventListener('click', () => {
                const email = btn.dataset.email;
                const lowId = btn.dataset.lowongan;
                const newStatus = btn.dataset.status;
                // Ubah status di localStorage
                let lamaran = JSON.parse(localStorage.getItem(LAMARAN_KEY) || '[]');
                const idx = lamaran.findIndex(l => l.emailPelamar === email && l.lowonganId === lowId);
                if (idx !== -1) {
                    lamaran[idx].status = newStatus;
                    localStorage.setItem(LAMARAN_KEY, JSON.stringify(lamaran));
                    alert('Status diubah menjadi ' + newStatus);
                    refresh();
                    bukaDetail(lowId); // refresh detail
                }
            });
        });
    }

    // ========== SEARCH, SORT, FILTER EVENT ==========
    searchInput.addEventListener('input', () => renderList(getFilteredAndSortedData()));
    sortSelect.addEventListener('change', () => renderList(getFilteredAndSortedData()));
    filterPendidikan.addEventListener('change', () => renderList(getFilteredAndSortedData()));
    filterJenis.addEventListener('change', () => renderList(getFilteredAndSortedData()));

    // Inisialisasi
    refresh();

    function lihatDetailPelamar(emailPelamar, lowonganId) {
        const { user, cv } = getDataPelamar(emailPelamar);
        // Cari lamaran terkait
        const lamaranArr = JSON.parse(localStorage.getItem(LAMARAN_KEY) || '[]');
        const lamaran = lamaranArr.find(l => l.emailPelamar === emailPelamar && l.lowonganId === lowonganId);
        if (!lamaran) {
            alert('Data lamaran tidak ditemukan.');
            return;
        }

        // Ubah status menjadi "Dilihat" jika perlu
        if (lamaran.status === 'Terkirim') {
            lamaran.status = 'Dilihat';
            lamaran.tanggalDilihat = new Date().toISOString();
            // Simpan perubahan
            const idx = lamaranArr.findIndex(l => l.id === lamaran.id);
            if (idx !== -1) {
                lamaranArr[idx] = lamaran;
                localStorage.setItem(LAMARAN_KEY, JSON.stringify(lamaranArr));
            }
        }

        // Tampilkan detail di modal
        const konten = document.getElementById('detail-pelamar-content');
        konten.innerHTML = `
            <p><strong>Nama:</strong> ${escapeHTML(user.nama || lamaran.namaPelamar)}</p>
            <p><strong>Jenis Kelamin:</strong> ${user.gender || '-'}</p>
            <p><strong>Tanggal Lahir:</strong> ${user.tglLahir || '-'}</p>
            <p><strong>Alamat:</strong> ${escapeHTML(user.alamat || '-')}</p>
            <p><strong>Telepon:</strong> ${user.telepon || '-'}</p>
            <p><strong>Email:</strong> ${user.email || emailPelamar}</p>
            <hr>
            <h4>Detail CV</h4>
            ${cv.nama ? `<p><strong>Judul CV:</strong> ${escapeHTML(cv.nama)}</p>
            <p><strong>Deskripsi:</strong> ${escapeHTML(cv.deskripsi || '-')}</p>
            <p><strong>Pengalaman:</strong> ${(cv.pengalaman||[]).map(e => `${e.posisi} di ${e.perusahaan}`).join(', ') || '-'}</p>
            <p><strong>Pendidikan Menengah:</strong> ${(cv.pendidikanMenengah||[]).map(p => `${p.jenjang} - ${p.sekolah}`).join(', ') || '-'}</p>
            <p><strong>Pendidikan Tinggi:</strong> ${(cv.pendidikanTinggi||[]).map(p => `${p.jenjang_tinggi} - ${p.universitas}`).join(', ') || '-'}</p>
            <p><strong>Skill:</strong> ${(cv.skill||[]).map(s => s.skill).join(', ') || '-'}</p>
            <p><strong>Sertifikasi:</strong> ${(cv.sertifikasi||[]).map(s => s.nama_sertifikasi).join(', ') || '-'}</p>
            <p><strong>Portfolio:</strong> ${(cv.portfolio||[]).map(p => p.nama_proyek).join(', ') || '-'}</p>
            ` : '<p>Tidak ada data CV.</p>'}
        `;

        // Tombol aksi
        const actionDiv = document.getElementById('pelamar-actions');
        actionDiv.innerHTML = '';
        if (lamaran.status === 'Dilihat' || lamaran.status === 'Terkirim') {
            actionDiv.innerHTML = `
                <button class="btn btn-danger" id="btn-reject">❌ Tolak</button>
                <button class="btn btn-success" id="btn-lanjut-wawancara">✅ Lanjut Wawancara</button>
            `;
            document.getElementById('btn-reject').addEventListener('click', () => {
                rejectPelamar(emailPelamar, lowonganId);
            });
            document.getElementById('btn-lanjut-wawancara').addEventListener('click', () => {
                lanjutWawancara(emailPelamar, lowonganId);
            });
        } else if (lamaran.status === 'Wawancara') {
            actionDiv.innerHTML = `
                <button class="btn btn-danger" id="btn-tolak-wawancara">❌ Tolak</button>
                <button class="btn btn-success" id="btn-terima">✅ Terima</button>
            `;
            document.getElementById('btn-tolak-wawancara').addEventListener('click', () => {
                rejectPelamar(emailPelamar, lowonganId);
            });
            document.getElementById('btn-terima').addEventListener('click', () => {
                terimaPelamar(emailPelamar, lowonganId);
            });
        }

        document.getElementById('modal-detail-pelamar').classList.add('active');
        document.getElementById('btn-tutup-detail-pelamar').addEventListener('click', () => {
            document.getElementById('modal-detail-pelamar').classList.remove('active');
        });
    }

    function rejectPelamar(emailPelamar, lowonganId) {
        updateStatusLamaran(emailPelamar, lowonganId, 'Ditolak');
        alert('Lamaran telah ditolak.');
        document.getElementById('modal-detail-pelamar').classList.remove('active');
        refresh();
    }

    function terimaPelamar(emailPelamar, lowonganId) {
        updateStatusLamaran(emailPelamar, lowonganId, 'Diterima');
        alert('Pelamar diterima!');
        document.getElementById('modal-detail-pelamar').classList.remove('active');
        refresh();
    }

    function lanjutWawancara(emailPelamar, lowonganId) {
        const pesan = prompt('Masukkan pesan singkat untuk pelamar:');
        if (pesan === null) return; // batal
        const jadwal = prompt('Masukkan jadwal wawancara (format bebas, contoh: 15 Juni 2025, 10:00 WIB):');
        if (jadwal === null) return;
        updateStatusLamaran(emailPelamar, lowonganId, 'Wawancara', {
            pesanWawancara: pesan,
            jadwalWawancara: jadwal
        });
        alert('Lamaran dilanjutkan ke sesi wawancara.');
        document.getElementById('modal-detail-pelamar').classList.remove('active');
        refresh();
    }

    function updateStatusLamaran(emailPelamar, lowonganId, statusBaru, dataTambahan = {}) {
        let lamaranArr = JSON.parse(localStorage.getItem(LAMARAN_KEY) || '[]');
        const idx = lamaranArr.findIndex(l => l.emailPelamar === emailPelamar && l.lowonganId === lowonganId);
        if (idx !== -1) {
            lamaranArr[idx].status = statusBaru;
            if (dataTambahan) {
                Object.assign(lamaranArr[idx], dataTambahan);
            }
            localStorage.setItem(LAMARAN_KEY, JSON.stringify(lamaranArr));
        }
    }




});