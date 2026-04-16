// Main Application Logic

// Global variables
let currentTab = 'absensi';
let siswaList = [];

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize database
    await db.init();
    
    // Setup event listeners
    setupNavigation();
    setupDateInputs();
    setupConnectionListener();
    
    // Load initial data
    await loadSiswaList();
    await loadGuruData();
    await loadJadwalList();
    updateStorageInfo();
    
    // Set default dates to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tanggal').value = today;
    document.getElementById('jurnalTanggal').value = today;
    document.getElementById('laporanDari').value = today;
    document.getElementById('laporanSampai').value = today;
    
    showNotification('Aplikasi siap digunakan!', 'success');
});

// Setup navigation tabs
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

// Switch between tabs
function switchTab(tabId) {
    // Update active button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        }
    });
    
    // Update active content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId) {
            content.classList.add('active');
        }
    });
    
    currentTab = tabId;
    
    // Load specific data based on tab
    if (tabId === 'absensi') {
        loadSiswaList();
    } else if (tabId === 'pengaturan') {
        loadDaftarSiswaSettings();
        updateStorageInfo();
    }
}

// Setup date inputs
function setupDateInputs() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.addEventListener('change', () => {
            if (input.id === 'kelas' || input.id === 'jurnalKelas') {
                loadSiswaByKelas();
            }
        });
    });
    
    // Add change listener for kelas dropdown in absensi
    document.getElementById('kelas').addEventListener('change', loadSiswaByKelas);
}

// Setup connection status listener
function setupConnectionListener() {
    function updateConnectionStatus() {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.getElementById('statusText');
        
        if (navigator.onLine) {
            statusDot.className = 'status-dot online';
            statusText.textContent = 'Online';
        } else {
            statusDot.className = 'status-dot offline';
            statusText.textContent = 'Offline';
            showNotification('Anda sedang offline. Data tetap dapat disimpan.', 'warning');
        }
    }
    
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    updateConnectionStatus();
}

// Load all students
async function loadSiswaList() {
    try {
        siswaList = await db.getAllSiswa();
        renderStudentGrid(siswaList);
    } catch (error) {
        console.error('Error loading siswa:', error);
        showNotification('Gagal memuat data siswa', 'error');
    }
}

// Load students by class
async function loadSiswaByKelas() {
    const kelas = document.getElementById('kelas').value;
    
    if (!kelas) {
        renderStudentGrid([]);
        return;
    }
    
    try {
        siswaList = await db.getSiswaByKelas(kelas);
        renderStudentGrid(siswaList);
    } catch (error) {
        console.error('Error loading siswa by kelas:', error);
        showNotification('Gagal memuat data siswa', 'error');
    }
}

