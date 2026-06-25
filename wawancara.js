
document.addEventListener('DOMContentLoaded', () => {
    // Proteksi login
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

    // Ambil semua lowongan untuk digabungkan
    const lowonganData = JSON.parse(localStorage.getItem(lowonganKey) || '[]');

    /**
     * Menggabungkan data lamaran user dengan data lowongan,
     * hanya untuk status "Wawancara".
     */
    function getMergedLamaran() {
        let lamaran = JSON.parse(localStorage.getItem(lamaranKey) || '[]');
        lamaran = lamaran.filter(l => l.emailPelamar === email && l.status === 'Wawancara');

        // Gabungkan dengan data lowongan
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
        const sortBy = sortSelect ? sortSelect.value : 'jadwal-terdekat';
        const pendidikanFilter = filterPendidikan ? filterPendidikan.value : 'semua';
        const jenisFilter = filterJenis ? filterJenis.value : 'semua';

        // Filter teks (posisi, perusahaan)
        if (keyword) {
            data = data.filter(item =>
                item.posisi.toLowerCase().includes(keyword) ||
                item.company.toLowerCase().includes(keyword)
            );
        }

        // Filter pendidikan
        if (pendidikanFilter !== 'semua') {
            data = data.filter(item =>
                item.pendidikan?.toLowerCase().includes(pendidikanFilter)
            );
        }

        // Filter jenis pekerjaan
        if (jenisFilter !== 'semua') {
            data = data.filter(item =>
                item.jenis?.toLowerCase().includes(jenisFilter)
            );
        }

        // Sorting
        switch (sortBy) {
            case 'jadwal-terdekat':
                data.sort((a, b) => {
                    const dateA = parseJadwal(a.jadwalWawancara);
                    const dateB = parseJadwal(b.jadwalWawancara);
                    return dateA - dateB;
                });
                break;
            case 'jadwal-terjauh':
                data.sort((a, b) => {
                    const dateA = parseJadwal(a.jadwalWawancara);
                    const dateB = parseJadwal(b.jadwalWawancara);
                    return dateB - dateA;
                });
                break;
            case 'terbaru':
                data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
                break;
            case 'gaji-tertinggi':
                data.sort((a, b) => {
                    const gajiA = parseInt(a.gaji?.replace(/[^0-9]/g, '')) || 0;
                    const gajiB = parseInt(b.gaji?.replace(/[^0-9]/g, '')) || 0;
                    return gajiB - gajiA;
                });
                break;
            case 'gaji-terendah':
                data.sort((a, b) => {
                    const gajiA = parseInt(a.gaji?.replace(/[^0-9]/g, '')) || 0;
                    const gajiB = parseInt(b.gaji?.replace(/[^0-9]/g, '')) || 0;
                    return gajiA - gajiB;
                });
                break;
            default:
                data.sort((a, b) => parseJadwal(a.jadwalWawancara) - parseJadwal(b.jadwalWawancara));
        }

        return data;
    }

    function parseJadwal(jadwalStr) {
        if (!jadwalStr) return new Date('9999-12-31');
        const date = new Date(jadwalStr);
        return isNaN(date.getTime()) ? new Date('9999-12-31') : date;
    }

    function renderList() {
        const data = getFilteredAndSortedData();
        container.innerHTML = '';

        if (data.length === 0) {
            container.innerHTML = '<p style="text-align:center; color: var(--text-subtitle); padding: 20px;">Belum ada lamaran yang masuk tahap wawancara.</p>';
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
            badge.textContent = 'Wawancara';
            badge.style.backgroundColor = '#5cb85c';
            badge.style.color = 'white';
            badge.style.padding = '2px 8px';
            badge.style.borderRadius = '12px';
            badge.style.fontSize = '11px';
            badge.style.marginLeft = '6px';
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
                pesanEl.style.fontStyle = 'italic';
                card.appendChild(pesanEl);
            }
            if (item.jadwalWawancara) {
                const jadwalEl = document.createElement('p');
                jadwalEl.innerHTML = `<strong>📅 Jadwal:</strong> ${escapeHTML(item.jadwalWawancara)}`;
                jadwalEl.style.margin = '4px 0 0 0';
                card.appendChild(jadwalEl);
            }

            const expandBtn = document.createElement('button');
            expandBtn.className = 'expand-btn';
            expandBtn.innerHTML = 'Lihat Detail <span class="arrow">▶</span>';
            card.appendChild(expandBtn);

            const detailPanel = document.createElement('div');
            detailPanel.className = 'detail-panel';
            detailPanel.innerHTML = `
                <p class="deskripsi-text">${escapeHTML(item.deskripsi || 'Tidak ada deskripsi.')}</p>
                <p><small>Dikirim: ${new Date(item.tanggal).toLocaleDateString('id-ID')}</small></p>
            `;
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