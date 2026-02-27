/**
 * Pembagi Jam Pelajaran SD/MI - Google Apps Script Web App
 * Sistem Pembagian Otomatis Jam Pelajaran untuk Sekolah Dasar/Madrasah Ibtidaiyah
 */

// ============================================================================
// KONFIGURASI & SETUP
// ============================================================================

const CONFIG = {
  SHEET_NAMES: {
    GURU: 'Data Guru',
    KELAS: 'Data Kelas',
    MAPEL: 'Struktur Mapel',
    HASIL: 'Hasil Jadwal',
    SETTINGS: 'Settings'
  },
  HARI: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  MAX_JAM_PER_HARI: 8,
  ADMIN_PASSWORD: 'admin123' // Password default (bisa diubah)
};

/**
 * Fungsi utama - Menampilkan halaman web
 */
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Pembagi Jam Pelajaran SD/MI')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setFaviconUrl('https://fonts.gstatic.com/s/i/materialicons/school/v1/24px.svg');
}

/**
 * Include file CSS/JS eksternal
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Mendapatkan Spreadsheet ID
 */
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Mendapatkan atau membuat sheet
 */
function getOrCreateSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

// ============================================================================
// FUNGSI SETUP DATABASE
// ============================================================================

/**
 * Setup struktur database spreadsheet
 */
function setupDatabase() {
  const ss = getSpreadsheet();
  
  // Setup Data Guru
  setupGuruSheet(ss);
  
  // Setup Data Kelas
  setupKelasSheet(ss);
  
  // Setup Struktur Mapel
  setupMapelSheet(ss);
  
  // Setup Hasil Jadwal
  setupHasilSheet(ss);
  
  // Setup Settings
  setupSettingsSheet(ss);
  
  return { success: true, message: 'Database berhasil di-setup!' };
}

function setupGuruSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.GURU);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAMES.GURU);
  }
  
  const headers = ['ID', 'Nama Guru', 'Jenis Guru', 'Mata Pelajaran', 'Maksimal Jam/Minggu', 'Status', 'Created At'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#4CAF50').setFontColor('white');
  
  // Data sample
  const sampleData = [
    ['GURU001', 'Ahmad Fauzi', 'Guru Kelas', 'Semua Mapel', 24, 'Aktif', new Date()],
    ['GURU002', 'Siti Nurhaliza', 'Guru Kelas', 'Semua Mapel', 24, 'Aktif', new Date()],
    ['GURU003', 'Budi Santoso', 'Guru Mapel', 'PJOK', 18, 'Aktif', new Date()],
    ['GURU004', 'Fatimah Zahra', 'Guru Mapel', 'Bahasa Inggris', 18, 'Aktif', new Date()],
    ['GURU005', 'Umar Abdullah', 'Guru Mapel', 'PAI', 18, 'Aktif', new Date()],
    ['GURU006', 'Aisyah Putri', 'Guru Mapel', 'SBdP', 18, 'Aktif', new Date()]
  ];
  
  if (sheet.getLastRow() < 2) {
    sheet.getRange(2, 1, sampleData.length, sampleData[0].length).setValues(sampleData);
  }
}

function setupKelasSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.KELAS);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAMES.KELAS);
  }
  
  const headers = ['ID', 'Nama Kelas', 'Tingkat', 'Jumlah Jam/Hari', 'Guru Kelas', 'Status', 'Created At'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#2196F3').setFontColor('white');
  
  // Data sample - 6 tingkat dengan 2 paralel masing-masing
  const sampleData = [];
  const kelasNames = ['A', 'B'];
  let id = 1;
  
  for (let tingkat = 1; tingkat <= 6; tingkat++) {
    for (let paralel of kelasNames) {
      sampleData.push([
        'KLS' + String(id).padStart(3, '0'),
        `Kelas ${tingkat}${paralel}`,
        tingkat,
        6,
        '',
        'Aktif',
        new Date()
      ]);
      id++;
    }
  }
  
  if (sheet.getLastRow() < 2) {
    sheet.getRange(2, 1, sampleData.length, sampleData[0].length).setValues(sampleData);
  }
}

function setupMapelSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MAPEL);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAMES.MAPEL);
  }
  
  const headers = ['ID', 'Mata Pelajaran', 'Jam/Minggu (Kls 1-3)', 'Jam/Minggu (Kls 4-6)', 'Kategori', 'Warna', 'Created At'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#9C27B0').setFontColor('white');
  
  // Struktur kurikulum SD/MI
  const sampleData = [
    ['MAPEL001', 'PKn', 4, 3, 'Guru Kelas', '#FFB74D', new Date()],
    ['MAPEL002', 'Bahasa Indonesia', 8, 7, 'Guru Kelas', '#64B5F6', new Date()],
    ['MAPEL003', 'Matematika', 5, 5, 'Guru Kelas', '#81C784', new Date()],
    ['MAPEL004', 'IPA', 0, 4, 'Guru Kelas', '#4DB6AC', new Date()],
    ['MAPEL005', 'IPS', 0, 3, 'Guru Kelas', '#A1887F', new Date()],
    ['MAPEL006', 'PJOK', 3, 3, 'Guru Mapel', '#E57373', new Date()],
    ['MAPEL007', 'Bahasa Inggris', 2, 2, 'Guru Mapel', '#BA68C8', new Date()],
    ['MAPEL008', 'PAI', 4, 4, 'Guru Mapel', '#4CAF50', new Date()],
    ['MAPEL009', 'SBdP', 3, 3, 'Guru Mapel', '#F06292', new Date()],
    ['MAPEL010', 'Tematik', 10, 0, 'Guru Kelas', '#FFF176', new Date()]
  ];
  
  if (sheet.getLastRow() < 2) {
    sheet.getRange(2, 1, sampleData.length, sampleData[0].length).setValues(sampleData);
  }
}

function setupHasilSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.HASIL);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAMES.HASIL);
  }
  
  const headers = ['ID Jadwal', 'Kelas', 'Hari', 'Jam Ke-', 'Mata Pelajaran', 'Guru', 'Tanggal Generate', 'Status'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#FF9800').setFontColor('white');
}

function setupSettingsSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.SETTINGS);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAMES.SETTINGS);
  }
  
  const headers = ['Key', 'Value', 'Description'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#607D8B').setFontColor('white');
  
  const settings = [
    ['admin_password', CONFIG.ADMIN_PASSWORD, 'Password admin'],
    ['school_name', 'SD/MI Contoh', 'Nama Sekolah'],
    ['academic_year', '2025/2026', 'Tahun Ajaran'],
    ['dark_mode', 'false', 'Mode Gelap'],
    ['last_generate', '', 'Terakhir Generate']
  ];
  
  if (sheet.getLastRow() < 2) {
    sheet.getRange(2, 1, settings.length, settings[0].length).setValues(settings);
  }
}

// ============================================================================
// API - GURU
// ============================================================================

/**
 * Mendapatkan semua data guru
 */
function getGuruList() {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAMES.GURU);
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    
    return data.map(row => ({
      id: row[0],
      nama: row[1],
      jenis: row[2],
      mapel: row[3],
      maxJam: row[4],
      status: row[5],
      createdAt: row[6]
    })).filter(g => g.id);
  } catch (e) {
    Logger.log('Error getGuruList: ' + e.toString());
    return [];
  }
}

/**
 * Simpan guru baru
 */
function saveGuru(data) {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAMES.GURU);
    const id = data.id || 'GURU' + String(new Date().getTime()).slice(-6);
    
    const rowData = [
      id,
      data.nama,
      data.jenis,
      data.mapel || 'Semua Mapel',
      data.maxJam || 24,
      data.status || 'Aktif',
      new Date()
    ];
    
    if (data.id) {
      // Update
      const range = sheet.createTextFinder(data.id).findAll();
      if (range.length > 0) {
        sheet.getRange(range[0].getRow() + 1, 1, 1, rowData.length).setValues([rowData]);
      }
    } else {
      // Insert
      sheet.appendRow(rowData);
    }
    
    return { success: true, id: id, message: 'Data guru berhasil disimpan!' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Hapus guru
 */
function deleteGuru(id) {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAMES.GURU);
    const range = sheet.createTextFinder(id).findAll();
    
    if (range.length > 0) {
      sheet.deleteRow(range[0].getRow() + 1);
      return { success: true, message: 'Data guru berhasil dihapus!' };
    }
    
    return { success: false, error: 'Data tidak ditemukan' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ============================================================================
// API - KELAS
// ============================================================================

/**
 * Mendapatkan semua data kelas
 */
function getKelasList() {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAMES.KELAS);
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    
    return data.map(row => ({
      id: row[0],
      nama: row[1],
      tingkat: row[2],
      jamPerHari: row[3],
      guruKelas: row[4],
      status: row[5],
      createdAt: row[6]
    })).filter(k => k.id);
  } catch (e) {
    Logger.log('Error getKelasList: ' + e.toString());
    return [];
  }
}