// Render student grid for attendance
function renderStudentGrid(students) {
    const grid = document.getElementById('studentGrid');
    
    if (students.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <p>📋 Belum ada data siswa. Silakan tambah siswa di menu Pengaturan.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = students.map(siswa => `
        <div class="student-item">
            <div class="student-info">
                <div class="student-name">${siswa.nama}</div>
                <div class="student-nis">NIS: ${siswa.nis}</div>
            </div>
            <div class="attendance-options">
                <label title="Hadir">
                    <input type="radio" name="absen_${siswa.nis}" value="H" checked>
                    H
                </label>
                <label title="Sakit">
                    <input type="radio" name="absen_${siswa.nis}" value="S">
                    S
                </label>
                <label title="Izin">
                    <input type="radio" name="absen_${siswa.nis}" value="I">
                    I
                </label>
                <label title="Alpha">
                    <input type="radio" name="absen_${siswa.nis}" value="A">
                    A
                </label>
            </div>
        </div>
    `).join('');
}

// Save attendance
async function simpanAbsensi() {
    const tanggal = document.getElementById('tanggal').value;
    const kelas = document.getElementById('kelas').value;
    const mapel = document.getElementById('mapel').value;
    
    if (!tanggal || !kelas || !mapel) {
        showNotification('Mohon lengkapi tanggal, kelas, dan mata pelajaran', 'error');
        return;
    }
    
    if (siswaList.length === 0) {
        showNotification('Tidak ada siswa untuk disimpan absensinya', 'error');
        return;
    }
    
    try {
        // Collect attendance data
        const attendanceRecords = [];
        
        siswaList.forEach(siswa => {
            const radioGroup = document.getElementsByName(`absen_${siswa.nis}`);
            let status = 'H';
            
            for (const radio of radioGroup) {
                if (radio.checked) {
                    status = radio.value;
                    break;
                }
            }
            
            attendanceRecords.push({
                nis: siswa.nis,
                nama: siswa.nama,
                kelas: kelas,
                mapel: mapel,
                tanggal: tanggal,
                status: status,
                timestamp: new Date().toISOString()
            });
        });
        
        // Save each record
        for (const record of attendanceRecords) {
            await db.addAbsensi(record);
        }
        
        showNotification(`Berhasil menyimpan absensi untuk ${attendanceRecords.length} siswa`, 'success');
        resetForm();
        
    } catch (error) {
        console.error('Error saving attendance:', error);
        showNotification('Gagal menyimpan absensi', 'error');
    }
}

// Reset attendance form
function resetForm() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tanggal').value = today;
    document.getElementById('kelas').value = '';
    document.getElementById('mapel').value = '';
    document.getElementById('studentGrid').innerHTML = '';
    siswaList = [];
}

// Reset journal form
function resetJurnal() {
    document.getElementById('jurnalTanggal').value = '';
    document.getElementById('jurnalKelas').value = '';
    document.getElementById('jurnalMapel').value = '';
    document.getElementById('materi').value = '';
    document.getElementById('kompetensi').value = '';
    document.getElementById('metode').value = '';
    document.getElementById('media').value = '';
    document.getElementById('catatan').value = '';
    document.getElementById('kendala').value = '';
    document.getElementById('tindakLanjut').value = '';
}

// Save schedule
async function simpanJadwal() {
    const jadwalData = {
        hari: document.getElementById('jadwalHari').value,
        kelas: document.getElementById('jadwalKelas').value,
        mapel: document.getElementById('jadwalMapel').value,
        jamMulai: document.getElementById('jadwalJamMulai').value,
        jamSelesai: document.getElementById('jadwalJamSelesai').value,
        ruang: document.getElementById('jadwalRuang').value,
        timestamp: new Date().toISOString()
    };
    
    // Validation
    if (!jadwalData.hari || !jadwalData.kelas || !jadwalData.mapel) {
        showNotification('Mohon lengkapi hari, kelas, dan mata pelajaran', 'error');
        return;
    }
    
    if (!jadwalData.jamMulai || !jadwalData.jamSelesai) {
        showNotification('Mohon lengkapi jam mulai dan jam selesai', 'error');
        return;
    }
    
    try {
        await db.addJadwal(jadwalData);
        showNotification('Jadwal mengajar berhasil disimpan', 'success');
        resetJadwal();
        loadJadwalList();
    } catch (error) {
        console.error('Error saving schedule:', error);
        showNotification('Gagal menyimpan jadwal', 'error');
    }
}

// Reset schedule form
function resetJadwal() {
    document.getElementById('jadwalHari').value = '';
    document.getElementById('jadwalKelas').value = '';
    document.getElementById('jadwalMapel').value = '';
    document.getElementById('jadwalJamMulai').value = '';
    document.getElementById('jadwalJamSelesai').value = '';
    document.getElementById('jadwalRuang').value = '';
}

