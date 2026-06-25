document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('isLoggedIn')) {
        window.location.href = 'register-login.html';
        return;
    }

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const email = currentUser.email;

    const container = document.getElementById('lamaran-container');
    const searchInput = document.getElementById('search-lamaran');
    const sortSelect = document.getElementById('sort-options');
    const filterPendidikan = document.getElementById('filter-pendidikan');
    const filterJenis = document.getElementById('filter-jenis');

    const lamaranKey = 'lamaran';
    const lowonganKey = 'bossLowongan';

    const lowonganData = JSON.parse(localStorage.getItem(lowonganKey) || '[]');

    function getMergedLamaran() {
        let lamaran = JSON.parse(localStorage.getItem(lamaranKey) || '[]');
        lamaran = lamaran.filter(l => 
            l.emailPelamar === email && 
            (l.status === 'Diterima' || l.status === 'Ditolak')
        );

        return lamaran.map(l => {
            const low = lowonganData.find(lo => lo.id === l.lowonganId) || {};
            return {
                ...l,
                posisi: l.posisi || low.posisi || 'Posisi tidak diketahui',
                company: l.company || low.company || 'Perusahaan tidak diketahui',
                lokasi: low.lokasi || '',
                jenis: low.jenis || '',
                gaji: low.gaji || '',
                pendidikan: low.pendidikan || '',
                jamKerja: low.jamKerja || '',
                umur: low.umur || '',
                tags: low.tags || [],
                deskripsi: low.deskripsi || '',
                emailPerusahaan: low.emailPerusahaan || '',
                edited: low.edited || false,
                editedFields: low.editedFields || []
            };
        });
    }

    function getFilteredAndSortedData() {
        let data = getMergedLamaran();

        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const sortBy = sortSelect ? sortSelect.value : 'status-diterima';
        const pendidikanFilter = filterPendidikan ? filterPendidikan.value : 'semua';
        const jenisFilter = filterJenis ? filterJenis.value : 'semua';

        if (keyword) {
            data = data.filter(item =>
                item.posisi.toLowerCase().includes(keyword) ||
                item.company.toLowerCase().includes(keyword)
            );
        }

        if (pendidikanFilter !== 'semua') {
            data = data.filter(item =>
                item.pendidikan?.toLowerCase().includes(pendidikanFilter)
            );
        }

        if (jenisFilter !== 'semua') {
            data = data.filter(item =>
                item.jenis?.toLowerCase().includes(jenisFilter)
            );
        }

        switch (sortBy) {
            case 'status-diterima':
                // Diterima dulu, baru Ditolak
                data.sort((a, b) => {
                    if (a.status === 'Diterima' && b.status === 'Ditolak') return -1;
                    if (a.status === 'Ditolak' && b.status === 'Diterima') return 1;
                    // Jika status sama, urutkan berdasarkan tanggal kirim terbaru
                    return new Date(b.tanggal) - new Date(a.tanggal);
                });
                break;
            case 'status-ditolak':
                data.sort((a, b) => {
                    if (a.status === 'Ditolak' && b.status === 'Diterima') return -1;
                    if (a.status === 'Diterima' && b.status === 'Ditolak') return 1;
                    return new Date(b.tanggal) - new Date(a.tanggal);
                });
                break;
            case 'terbaru':
                data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
                break;
            case 'terlama':
                data.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
                break;
            case 'gaji-tertinggi':
                data.sort((a, b) => (parseInt(b.gaji?.replace(/[^0-9]/g, '')) || 0) - (parseInt(a.gaji?.replace(/[^0-9]/g, '')) || 0));
                break;
            case 'gaji-terendah':
                data.sort((a, b) => (parseInt(a.gaji?.replace(/[^0-9]/g, '')) || 0) - (parseInt(b.gaji?.replace(/[^0-9]/g, '')) || 0));
                break;
            default:
                // fallback: Diterima dulu
                data.sort((a, b) => {
                    if (a.status === 'Diterima' && b.status === 'Ditolak') return -1;
                    if (a.status === 'Ditolak' && b.status === 'Diterima') return 1;
                    return new Date(b.tanggal) - new Date(a.tanggal);
                });
        }

        return data;
    }

    function hapusLamaran(id) {
        if (!confirm('Hapus lamaran ini?')) return;
        let allLamaran = JSON.parse(localStorage.getItem(lamaranKey) || '[]');
        allLamaran = allLamaran.filter(l => l.id !== id);
        localStorage.setItem(lamaranKey, JSON.stringify(allLamaran));
        renderList();
    }

    function renderList() {
        const data = getFilteredAndSortedData();
        container.innerHTML = '';

        if (data.length === 0) {
            container.innerHTML = '<p style="text-align:center; color: var(--text-subtitle); padding: 20px;">Tidak ada lamaran dengan status Diterima atau Ditolak.</p>';
            return;
        }

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'lowongan-card';

            const companyEl = document.createElement('h3');
            companyEl.className = 'company-name';
            companyEl.textContent = item.company;

            const badge = document.createElement('span');
            badge.className = 'status-badge-lamaran';
            badge.textContent = item.status;
            badge.style.color = 'white';
            badge.style.padding = '2px 8px';
            badge.style.borderRadius = '12px';
            badge.style.fontSize = '11px';
            badge.style.marginLeft = '6px';
            if (item.status === 'Diterima') {
                badge.style.backgroundColor = '#5cb85c'; // hijau
            } else if (item.status === 'Ditolak') {
                badge.style.backgroundColor = '#d9534f'; // merah
            }
            companyEl.appendChild(badge);

            if (item.edited) {
                const editTag = document.createElement('span');
                editTag.className = 'tag-edited';
                editTag.textContent = 'Diedit';
                editTag.style.backgroundColor = '#f0ad4e';
                editTag.style.color = 'white';
                editTag.style.padding = '2px 8px';
                editTag.style.borderRadius = '12px';
                editTag.style.fontSize = '11px';
                editTag.style.marginLeft = '4px';
                companyEl.appendChild(editTag);
            }

            card.appendChild(companyEl);

            const posisiEl = document.createElement('p');
            posisiEl.className = 'job-position';
            posisiEl.textContent = item.posisi;
            card.appendChild(posisiEl);

            const infoRow = document.createElement('div');
            infoRow.className = 'info-row';
            const infoItems = [
                item.gaji,
                item.lokasi,
                item.jenis,
                item.pendidikan,
                item.jamKerja,
                item.umur,
                ...(Array.isArray(item.tags) ? item.tags : [])
            ].filter(Boolean);
            infoItems.forEach(text => {
                const span = document.createElement('span');
                span.className = 'info-item';
                span.textContent = text;
                infoRow.appendChild(span);
            });
            card.appendChild(infoRow);

            if (item.pesanWawancara) {
                const pesanEl = document.createElement('p');
                pesanEl.innerHTML = `<strong>📩 Pesan:</strong> ${escapeHTML(item.pesanWawancara)}`;
                pesanEl.style.margin = '8px 0 0 0';
                card.appendChild(pesanEl);
            }
            if (item.jadwalWawancara) {
                const jadwalEl = document.createElement('p');
                jadwalEl.innerHTML = `<strong>📅 Jadwal:</strong> ${escapeHTML(item.jadwalWawancara)}`;
                jadwalEl.style.margin = '4px 0 0 0';
                card.appendChild(jadwalEl);
            }

            const hapusBtn = document.createElement('button');
            hapusBtn.className = 'btn btn-delete';
            hapusBtn.textContent = '🗑️ Hapus';
            hapusBtn.style.marginTop = '10px';
            hapusBtn.addEventListener('click', () => hapusLamaran(item.id));
            card.appendChild(hapusBtn);

            container.appendChild(card);
        });
    }

    // Event listener
    if (searchInput) searchInput.addEventListener('input', renderList);
    if (sortSelect) sortSelect.addEventListener('change', renderList);
    if (filterPendidikan) filterPendidikan.addEventListener('change', renderList);
    if (filterJenis) filterJenis.addEventListener('change', renderList);

    // Render awal + refresh periodik
    renderList();
    setInterval(renderList, 30000);
});