/**
 * Simpan kelas baru
 */
function saveKelas(data) {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAMES.KELAS);
    const id = data.id || 'KLS' + String(new Date().getTime()).slice(-6);
    
    const rowData = [
      id,
      data.nama,
      data.tingkat,
      data.jamPerHari || 6,
      data.guruKelas || '',
      data.status || 'Aktif',
      new Date()
    ];
    
    if (data.id) {
      const range = sheet.createTextFinder(data.id).findAll();
      if (range.length > 0) {
        sheet.getRange(range[0].getRow() + 1, 1, 1, rowData.length).setValues([rowData]);
      }
    } else {
      sheet.appendRow(rowData);
    }
    
    return { success: true, id: id, message: 'Data kelas berhasil disimpan!' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Hapus kelas
 */
function deleteKelas(id) {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAMES.KELAS);
    const range = sheet.createTextFinder(id).findAll();
    
    if (range.length > 0) {
      sheet.deleteRow(range[0].getRow() + 1);
      return { success: true, message: 'Data kelas berhasil dihapus!' };
    }
    
    return { success: false, error: 'Data tidak ditemukan' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ============================================================================
// API - MAPEL
// ============================================================================

/**
 * Mendapatkan semua mata pelajaran
 */
function getMapelList() {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAMES.MAPEL);
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    
    return data.map(row => ({
      id: row[0],
      nama: row[1],
      jamKls13: row[2],
      jamKls46: row[3],
      kategori: row[4],
      warna: row[5],
      createdAt: row[6]
    })).filter(m => m.id);
  } catch (e) {
    Logger.log('Error getMapelList: ' + e.toString());
    return [];
  }
}

/**
 * Simpan mata pelajaran
 */
