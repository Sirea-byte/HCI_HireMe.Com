// terkirim.js – Menampilkan lamaran "Terkirim" & "Dilirik" + tombol batalkan
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
        lamaran = lamaran.filter(l => l.emailPelamar === email);

        const sekarang = new Date();
        lamaran = lamaran.map(l => {
            if (l.status === 'Dilihat' && l.tanggalDilihat) {
                const batas = new Date(l.tanggalDilihat);
                batas.setDate(batas.getDate() + 14);
                if (sekarang > batas) {
                    l.status = 'Ditolak';
                    const allLamaran = JSON.parse(localStorage.getItem(lamaranKey) || '[]');
                    const idx = allLamaran.findIndex(x => x.id === l.id);
                    if (idx !== -1) {
                        allLamaran[idx].status = 'Ditolak';
                        localStorage.setItem(lamaranKey, JSON.stringify(allLamaran));
                    }
                }
            }
            return l;
        });

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
        data = data.filter(item => item.status === 'Terkirim' || item.status === 'Dilihat');

        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const sortBy = sortSelect ? sortSelect.value : 'terbaru';
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

        if (sortBy === 'terbaru') {
            data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        } else if (sortBy === 'terlama') {
            data.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
        } else if (sortBy === 'gaji-tertinggi') {
            data.sort((a, b) => (parseInt(b.gaji?.replace(/[^0-9]/g, '')) || 0) - (parseInt(a.gaji?.replace(/[^0-9]/g, '')) || 0));
        } else if (sortBy === 'gaji-terendah') {
            data.sort((a, b) => (parseInt(a.gaji?.replace(/[^0-9]/g, '')) || 0) - (parseInt(b.gaji?.replace(/[^0-9]/g, '')) || 0));
        }

        return data;
    }

    function renderList() {
        const data = getFilteredAndSortedData();
        container.innerHTML = '';

        if (data.length === 0) {
            container.innerHTML = '<p style="text-align:center; color: var(--text-subtitle); padding: 20px;">Belum ada lamaran dengan status Terkirim atau Dilirik.</p>';
            return;
        }

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'lowongan-card';

            let statusColor = '#f0ad4e';
            let statusText = item.status;
            if (item.status === 'Dilihat') {
                statusColor = '#5bc0de';
                statusText = 'Dilirik';
            }

            const companyEl = document.createElement('h3');
            companyEl.className = 'company-name';
            companyEl.textContent = item.company;

            const statusBadge = document.createElement('span');
            statusBadge.className = 'status-badge-lamaran';
            statusBadge.textContent = statusText;
            statusBadge.style.backgroundColor = statusColor;
            statusBadge.style.color = 'white';
            statusBadge.style.padding = '2px 8px';
            statusBadge.style.borderRadius = '12px';
            statusBadge.style.fontSize = '11px';
            statusBadge.style.marginLeft = '6px';
            companyEl.appendChild(statusBadge);

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

            const expandBtn = document.createElement('button');
            expandBtn.className = 'expand-btn';
            expandBtn.innerHTML = 'Lihat Detail <span class="arrow">▶</span>';
            card.appendChild(expandBtn);

            const detailPanel = document.createElement('div');
            detailPanel.className = 'detail-panel';
            detailPanel.innerHTML = `
                <p class="deskripsi-text">${escapeHTML(item.deskripsi || 'Tidak ada deskripsi.')}</p>
                ${item.pesanWawancara ? `<p><strong>Pesan:</strong> ${escapeHTML(item.pesanWawancara)}</p>` : ''}
                ${item.jadwalWawancara ? `<p><strong>Jadwal Wawancara:</strong> ${item.jadwalWawancara}</p>` : ''}
                <p><small>Dikirim: ${new Date(item.tanggal).toLocaleDateString('id-ID')}</small></p>
            `;

            // Tombol Batalkan Lamaran
            const batalBtn = document.createElement('button');
            batalBtn.className = 'btn btn-danger';
            batalBtn.textContent = '❌ Batalkan Lamaran';
            batalBtn.style.marginTop = '10px';
            batalBtn.addEventListener('click', () => {
                if (confirm('Batalkan lamaran ini? Anda dapat melamar kembali nanti.')) {
                    let allLamaran = JSON.parse(localStorage.getItem(lamaranKey) || '[]');
                    allLamaran = allLamaran.filter(l => l.id !== item.id);
                    localStorage.setItem(lamaranKey, JSON.stringify(allLamaran));
                    renderList();
                }
            });
            detailPanel.appendChild(batalBtn);

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
                }
            });

            container.appendChild(card);
        });
    }

    if (searchInput) searchInput.addEventListener('input', renderList);
    if (sortSelect) sortSelect.addEventListener('change', renderList);
    if (filterPendidikan) filterPendidikan.addEventListener('change', renderList);
    if (filterJenis) filterJenis.addEventListener('change', renderList);

    renderList();
    setInterval(renderList, 30000);
});