
document.addEventListener('DOMContentLoaded', function () {
    if (!document.body.classList.contains('page-edit-cv')) return;

    const email = getCurrentUserEmail();   // fungsi global dari script.js
    if (!email) {
        alert('Anda harus login untuk mengakses halaman ini.');
        window.location.href = 'register-login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const isEdit = urlParams.get('edit') === 'true';
    const currentCV = JSON.parse(localStorage.getItem(`currentCV-${email}`));

    const configs = {
        pengalaman: {
            container: 'pengalaman-container',
            fields: [
                { label: 'Posisi', name: 'posisi' },
                { label: 'Nama Perusahaan', name: 'perusahaan' },
                { label: 'Tahun', name: 'tahun', placeholder: 'contoh: 2020-2022' }
            ]
        },
        'pendidikan-menengah': {
            container: 'pendidikan-menengah-container',
            fields: [
                { label: 'Nama Sekolah', name: 'sekolah' },
                { label: 'Jurusan', name: 'jurusan' }
            ],
            dropdown: {
                label: 'Jenjang',
                name: 'jenjang',
                options: ['SD', 'SMP', 'SMA', 'SMK', 'Lainnya']
            },
            file: { label: 'Upload Ijazah', name: 'ijazah_menengah', accept: '.pdf,.jpg,.png' }
        },
        'pendidikan-tinggi': {
            container: 'pendidikan-tinggi-container',
            fields: [
                { label: 'Nama Universitas/Institut', name: 'universitas' },
                { label: 'Jurusan', name: 'jurusan_tinggi' }
            ],
            dropdown: {
                label: 'Jenjang',
                name: 'jenjang_tinggi',
                options: ['D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3', 'Lainnya']
            },
            file: { label: 'Upload Ijazah', name: 'ijazah_tinggi', accept: '.pdf,.jpg,.png' }
        },
        skill: {
            container: 'skill-container',
            fields: [
                { label: 'Nama Skill', name: 'skill' }
            ]
        },
        sertifikasi: {
            container: 'sertifikasi-container',
            fields: [
                { label: 'Nama Sertifikasi/Lisensi', name: 'nama_sertifikasi' },
                { label: 'Penerbit', name: 'penerbit' }
            ],
            file: { label: 'Upload Sertifikat', name: 'file_sertifikat', accept: '.pdf,.jpg,.png' }
        },
        portfolio: {
            container: 'portfolio-container',
            fields: [
                { label: 'Nama Proyek/Portfolio', name: 'nama_proyek' },
                { label: 'Deskripsi', name: 'deskripsi_portfolio' }
            ],
            file: { label: 'Upload File/Dokumentasi', name: 'file_portfolio', accept: '.pdf,.jpg,.png,.zip' }
        }
    };

    function updateNomor(container) {
        if (!container) return;
        const entries = container.querySelectorAll('.dynamic-entry');
        entries.forEach((entry, index) => {
            const numberSpan = entry.querySelector('.entry-number');
            if (numberSpan) {
                numberSpan.textContent = (index + 1) + '. ';
            }
        });
    }

    function createEntry(config) {
        const entry = document.createElement('div');
        entry.className = 'dynamic-entry';
        let html = '<span class="entry-number"></span>';  // tempat nomor

        if (config.fields) {
            config.fields.forEach(field => {
                html += `<label>${field.label}</label>
                         <input type="text" name="${field.name}" placeholder="${field.placeholder || ''}">`;
            });
        }
        if (config.dropdown) {
            html += `<label>${config.dropdown.label}</label>
                     <select name="${config.dropdown.name}">
                         ${config.dropdown.options.map(opt => `<option value="${opt}" style="background: var(--background-sec); color: var(--main-sub)">${opt}</option>`).join('')}
                     </select>`;
        }
        if (config.file) {
            html += `<label>${config.file.label}</label>
                     <input type="file" name="${config.file.name}" accept="${config.file.accept || ''}">
                     <span class="file-info"></span>`;
        }
        html += '<button type="button" class="remove-entry">✕</button>';
        entry.innerHTML = html;

        // Tombol hapus
        const removeBtn = entry.querySelector('.remove-entry');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                entry.remove();
                const container = entry.parentElement;
                if (container) updateNomor(container);
            });
        }

        return entry;
    }

    function isiBagian(containerId, dataArray, config) {
        const container = document.getElementById(containerId);
        if (!container || !dataArray) return;

        dataArray.forEach(item => {
            const entry = createEntry(config);
            if (config.fields) {
                config.fields.forEach(field => {
                    const input = entry.querySelector(`input[name="${field.name}"]`);
                    if (input) input.value = item[field.name] || '';
                });
            }
            if (config.dropdown) {
                const select = entry.querySelector(`select[name="${config.dropdown.name}"]`);
                if (select) select.value = item[config.dropdown.name] || config.dropdown.options[0];
            }
            if (config.file) {
                const fileInfo = entry.querySelector('.file-info');
                if (fileInfo && item[config.file.name + '_name']) {
                    fileInfo.textContent = `File: ${item[config.file.name + '_name']}`;
                }
            }
            container.appendChild(entry);
        });
        updateNomor(container);
    }

    for (let key in configs) {
        const btn = document.getElementById('tambah-' + key);
        const container = document.getElementById(configs[key].container);
        if (btn && container) {
            btn.addEventListener('click', () => {
                const entry = createEntry(configs[key]);
                container.appendChild(entry);
                updateNomor(container);
            });
        } else {
            console.warn('Tombol atau container untuk "' + key + '" tidak ditemukan.');
        }
    }

    const formTitle = document.getElementById('form-title');
    const namaInput = document.getElementById('nama-cv');
    const deskripsiInput = document.getElementById('deskripsi-cv');

    if (isEdit && currentCV) {
        if (formTitle) formTitle.textContent = 'Edit CV Anda';
        if (namaInput) namaInput.value = currentCV.nama || '';
        if (deskripsiInput) deskripsiInput.value = currentCV.deskripsi || '';

        isiBagian('pengalaman-container', currentCV.pengalaman, configs.pengalaman);
        isiBagian('pendidikan-menengah-container', currentCV.pendidikanMenengah, configs['pendidikan-menengah']);
        isiBagian('pendidikan-tinggi-container', currentCV.pendidikanTinggi, configs['pendidikan-tinggi']);
        isiBagian('skill-container', currentCV.skill, configs.skill);
        isiBagian('sertifikasi-container', currentCV.sertifikasi, configs.sertifikasi);
        isiBagian('portfolio-container', currentCV.portfolio, configs.portfolio);
    }

    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Submit form
    const form = document.getElementById('cv-form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const nama = namaInput ? namaInput.value.trim() : '';
            const deskripsi = deskripsiInput ? deskripsiInput.value.trim() : '';
            if (!nama) {
                alert('Nama CV harus diisi!');
                return;
            }

            const cvData = {
                id: currentCV ? currentCV.id : Date.now().toString(),
                nama,
                deskripsi,
                tanggal: new Date().toLocaleDateString('id-ID'),
                pengalaman: [],
                pendidikanMenengah: [],
                pendidikanTinggi: [],
                skill: [],
                sertifikasi: [],
                portfolio: []
            };

            async function extractSection(containerId, targetArray, fileFields = []) {
                const container = document.getElementById(containerId);
                if (!container) return;
                const entries = container.querySelectorAll('.dynamic-entry');
                for (let entry of entries) {
                    const item = {};
                    entry.querySelectorAll('input[type="text"], select').forEach(inp => {
                        item[inp.name] = inp.value;
                    });
                    for (let fname of fileFields) {
                        const fileInput = entry.querySelector(`input[name="${fname}"]`);
                        if (fileInput && fileInput.files[0]) {
                            const file = fileInput.files[0];
                            if (file.size < 3 * 1024 * 1024) {
                                item[fname + '_file'] = await toBase64(file);
                                item[fname + '_name'] = file.name;
                            } else {
                                alert(`File ${file.name} terlalu besar (>3MB). Hanya nama disimpan.`);
                                item[fname + '_name'] = file.name;
                            }
                        }
                    }
                    targetArray.push(item);
                }
            }

            await extractSection('pengalaman-container', cvData.pengalaman);
            await extractSection('pendidikan-menengah-container', cvData.pendidikanMenengah, ['ijazah_menengah']);
            await extractSection('pendidikan-tinggi-container', cvData.pendidikanTinggi, ['ijazah_tinggi']);
            await extractSection('skill-container', cvData.skill);
            await extractSection('sertifikasi-container', cvData.sertifikasi, ['file_sertifikat']);
            await extractSection('portfolio-container', cvData.portfolio, ['file_portfolio']);

            localStorage.setItem(`currentCV-${email}`, JSON.stringify(cvData));
            alert('CV berhasil disimpan!');
            window.location.href = 'cv.html';
        });
    } else {
        console.warn('Form #cv-form tidak ditemukan.');
    }
});