function saveMapel(data) {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAMES.MAPEL);
    const id = data.id || 'MAPEL' + String(new Date().getTime()).slice(-6);
    
    const rowData = [
      id,
      data.nama,
      data.jamKls13 || 0,
      data.jamKls46 || 0,
      data.kategori || 'Guru Kelas',
      data.warna || '#4CAF50',
      new Date()
    ];
    
    if (data.id) {
      const range = sheet.createTextFinder(data.id).findAll();
      if (range.length > 0) {
        sheet.getRange(range[0].getRow() + 1, 1, 1, rowData.length).setValues([rowData]);
      }
    } else {
      sheet.appendRow(rowData);
    }
    
    return { success: true, id: id, message: 'Data mapel berhasil disimpan!' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Hapus mata pelajaran
 */
function deleteMapel(id) {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAMES.MAPEL);
    const range = sheet.createTextFinder(id).findAll();
    
    if (range.length > 0) {
      sheet.deleteRow(range[0].getRow() + 1);
      return { success: true, message: 'Data mapel berhasil dihapus!' };
    }
    
    return { success: false, error: 'Data tidak ditemukan' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ============================================================================
// ALGORITMA GENERATE JADWAL
// ============================================================================

/**
 * Generate jadwal otomatis
 */
function generateJadwal() {
  try {
    const guruList = getGuruList();
    const kelasList = getKelasList();
    const mapelList = getMapelList();
    
    if (guruList.length === 0 || kelasList.length === 0) {
      return { 
        success: false, 
        error: 'Data guru atau kelas masih kosong. Silakan input data terlebih dahulu.' 
      };
    }
    
    // Inisialisasi struktur jadwal
    const jadwal = initializeJadwal(kelasList);
    
    // Track jam guru
    const guruJamTracker = {};
    guruList.forEach(g => {
      guruJamTracker[g.id] = { current: 0, max: g.maxJam };
    });
    
    // Track jadwal guru per hari-jam
    const guruSchedule = {};
    
    // Generate untuk setiap kelas
    kelasList.forEach(kelas => {
      const tingkat = kelas.tingkat;
      const jamPerHari = kelas.jamPerHari || 6;
      
      // Dapatkan mapel untuk tingkat ini
      const mapelUntukKelas = getMapelUntukTingkat(mapelList, tingkat);
      
      // Dapatkan guru kelas
      const guruKelas = getGuruKelasUntukKelas(guruList, kelas);
      
      // Generate jadwal per hari
      CONFIG.HARI.forEach(hari => {
        for (let jamKe = 1; jamKe <= jamPerHari; jamKe++) {
          const slotKey = `${kelas.id}-${hari}-${jamKe}`;
          
          // Pilih mapel yang belum terpenuhi
          const mapelTersedia = mapelUntukKelas.filter(m => {
            const assigned = jadwal[kelas.id].filter(s => s.mapel === m.nama).length;
            return assigned < m.jamPerMinggu;
          });
          
          if (mapelTersedia.length === 0) return;
          
          // Pilih guru untuk mapel ini
          const guru = pilihGuruUntukMapel(
            guruKelas, 
            guruList, 
            mapelTersedia[0], 
            guruJamTracker, 
            guruSchedule, 
            hari, 
            jamKe
          );
          
          if (guru) {
            jadwal[kelas.id].push({
              hari: hari,
              jamKe: jamKe,
              mapel: mapelTersedia[0].nama,
              guru: guru.nama,
              guruId: guru.id,
              warna: mapelTersedia[0].warna
            });
            
            // Update tracker
            guruJamTracker[guru.id].current++;
            
            // Mark slot guru sebagai occupied
            const guruSlotKey = `${guru.id}-${hari}-${jamKe}`;
            guruSchedule[guruSlotKey] = true;
          }
        }
      });
    });
    
    // Simpan ke spreadsheet
    simpanJadwalKeSpreadsheet(jadwal);
    
    // Update settings
    updateSetting('last_generate', new Date().toLocaleString('id-ID'));
    
    return { 
      success: true, 
      message: 'Jadwal berhasil digenerate!',
      stats: getJadwalStats(jadwal, kelasList)
    };
    
  } catch (e) {
    Logger.log('Error generateJadwal: ' + e.toString());
    return { success: false, error: 'Terjadi kesalahan: ' + e.toString() };
  }
}

/**
 * Inisialisasi struktur jadwal
 */
function initializeJadwal(kelasList) {
  const jadwal = {};
  kelasList.forEach(k => {
    jadwal[k.id] = [];
  });
  return jadwal;
}

/**
 * Dapatkan mapel untuk tingkat tertentu
 */
function getMapelUntukTingkat(mapelList, tingkat) {
  return mapelList.map(m => ({
    ...m,
    jamPerMinggu: tingkat <= 3 ? m.jamKls13 : m.jamKls46
  })).filter(m => m.jamPerMinggu > 0);
}

/**
 * Dapatkan guru kelas untuk kelas tertentu
 */
function getGuruKelasUntukKelas(guruList, kelas) {
  // Prioritaskan guru kelas
  const guruKelasList = guruList.filter(g => g.jenis === 'Guru Kelas' && g.status === 'Aktif');
  
  // Jika kelas punya guru kelas spesifik
  if (kelas.guruKelas) {
    const specificGuru = guruKelasList.find(g => g.nama === kelas.guruKelas);
    if (specificGuru) {
      return [specificGuru];
    }
  }
  
  return guruKelasList;
}

/**
 * Pilih guru untuk mapel tertentu dengan menghindari bentrok
 */
function pilihGuruUntukMapel(guruKelasList, allGuru, mapel, jamTracker, schedule, hari, jamKe) {
  // Jika mapel untuk guru kelas
  if (mapel.kategori === 'Guru Kelas') {
    // Cari guru kelas yang available
    for (const guru of guruKelasList) {
      if (jamTracker[guru.id].current >= jamTracker[guru.id].max) continue;
      
      const slotKey = `${guru.id}-${hari}-${jamKe}`;
      if (schedule[slotKey]) continue;
      
      return guru;
    }
  }
  
  // Jika mapel untuk guru mapel
  const guruMapelList = allGuru.filter(g => 
    g.jenis === 'Guru Mapel' && 
    g.status === 'Aktif' &&
    (g.mapel === mapel.nama || g.mapel === 'Semua Mapel')
  );
  
  for (const guru of guruMapelList) {
    if (jamTracker[guru.id].current >= jamTracker[guru.id].max) continue;
    
    const slotKey = `${guru.id}-${hari}-${jamKe}`;
    if (schedule[slotKey]) continue;
    
    return guru;
  }
  
  // Fallback ke guru kelas jika guru mapel tidak tersedia
  for (const guru of guruKelasList) {
    if (jamTracker[guru.id].current >= jamTracker[guru.id].max) continue;
    
    const slotKey = `${guru.id}-${hari}-${jamKe}`;
    if (schedule[slotKey]) continue;
    
    return guru;
  }
  
  return null;
}

/**
 * Simpan jadwal ke spreadsheet
 */
function simpanJadwalKeSpreadsheet(jadwal) {
  const sheet = getOrCreateSheet(CONFIG.SHEET_NAMES.HASIL);
  
  // Clear existing data (keep header)
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }
  
  const rows = [];
  const timestamp = new Date();
  
  Object.keys(jadwal).forEach(kelasId => {
    jadwal[kelasId].forEach(slot => {
      rows.push([
        Utilities.getUuid(),
        kelasId,
        slot.hari,
        slot.jamKe,
        slot.mapel,
        slot.guru,
        timestamp,
        'Aktif'
      ]);
    });
  });
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
}

/**
 * Dapatkan statistik jadwal
 */
function getJadwalStats(jadwal, kelasList) {
  let totalSlots = 0;
  const guruStats = {};
  
  Object.keys(jadwal).forEach(kelasId => {
    totalSlots += jadwal[kelasId].length;
    jadwal[kelasId].forEach(slot => {
      if (!guruStats[slot.guru]) {
        guruStats[slot.guru] = 0;
      }
      guruStats[slot.guru]++;
    });
  });
  
  return {
    totalSlots: totalSlots,
    totalKelas: kelasList.length,
    guruStats: guruStats
  };
}

// ============================================================================
// API - HASIL JADWAL
// ============================================================================

/**
 * Dapatkan jadwal yang sudah digenerate
 */
function getJadwal(kelasId = null, guruId = null) {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAMES.HASIL);
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    
    let result = data.map(row => ({
      id: row[0],
      kelas: row[1],
      hari: row[2],
      jamKe: row[3],
      mapel: row[4],
      guru: row[5],
      tanggalGenerate: row[6],
      status: row[7]
    })).filter(j => j.id && j.status === 'Aktif');
    
    // Filter jika ada parameter
    if (kelasId) {
      result = result.filter(j => j.kelas === kelasId);
    }
    
    return result;
  } catch (e) {
    Logger.log('Error getJadwal: ' + e.toString());
    return [];
  }
}