// Load schedule list
async function loadJadwalList() {
    try {
        const jadwals = await db.getAllJadwal();
        const jadwalGrid = document.getElementById('jadwalGrid');
        
        if (jadwals.length === 0) {
            jadwalGrid.innerHTML = '<div class="empty-state"><p>📅 Belum ada jadwal tersimpan</p></div>';
            return;
        }
        
        // Group by day
        const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        let html = '';
        
        days.forEach(day => {
            const dayJadwals = jadwals.filter(j => j.hari === day);
            if (dayJadwals.length > 0) {
                html += `<div class="jadwal-day"><h4>${day}</h4>`;
                dayJadwals.forEach(jadwal => {
                    html += `
                        <div class="jadwal-item">
                            <div class="jadwal-header">
                                <span class="jadwal-time">${jadwal.jamMulai} - ${jadwal.jamSelesai}</span>
                                <button class="btn-delete" onclick="hapusJadwal(${jadwal.id})">🗑️</button>
                            </div>
                            <div class="jadwal-details">
                                <strong>${jadwal.kelas}</strong> - ${jadwal.mapel}
                                <br><small>📍 ${jadwal.ruang || '-'}</small>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }
        });
        
        jadwalGrid.innerHTML = html;
    } catch (error) {
        console.error('Error loading schedule:', error);
    }
}

// Delete schedule
async function hapusJadwal(id) {
    if (confirm('Yakin ingin menghapus jadwal ini?')) {
        try {
            await db.deleteJadwal(id);
            showNotification('Jadwal berhasil dihapus', 'success');
            loadJadwalList();
        } catch (error) {
            console.error('Error deleting schedule:', error);
            showNotification('Gagal menghapus jadwal', 'error');
        }
    }
}

// Save journal
async function simpanJurnal() {
    const jurnalData = {
        tanggal: document.getElementById('jurnalTanggal').value,
        kelas: document.getElementById('jurnalKelas').value,
        mapel: document.getElementById('jurnalMapel').value,
        materi: document.getElementById('materi').value,
        kompetensi: document.getElementById('kompetensi').value,
        metode: document.getElementById('metode').value,
        media: document.getElementById('media').value,
        catatan: document.getElementById('catatan').value,
        kendala: document.getElementById('kendala').value,
        tindakLanjut: document.getElementById('tindakLanjut').value,
        timestamp: new Date().toISOString()
    };
    
    // Validation
    if (!jurnalData.tanggal || !jurnalData.kelas || !jurnalData.mapel) {
        showNotification('Mohon lengkapi tanggal, kelas, dan mata pelajaran', 'error');
        return;
    }
    
    if (!jurnalData.materi) {
        showNotification('Mohon isi materi pembelajaran', 'error');
        return;
    }
    
    try {
        await db.addJurnal(jurnalData);
        showNotification('Jurnal mengajar berhasil disimpan', 'success');
        resetJurnal();
    } catch (error) {
        console.error('Error saving journal:', error);
        showNotification('Gagal menyimpan jurnal', 'error');
    }
}

// Reset journal form
function resetJurnal() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('jurnalTanggal').value = today;
    document.getElementById('jurnalKelas').value = '';
    document.getElementById('jurnalMapel').value = '';
    document.getElementById('materi').value = '';
    document.getElementById('kompetensi').value = '';
    document.getElementById('metode').value = '';
    document.getElementById('media').value = '';
    document.getElementById('catatan').value = '';
    document.getElementById('kendala').value = '';
    document.getElementById('tindakLanjut').value = '';
}

// Generate report
async function generateLaporan() {
    const type = document.getElementById('laporanType').value;
    const dari = document.getElementById('laporanDari').value;
    const sampai = document.getElementById('laporanSampai').value;
    const kelas = document.getElementById('laporanKelas').value;
    
    const container = document.getElementById('reportContainer');
    container.innerHTML = '<div class="spinner"></div>';
    
    try {
        let data = [];
        const filters = { dari, sampai, kelas };
        
        if (type === 'absensi') {
            data = await db.getAbsensiByFilter(filters);
        } else {
            data = await db.getJurnalByFilter(filters);
        }
        
        // Store data for export functions
        currentReportData = data;
        currentReportType = type;
        
        if (data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>📋 Tidak ada data untuk periode yang dipilih</p>
                </div>
            `;
            return;
        }
        
        // Render report
        if (type === 'absensi') {
            renderAttendanceReport(data, container);
        } else {
            renderJournalReport(data, container);
        }
        
    } catch (error) {
        console.error('Error generating report:', error);
        container.innerHTML = `
            <div class="empty-state">
                <p>❌ Terjadi kesalahan saat generate laporan</p>
            </div>
        `;
    }
}

// Render attendance report
function renderAttendanceReport(data, container) {
    // Group by date and class
    const grouped = {};
    
    data.forEach(record => {
        const key = `${record.tanggal}-${record.kelas}-${record.mapel}`;
        if (!grouped[key]) {
            grouped[key] = {
                tanggal: record.tanggal,
                kelas: record.kelas,
                mapel: record.mapel,
                records: []
            };
        }
        grouped[key].records.push(record);
    });
    
    let html = '<h3>Laporan Absensi</h3>';
    html += '<table class="report-table">';
    html += '<thead><tr><th>Tanggal</th><th>Kelas</th><th>Mapel</th><th>Hadir</th><th>Sakit</th><th>Izin</th><th>Alpha</th></tr></thead>';
    html += '<tbody>';
    
    Object.values(grouped).forEach(group => {
        const hadir = group.records.filter(r => r.status === 'H').length;
        const sakit = group.records.filter(r => r.status === 'S').length;
        const izin = group.records.filter(r => r.status === 'I').length;
        const alpha = group.records.filter(r => r.status === 'A').length;
        
        html += `<tr>
            <td>${formatDate(group.tanggal)}</td>
            <td>${group.kelas}</td>
            <td>${group.mapel}</td>
            <td>${hadir}</td>
            <td>${sakit}</td>
            <td>${izin}</td>
            <td>${alpha}</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Render journal report
function renderJournalReport(data, container) {
    let html = '<h3>Laporan Jurnal Mengajar</h3>';
    html += '<table class="report-table">';
    html += '<thead><tr><th>Tanggal</th><th>Kelas</th><th>Mapel</th><th>Materi</th><th>Metode</th></tr></thead>';
    html += '<tbody>';
    
    data.forEach(jurnal => {
        html += `<tr>
            <td>${formatDate(jurnal.tanggal)}</td>
            <td>${jurnal.kelas}</td>
            <td>${jurnal.mapel}</td>
            <td>${jurnal.materi.substring(0, 50)}${jurnal.materi.length > 50 ? '...' : ''}</td>
            <td>${jurnal.metode}</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Export to Excel using XLSX library
let currentReportData = null;
let currentReportType = null;

function exportToExcel() {
    const type = document.getElementById('laporanType').value;
    
    if (!currentReportData || currentReportData.length === 0) {
        showNotification('Generate laporan terlebih dahulu', 'warning');
        return;
    }
    
    let data = [];
    let filename = `Laporan_${type}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    if (type === 'absensi') {
        // Prepare attendance data for Excel
        data = [['Tanggal', 'Kelas', 'Mata Pelajaran', 'NIS', 'Nama Siswa', 'Status', 'Keterangan']];
        currentReportData.forEach(record => {
            const keterangan = record.status === 'H' ? 'Hadir' : 
                              record.status === 'S' ? 'Sakit' : 
                              record.status === 'I' ? 'Izin' : 'Alpha';
            data.push([
                record.tanggal,
                record.kelas,
                record.mapel,
                record.nis,
                record.nama,
                record.status,
                keterangan
            ]);
        });
    } else {
        // Prepare journal data for Excel
        data = [['Tanggal', 'Kelas', 'Mata Pelajaran', 'Materi', 'Kompetensi', 'Metode', 'Media', 'Catatan', 'Kendala', 'Tindak Lanjut']];
        currentReportData.forEach(record => {
            data.push([
                record.tanggal,
                record.kelas,
                record.mapel,
                record.materi,
                record.kompetensi,
                record.metode,
                record.media,
                record.catatan,
                record.kendala,
                record.tindakLanjut
            ]);
        });
    }
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    const maxWidth = 20;
    ws['!cols'] = data[0].map(() => ({ wch: maxWidth }));
    
    // Style header row
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + "1";
        if (!ws[address]) continue;
        ws[address].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4CAF50" } },
            alignment: { horizontal: "center", vertical: "center" }
        };
    }
    
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
    XLSX.writeFile(wb, filename);
    
    showNotification('Laporan berhasil diexport ke Excel!', 'success');
}

// Export to PDF using jsPDF library
function exportToPDF() {
    const type = document.getElementById('laporanType').value;
    
    if (!currentReportData || currentReportData.length === 0) {
        showNotification('Generate laporan terlebih dahulu', 'warning');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape mode
    
    // Title
    const title = type === 'absensi' ? 'LAPORAN ABSENSI SISWA' : 'LAPORAN JURNAL MENGAJAR';
    const subtitle = 'Sekolah Dasar - Kurikulum Merdeka';
    
    doc.setFontSize(16);
    doc.text(title, 148, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(subtitle, 148, 28, { align: 'center' });
    
    // Date info
    const dari = document.getElementById('laporanDari').value;
    const sampai = document.getElementById('laporanSampai').value;
    doc.setFontSize(10);
    doc.text(`Periode: ${dari} s/d ${sampai}`, 148, 36, { align: 'center' });
    
    // Prepare table data
    let headers = [];
    let rows = [];
    
    if (type === 'absensi') {
        headers = [['Tanggal', 'Kelas', 'Mapel', 'NIS', 'Nama', 'Status', 'Keterangan']];
        currentReportData.forEach(record => {
            const keterangan = record.status === 'H' ? 'Hadir' : 
                              record.status === 'S' ? 'Sakit' : 
                              record.status === 'I' ? 'Izin' : 'Alpha';
            rows.push([
                record.tanggal,
                record.kelas,
                record.mapel,
                record.nis,
                record.nama,
                record.status,
                keterangan
            ]);
        });
    } else {
        headers = [['Tanggal', 'Kelas', 'Mapel', 'Materi', 'Metode', 'Catatan']];
        currentReportData.forEach(record => {
            rows.push([
                record.tanggal,
                record.kelas,
                record.mapel,
                record.materi.substring(0, 50) + (record.materi.length > 50 ? '...' : ''),
                record.metode,
                record.catatan.substring(0, 50) + (record.catatan.length > 50 ? '...' : '')
            ]);
        });
    }
    
    // Generate table
    doc.autoTable({
        head: headers,
        body: rows,
        startY: 42,
        theme: 'grid',
        headStyles: { fillColor: [76, 175, 80], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        styles: { cellPadding: 2, overflow: 'linebreak' },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 20 },
            2: { cellWidth: 35 },
            3: { cellWidth: 20 },
            4: { cellWidth: 40 },
            5: { cellWidth: 15 },
            6: { cellWidth: 25 }
        }
    });
    
    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Halaman ${i} dari ${pageCount}`, 148, 290, { align: 'center' });
    }
    
    // Save PDF
    const filename = `Laporan_${type}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    
    showNotification('Laporan berhasil diexport ke PDF!', 'success');
}

// Save teacher data
async function simpanDataGuru() {
    const namaGuru = document.getElementById('namaGuru').value;
    const nip = document.getElementById('nip').value;
    
    if (!namaGuru) {
        showNotification('Mohon masukkan nama guru', 'error');
        return;
    }
    
    try {
        await db.saveDataGuru({ nama: namaGuru, nip: nip });
        showNotification('Data guru berhasil disimpan', 'success');
    } catch (error) {
        console.error('Error saving guru data:', error);
        showNotification('Gagal menyimpan data guru', 'error');
    }
}

// Load teacher data
async function loadGuruData() {
    try {
        const guru = await db.getDataGuru();
        if (guru) {
            document.getElementById('namaGuru').value = guru.nama || '';
            document.getElementById('nip').value = guru.nip || '';
        }
    } catch (error) {
        console.error('Error loading guru data:', error);
    }
}

// Add student modal
function tambahSiswa() {
    document.getElementById('modalSiswa').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('modalSiswa').style.display = 'none';
}

// Save student
async function saveSiswa() {
    const nis = document.getElementById('nis').value;
    const nama = document.getElementById('namaSiswa').value;
    const kelas = document.getElementById('kelasSiswa').value;
    
    if (!nis || !nama) {
        showNotification('Mohon lengkapi NIS dan nama siswa', 'error');
        return;
    }
    
    try {
        await db.addSiswa({ nis, nama, kelas });
        showNotification('Siswa berhasil ditambahkan', 'success');
        closeModal();
        
        // Clear form
        document.getElementById('nis').value = '';
        document.getElementById('namaSiswa').value = '';
        
        // Reload student list
        await loadSiswaList();
        await loadDaftarSiswaSettings();
    } catch (error) {
        console.error('Error adding student:', error);
        showNotification('Gagal menambahkan siswa. NIS mungkin sudah ada.', 'error');
    }
}

// Load student list in settings
async function loadDaftarSiswaSettings() {
    try {
        const siswaList = await db.getAllSiswa();
        const container = document.getElementById('daftarSiswaSettings');
        
        if (siswaList.length === 0) {
            container.innerHTML = '<p class="empty-state">Belum ada data siswa</p>';
            return;
        }
        
        let html = '<table class="report-table mt-20">';
        html += '<thead><tr><th>NIS</th><th>Nama</th><th>Kelas</th><th>Aksi</th></tr></thead>';
        html += '<tbody>';
        
        siswaList.forEach(siswa => {
            html += `<tr>
                <td>${siswa.nis}</td>
                <td>${siswa.nama}</td>
                <td>${siswa.kelas || '-'}</td>
                <td>
                    <button class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;" 
                        onclick="deleteSiswa('${siswa.nis}')">Hapus</button>
                </td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading student list:', error);
    }
}

// Delete student
async function deleteSiswa(nis) {
    if (!confirm('Yakin ingin menghapus siswa ini?')) {
        return;
    }
    
    try {
        await db.deleteSiswa(nis);
        showNotification('Siswa berhasil dihapus', 'success');
        await loadDaftarSiswaSettings();
        await loadSiswaList();
    } catch (error) {
        console.error('Error deleting student:', error);
        showNotification('Gagal menghapus siswa', 'error');
    }
}

// Import students (from JSON)
function importSiswa() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (!Array.isArray(data)) {
                    showNotification('Format file tidak valid', 'error');
                    return;
                }
                
                let count = 0;
                for (const siswa of data) {
                    if (siswa.nis && siswa.nama) {
                        try {
                            await db.addSiswa(siswa);
                            count++;
                        } catch (error) {
                            console.log('Skip duplicate NIS:', siswa.nis);
                        }
                    }
                }
                
                showNotification(`Berhasil import ${count} siswa`, 'success');
                await loadDaftarSiswaSettings();
                await loadSiswaList();
            } catch (error) {
                console.error('Error importing students:', error);
                showNotification('Gagal import data siswa', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Backup data
async function backupData() {
    try {
        const data = await db.backupData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_absensi_${new Date().getTime()}.json`;
        link.click();
        
        showNotification('Backup berhasil', 'success');
    } catch (error) {
        console.error('Error backing up data:', error);
        showNotification('Gagal backup data', 'error');
    }
}

// Restore data
function restoreData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
        if (!confirm('Restore data akan menimpa semua data yang ada. Lanjutkan?')) {
            return;
        }
        
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                await db.restoreData(data);
                showNotification('Restore data berhasil', 'success');
                await loadSiswaList();
                await loadGuruData();
                await loadDaftarSiswaSettings();
            } catch (error) {
                console.error('Error restoring data:', error);
                showNotification('Gagal restore data', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Clear all data
async function clearAllData() {
    if (!confirm('PERINGATAN: Semua data akan dihapus! Tindakan ini tidak dapat dibatalkan. Lanjutkan?')) {
        return;
    }
    
    if (!confirm('Apakah Anda benar-benar yakin?')) {
        return;
    }
    
    try {
        await db.clearAllData();
        showNotification('Semua data berhasil dihapus', 'success');
        await loadSiswaList();
        await loadGuruData();
        await loadDaftarSiswaSettings();
    } catch (error) {
        console.error('Error clearing data:', error);
        showNotification('Gagal menghapus data', 'error');
    }
}

// Update storage info
async function updateStorageInfo() {
    try {
        const usage = await db.getStorageUsage();
        const usedMB = (usage.used / (1024 * 1024)).toFixed(2);
        const quotaMB = (usage.quota / (1024 * 1024)).toFixed(2);
        const percentage = (usage.used / usage.quota) * 100;
        
        document.getElementById('storageUsed').textContent = `${usedMB} MB / ${quotaMB} MB`;
        document.getElementById('storageFill').style.width = `${percentage}%`;
    } catch (error) {
        console.error('Error getting storage info:', error);
    }
}

// Utility: Format date to Indonesian
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('modalSiswa');
    if (event.target === modal) {
        closeModal();
    }
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.error('Service Worker registration failed:', err));
}

// Save new journal format (5 Poin Utama)
async function simpanJurnalBaru() {
    const jurnalData = {
        tanggal: document.getElementById('jurnalTanggal').value,
        kelas: document.getElementById('jurnalKelas').value,
        mapel: document.getElementById('jurnalMapel').value,
        topikMateri: document.getElementById('topikMateri').value,
        metodeMedia: document.getElementById('metodeMedia').value,
        ringkasanAlur: document.getElementById('ringkasanAlur').value,
        hadirCount: parseInt(document.getElementById('hadirCount').value) || 0,
        totalSiswa: parseInt(document.getElementById('totalSiswa').value) || 0,
        sakitCount: parseInt(document.getElementById('sakitCount').value) || 0,
        izinCount: parseInt(document.getElementById('izinCount').value) || 0,
        alphaCount: parseInt(document.getElementById('alphaCount').value) || 0,
        kendalaUtama: document.getElementById('kendalaUtama').value,
        jenisPenilaian: document.getElementById('jenisPenilaian').value,
        tingkatPenguasaan: document.getElementById('tingkatPenguasaan').value,
        catatanKeberhasilan: document.getElementById('catatanKeberhasilan').value,
        rencanaPerbaikan: document.getElementById('rencanaPerbaikan').value,
        timestamp: new Date().toISOString()
    };
    
    // Validation
    if (!jurnalData.tanggal || !jurnalData.kelas || !jurnalData.mapel) {
        showNotification('Mohon lengkapi tanggal, kelas, dan mata pelajaran', 'error');
        return;
    }
    
    if (!jurnalData.topikMateri) {
        showNotification('Mohon isi topik materi', 'error');
        return;
    }
    
    try {
        await db.addJurnal(jurnalData);
        showNotification('Jurnal mengajar berhasil disimpan', 'success');
        resetJurnalBaru();
    } catch (error) {
        console.error('Error saving journal:', error);
        showNotification('Gagal menyimpan jurnal', 'error');
    }
}

// Reset new journal form
function resetJurnalBaru() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('jurnalTanggal').value = today;
    document.getElementById('jurnalKelas').value = '';
    document.getElementById('jurnalMapel').value = '';
    document.getElementById('topikMateri').value = '';
    document.getElementById('metodeMedia').value = '';
    document.getElementById('ringkasanAlur').value = '';
    document.getElementById('hadirCount').value = '';
    document.getElementById('totalSiswa').value = '';
    document.getElementById('sakitCount').value = '';
    document.getElementById('izinCount').value = '';
    document.getElementById('alphaCount').value = '';
    document.getElementById('kendalaUtama').value = '';
    document.getElementById('jenisPenilaian').value = '';
    document.getElementById('tingkatPenguasaan').value = '';
    document.getElementById('catatanKeberhasilan').value = '';
    document.getElementById('rencanaPerbaikan').value = '';
}