/**
 * Reset jadwal
 */
function resetJadwal() {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAMES.HASIL);
    
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }
    
    return { success: true, message: 'Jadwal berhasil direset!' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ============================================================================
// DASHBOARD & STATISTIK
// ============================================================================

/**
 * Dapatkan statistik dashboard
 */
function getDashboardStats() {
  try {
    const guruList = getGuruList();
    const kelasList = getKelasList();
    const mapelList = getMapelList();
    const jadwalList = getJadwal();
    
    // Hitung total jam guru
    let totalJamGuru = 0;
    guruList.forEach(g => {
      const jamCount = jadwalList.filter(j => j.guru === g.nama).length;
      totalJamGuru += jamCount;
    });
    
    return {
      totalGuru: guruList.length,
      totalKelas: kelasList.length,
      totalMapel: mapelList.length,
      totalJadwal: jadwalList.length,
      totalJamGuru: totalJamGuru,
      guruKelas: guruList.filter(g => g.jenis === 'Guru Kelas').length,
      guruMapel: guruList.filter(g => g.jenis === 'Guru Mapel').length
    };
  } catch (e) {
    return {
      totalGuru: 0,
      totalKelas: 0,
      totalMapel: 0,
      totalJadwal: 0,
      totalJamGuru: 0,
      guruKelas: 0,
      guruMapel: 0
    };
  }
}

// ============================================================================
// SETTINGS & AUTH
// ============================================================================

/**
 * Login admin
 */
function loginAdmin(password) {
  const storedPassword = getSetting('admin_password', CONFIG.ADMIN_PASSWORD);
  
  if (password === storedPassword) {
    return { success: true, message: 'Login berhasil!' };
  }
  
  return { success: false, error: 'Password salah!' };
}

/**
 * Dapatkan setting
 */
function getSetting(key, defaultValue = '') {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAMES.SETTINGS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        return data[i][1];
      }
    }
    
    return defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

/**
 * Update setting
 */
function updateSetting(key, value) {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAMES.SETTINGS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(value);
        return { success: true };
      }
    }
    
    // Jika tidak ada, tambahkan baru
    sheet.appendRow([key, value, '']);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Dapatkan semua settings
 */
function getAllSettings() {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAMES.SETTINGS);
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    
    const settings = {};
    data.forEach(row => {
      if (row[0]) {
        settings[row[0]] = row[1];
      }
    });
    
    return settings;
  } catch (e) {
    return {};
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Format tanggal untuk display
 */
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Health check
 */
function healthCheck() {
  return {
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
}
