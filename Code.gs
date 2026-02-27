/**
 * Pembagi Jam Pelajaran SD/MI - Google Apps Script Web App
 * Sistem Pembagian Otomatis Jam Pelajaran untuk Sekolah Dasar/Madrasah Ibtidaiyah
 * 
 * CRUD Pattern Implementation
 */

// ============================================================================
// SETUP & KONFIGURASI
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
  ADMIN_PASSWORD_KEY: 'admin_password',
  DEFAULT_PASSWORD: 'admin123'
};

/**
 * Fungsi utama - Menampilkan halaman web
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Pembagi Jam Pelajaran SD/MI')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Menu custom yang muncul di Google Sheets
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🏫 Pembagi Jam Pelajaran')
    .addItem('📊 Setup Database', 'setupDatabase')
    .addItem('🌐 Info Web App', 'showWebAppDialog')
    .addToUi();
}

/**
 * Dialog untuk membuka web app
 */
function showWebAppDialog() {
  const html = HtmlService.createHtmlOutput(`
    <div style="font-family: Arial; padding: 20px;">
      <h2 style="color: #4CAF50;">Aplikasi Web Siap!</h2>
      <p>Untuk menggunakan aplikasi:</p>
      <ol>
        <li>Klik tombol <strong>Deploy</strong> di editor Apps Script</li>
        <li>Pilih <strong>New deployment</strong></li>
        <li>Pilih type <strong>Web app</strong></li>
        <li>Klik <strong>Deploy</strong></li>
        <li>Buka URL yang diberikan</li>
      </ol>
      <p><strong>Password default: admin123</strong></p>
    </div>
  `).setWidth(400).setHeight(300);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Pembagi Jam Pelajaran');
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Mendapatkan Spreadsheet aktif
 */
function getSS() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Buka Apps Script dari dalam Google Sheets (Bound Script).');
  return ss;
}

/**
 * Mendapatkan sheet by name
 */
function getSheet(name) {
  const s = getSS().getSheetByName(name);
  if (!s) throw new Error('Sheet "' + name + '" belum ada. Jalankan setupDatabase terlebih dahulu.');
  return s;
}

/**
 * Mendapatkan atau membuat sheet
 */
function getOrCreateSheet(name) {
  const ss = getSS();
  let s = ss.getSheetByName(name);
  if (!s) {
    s = ss.insertSheet(name);
  }
  return s;
}

/**
 * Generate unique ID
 */
function generateId(prefix) {
  return prefix + String(new Date().getTime()).slice(-6);
}

/**
 * Format date to Indonesian locale
 */
function formatDateID(date) {
  if (!date) return '';
  const d = new Date(date);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm');
}

// ============================================================================
// PIN MANAGEMENT (via PropertiesService)
// ============================================================================

function createPin(pinStr) {
  const pin = String(pinStr);
  if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    throw new Error('PIN harus terdiri dari tepat 6 angka.');
  }
  PropertiesService.getScriptProperties().setProperty('APP_PIN', pin);
  return 'PIN berhasil dibuat!';
}

function verifyPin(pinStr) {
  const pin = String(pinStr);
  const stored = PropertiesService.getScriptProperties().getProperty('APP_PIN');
  if (!stored) {
    // Use default password if no PIN set
    const defaultPwd = getSetting('admin_password', CONFIG.DEFAULT_PASSWORD);
    if (pin === defaultPwd) return { ok: true };
    return { ok: false, msg: 'PIN belum diatur. Gunakan password default: admin123' };
  }
  if (pin === stored) return { ok: true };
  return { ok: false, msg: 'PIN salah. Coba lagi.' };
}

function resetPin(oldPinStr, newPinStr) {
  const oldPin = String(oldPinStr);
  const newPin = String(newPinStr);
  const stored = PropertiesService.getScriptProperties().getProperty('APP_PIN');
  if (!stored) throw new Error('Belum ada PIN terdaftar.');
  if (oldPin !== stored) throw new Error('PIN lama tidak sesuai.');
  if (!newPin || newPin.length !== 6 || !/^\d{6}$/.test(newPin)) throw new Error('PIN baru harus 6 angka.');
  PropertiesService.getScriptProperties().setProperty('APP_PIN', newPin);
  return 'PIN berhasil diubah!';
}

// ============================================================================
// AUTO SETUP DATABASE
// ============================================================================

function setupDatabase() {
  const ss = getSS();
  const defs = [
    { 
      name: CONFIG.SHEET_NAMES.GURU, 
      headers: ['ID', 'Nama Guru', 'Jenis Guru', 'Mata Pelajaran', 'Maksimal Jam/Minggu', 'Status', 'Created At'],
      sampleData: [
        ['GURU001', 'Ahmad Fauzi', 'Guru Kelas', 'Semua Mapel', 24, 'Aktif', new Date()],
        ['GURU002', 'Siti Nurhaliza', 'Guru Kelas', 'Semua Mapel', 24, 'Aktif', new Date()],
        ['GURU003', 'Budi Santoso', 'Guru Mapel', 'PJOK', 18, 'Aktif', new Date()],
        ['GURU004', 'Fatimah Zahra', 'Guru Mapel', 'Bahasa Inggris', 18, 'Aktif', new Date()],
        ['GURU005', 'Umar Abdullah', 'Guru Mapel', 'PAI', 18, 'Aktif', new Date()],
        ['GURU006', 'Aisyah Putri', 'Guru Mapel', 'SBdP', 18, 'Aktif', new Date()]
      ]
    },
    { 
      name: CONFIG.SHEET_NAMES.KELAS, 
      headers: ['ID', 'Nama Kelas', 'Tingkat', 'Jumlah Jam/Hari', 'Guru Kelas', 'Status', 'Created At'],
      sampleData: generateKelasSampleData()
    },
    { 
      name: CONFIG.SHEET_NAMES.MAPEL, 
      headers: ['ID', 'Mata Pelajaran', 'Jam/Minggu (Kls 1-3)', 'Jam/Minggu (Kls 4-6)', 'Kategori', 'Warna', 'Created At'],
      sampleData: [
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
      ]
    },
    { 
      name: CONFIG.SHEET_NAMES.HASIL, 
      headers: ['ID Jadwal', 'Kelas', 'Hari', 'Jam Ke-', 'Mata Pelajaran', 'Guru', 'Tanggal Generate', 'Status'],
      sampleData: []
    },
    { 
      name: CONFIG.SHEET_NAMES.SETTINGS, 
      headers: ['Key', 'Value', 'Description'],
      sampleData: [
        ['admin_password', CONFIG.DEFAULT_PASSWORD, 'Password admin'],
        ['school_name', 'SD/MI Contoh', 'Nama Sekolah'],
        ['academic_year', '2025/2026', 'Tahun Ajaran']
      ]
    }
  ];
  
  let created = 0;
  let totalRows = 0;
  
  defs.forEach(def => {
    const sh = ss.getSheetByName(def.name);
    if (!sh) {
      const newSh = ss.insertSheet(def.name);
      newSh.appendRow(def.headers);
      newSh.getRange(1, 1, 1, def.headers.length).setFontWeight('bold').setBackground('#10b981').setFontColor('white');
      
      // Insert sample data if exists
      if (def.sampleData && def.sampleData.length > 0) {
        newSh.getRange(2, 1, def.sampleData.length, def.sampleData[0].length).setValues(def.sampleData);
        totalRows += def.sampleData.length;
      }
      created++;
    }
  });
  
  return created > 0 
    ? created + ' sheet berhasil dibuat dengan ' + totalRows + ' data sample!' 
    : 'Semua sheet sudah ada.';
}

function generateKelasSampleData() {
  const data = [];
  const kelasNames = ['A', 'B'];
  let id = 1;
  
  for (let tingkat = 1; tingkat <= 6; tingkat++) {
    for (let paralel of kelasNames) {
      data.push([
        'KLS' + String(id).padStart(3, '0'),
        'Kelas ' + tingkat + paralel,
        tingkat,
        6,
        '',
        'Aktif',
        new Date()
      ]);
      id++;
    }
  }
  return data;
}

// ============================================================================
// READ - GENERIC & SPECIFIC
// ============================================================================

/**
 * Generic get rows from sheet
 */
function getRows(sheetName) {
  const sheet = getSheet(sheetName);
  const vals = sheet.getDataRange().getValues();
  if (vals.length <= 1) return [];
  
  const headers = vals[0];
  return vals.slice(1).map((row, i) => ({
    rowIndex: i + 2,
    headers: headers,
    data: row.map(c => c instanceof Date ? Utilities.formatDate(c, Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm') : c)
  }));
}

/**
 * Get all data as object array
 */
function getAllData(sheetName) {
  try {
    const ss = getSS();
    const sheet = ss.getSheetByName(sheetName);
    
    // Jika sheet tidak ada, return empty array
    if (!sheet) {
      Logger.log('Sheet ' + sheetName + ' tidak ada');
      return [];
    }
    
    const vals = sheet.getDataRange().getValues();
    if (vals.length <= 1) return [];

    const headers = vals[0];
    return vals.slice(1).map((row, i) => {
      const obj = { rowIndex: i + 2 };
      headers.forEach((h, idx) => {
        obj[h] = row[idx] instanceof Date
          ? Utilities.formatDate(row[idx], Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm')
          : row[idx];
      });
      return obj;
    });
  } catch(e) {
    Logger.log('Error getAllData (' + sheetName + '): ' + e.toString());
    return []; // Return empty array on error
  }
}

/**
 * Get Guru list
 */
function getDataGuru() {
  try {
    const data = getAllData(CONFIG.SHEET_NAMES.GURU);
    Logger.log('getDataGuru success: ' + data.length + ' rows');
    return data;
  } catch(e) {
    Logger.log('Error getDataGuru: ' + e.toString());
    // Return empty array instead of throwing error
    return [];
  }
}

/**
 * Get Kelas list
 */
function getDataKelas() {
  try {
    const data = getAllData(CONFIG.SHEET_NAMES.KELAS);
    Logger.log('getDataKelas success: ' + data.length + ' rows');
    return data;
  } catch(e) {
    Logger.log('Error getDataKelas: ' + e.toString());
    return [];
  }
}

/**
 * Get Mapel list
 */
function getDataMapel() {
  try {
    const data = getAllData(CONFIG.SHEET_NAMES.MAPEL);
    Logger.log('getDataMapel success: ' + data.length + ' rows');
    return data;
  } catch(e) {
    Logger.log('Error getDataMapel: ' + e.toString());
    return [];
  }
}

/**
 * Get Jadwal list
 */
function getDataJadwal() {
  try {
    const data = getAllData(CONFIG.SHEET_NAMES.HASIL);
    Logger.log('getDataJadwal success: ' + data.length + ' rows');
    return data;
  } catch(e) {
    Logger.log('Error getDataJadwal: ' + e.toString());
    return [];
  }
}

// ============================================================================
// CREATE
// ============================================================================

/**
 * Simpan Guru baru
 */
function simpanGuru(f) {
  const sheet = getSheet(CONFIG.SHEET_NAMES.GURU);
  const id = f.id || generateId('GURU');
  
  sheet.appendRow([
    id,
    f.nama,
    f.jenis,
    f.mapel || 'Semua Mapel',
    Number(f.maxJam) || 24,
    f.status || 'Aktif',
    new Date()
  ]);
  
  return { success: true, message: 'Data guru berhasil disimpan!', id: id };
}

/**
 * Simpan Kelas baru
 */
function simpanKelas(f) {
  const sheet = getSheet(CONFIG.SHEET_NAMES.KELAS);
  const id = f.id || generateId('KLS');
  
  sheet.appendRow([
    id,
    f.nama,
    Number(f.tingkat),
    Number(f.jamPerHari) || 6,
    f.guruKelas || '',
    f.status || 'Aktif',
    new Date()
  ]);
  
  return { success: true, message: 'Data kelas berhasil disimpan!', id: id };
}

/**
 * Simpan Mapel baru
 */
function simpanMapel(f) {
  const sheet = getSheet(CONFIG.SHEET_NAMES.MAPEL);
  const id = f.id || generateId('MAPEL');
  
  sheet.appendRow([
    id,
    f.nama,
    Number(f.jamKls13) || 0,
    Number(f.jamKls46) || 0,
    f.kategori || 'Guru Kelas',
    f.warna || '#4CAF50',
    new Date()
  ]);
  
  return { success: true, message: 'Data mapel berhasil disimpan!', id: id };
}

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Update Guru
 */
function updateGuru(f) {
  const sheet = getSheet(CONFIG.SHEET_NAMES.GURU);
  const ri = Number(f.rowIndex);
  
  sheet.getRange(ri, 2).setValue(f.nama);
  sheet.getRange(ri, 3).setValue(f.jenis);
  sheet.getRange(ri, 4).setValue(f.mapel || 'Semua Mapel');
  sheet.getRange(ri, 5).setValue(Number(f.maxJam) || 24);
  sheet.getRange(ri, 6).setValue(f.status || 'Aktif');
  
  return { success: true, message: 'Data guru berhasil diperbarui!' };
}

/**
 * Update Kelas
 */
function updateKelas(f) {
  const sheet = getSheet(CONFIG.SHEET_NAMES.KELAS);
  const ri = Number(f.rowIndex);
  
  sheet.getRange(ri, 2).setValue(f.nama);
  sheet.getRange(ri, 3).setValue(Number(f.tingkat));
  sheet.getRange(ri, 4).setValue(Number(f.jamPerHari) || 6);
  sheet.getRange(ri, 5).setValue(f.guruKelas || '');
  sheet.getRange(ri, 6).setValue(f.status || 'Aktif');
  
  return { success: true, message: 'Data kelas berhasil diperbarui!' };
}

/**
 * Update Mapel
 */
function updateMapel(f) {
  const sheet = getSheet(CONFIG.SHEET_NAMES.MAPEL);
  const ri = Number(f.rowIndex);
  
  sheet.getRange(ri, 2).setValue(f.nama);
  sheet.getRange(ri, 3).setValue(Number(f.jamKls13) || 0);
  sheet.getRange(ri, 4).setValue(Number(f.jamKls46) || 0);
  sheet.getRange(ri, 5).setValue(f.kategori || 'Guru Kelas');
  sheet.getRange(ri, 6).setValue(f.warna || '#4CAF50');
  
  return { success: true, message: 'Data mapel berhasil diperbarui!' };
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete row by sheet name and row index
 */
function hapusData(sheetName, rowIndex) {
  const sheet = getSheet(sheetName);
  sheet.deleteRow(Number(rowIndex));
  return { success: true, message: 'Data berhasil dihapus!' };
}

function hapusGuru(rowIndex) { return hapusData(CONFIG.SHEET_NAMES.GURU, rowIndex); }
function hapusKelas(rowIndex) { return hapusData(CONFIG.SHEET_NAMES.KELAS, rowIndex); }
function hapusMapel(rowIndex) { return hapusData(CONFIG.SHEET_NAMES.MAPEL, rowIndex); }

// ============================================================================
// SETTINGS MANAGEMENT
// ============================================================================

function getSetting(key, defaultValue = '') {
  try {
    const sheet = getSheet(CONFIG.SHEET_NAMES.SETTINGS);
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

function updateSetting(key, value) {
  try {
    const sheet = getSheet(CONFIG.SHEET_NAMES.SETTINGS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(value);
        return { success: true };
      }
    }
    
    // If not found, append new
    sheet.appendRow([key, value, '']);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ============================================================================
// LOGIN & AUTH
// ============================================================================

function loginAdmin(password) {
  const storedPassword = getSetting(CONFIG.ADMIN_PASSWORD_KEY, CONFIG.DEFAULT_PASSWORD);
  
  if (password === storedPassword) {
    return { success: true, message: 'Login berhasil!' };
  }
  
  return { success: false, error: 'Password salah!' };
}

// ============================================================================
// DASHBOARD & STATISTICS
// ============================================================================

function getDashboardStats() {
  try {
    const guruList = getDataGuru();
    const kelasList = getDataKelas();
    const mapelList = getDataMapel();
    const jadwalList = getDataJadwal();
    
    let totalJamGuru = 0;
    guruList.forEach(g => {
      const jamCount = jadwalList.filter(j => j['Guru'] === g['Nama Guru']).length;
      totalJamGuru += jamCount;
    });
    
    return {
      totalGuru: guruList.length,
      totalKelas: kelasList.length,
      totalMapel: mapelList.length,
      totalJadwal: jadwalList.length,
      totalJamGuru: totalJamGuru,
      guruKelas: guruList.filter(g => g['Jenis Guru'] === 'Guru Kelas').length,
      guruMapel: guruList.filter(g => g['Jenis Guru'] === 'Guru Mapel').length
    };
  } catch (e) {
    Logger.log('Error getDashboardStats: ' + e.toString());
    return {
      totalGuru: 0, totalKelas: 0, totalMapel: 0, totalJadwal: 0,
      totalJamGuru: 0, guruKelas: 0, guruMapel: 0
    };
  }
}

// ============================================================================
// JADWAL GENERATION
// ============================================================================

function generateJadwal() {
  try {
    const guruList = getDataGuru();
    const kelasList = getDataKelas();
    const mapelList = getDataMapel();
    
    if (guruList.length === 0 || kelasList.length === 0) {
      return { 
        success: false, 
        error: 'Data guru atau kelas masih kosong. Silakan input data terlebih dahulu.' 
      };
    }
    
    // Initialize jadwal structure
    const jadwal = {};
    kelasList.forEach(k => {
      jadwal[k['ID']] = [];
    });
    
    // Track guru jam
    const guruJamTracker = {};
    guruList.forEach(g => {
      guruJamTracker[g['ID']] = { current: 0, max: g['Maksimal Jam/Minggu'] };
    });
    
    // Track guru schedule
    const guruSchedule = {};
    
    // Generate for each kelas
    kelasList.forEach(kelas => {
      const tingkat = kelas['Tingkat'];
      const jamPerHari = kelas['Jumlah Jam/Hari'] || 6;
      
      // Get mapel for this tingkat
      const mapelUntukKelas = getMapelUntukTingkat(mapelList, tingkat);
      
      // Get guru kelas
      const guruKelas = getGuruKelasUntukKelas(guruList, kelas);
      
      // Generate per hari
      CONFIG.HARI.forEach(hari => {
        for (let jamKe = 1; jamKe <= jamPerHari; jamKe++) {
          // Find available mapel
          const mapelTersedia = mapelUntukKelas.filter(m => {
            const assigned = jadwal[kelas['ID']].filter(s => s.mapel === m.nama).length;
            return assigned < m.jamPerMinggu;
          });
          
          if (mapelTersedia.length === 0) return;
          
          // Select guru
          const guru = pilihGuruUntukMapel(
            guruKelas, guruList, mapelTersedia[0], 
            guruJamTracker, guruSchedule, hari, jamKe
          );
          
          if (guru) {
            jadwal[kelas['ID']].push({
              hari: hari,
              jamKe: jamKe,
              mapel: mapelTersedia[0].nama,
              guru: guru['Nama Guru'],
              guruId: guru['ID'],
              warna: mapelTersedia[0].warna
            });
            
            guruJamTracker[guru['ID']].current++;
            const guruSlotKey = guru['ID'] + '-' + hari + '-' + jamKe;
            guruSchedule[guruSlotKey] = true;
          }
        }
      });
    });
    
    // Save to spreadsheet
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

function getMapelUntukTingkat(mapelList, tingkat) {
  return mapelList.map(m => ({
    nama: m['Mata Pelajaran'],
    jamPerMinggu: tingkat <= 3 ? m['Jam/Minggu (Kls 1-3)'] : m['Jam/Minggu (Kls 4-6)'],
    kategori: m['Kategori'],
    warna: m['Warna']
  })).filter(m => m.jamPerMinggu > 0);
}

function getGuruKelasUntukKelas(guruList, kelas) {
  const guruKelasList = guruList.filter(g => g['Jenis Guru'] === 'Guru Kelas' && g['Status'] === 'Aktif');
  
  if (kelas['Guru Kelas']) {
    const specificGuru = guruKelasList.find(g => g['Nama Guru'] === kelas['Guru Kelas']);
    if (specificGuru) return [specificGuru];
  }
  
  return guruKelasList;
}

function pilihGuruUntukMapel(guruKelasList, allGuru, mapel, jamTracker, schedule, hari, jamKe) {
  // If mapel for guru kelas
  if (mapel.kategori === 'Guru Kelas') {
    for (const guru of guruKelasList) {
      if (jamTracker[guru['ID']].current >= jamTracker[guru['ID']].max) continue;
      const slotKey = guru['ID'] + '-' + hari + '-' + jamKe;
      if (schedule[slotKey]) continue;
      return guru;
    }
  }
  
  // If mapel for guru mapel
  const guruMapelList = allGuru.filter(g => 
    g['Jenis Guru'] === 'Guru Mapel' && 
    g['Status'] === 'Aktif' &&
    (g['Mata Pelajaran'] === mapel.nama || g['Mata Pelajaran'] === 'Semua Mapel')
  );
  
  for (const guru of guruMapelList) {
    if (jamTracker[guru['ID']].current >= jamTracker[guru['ID']].max) continue;
    const slotKey = guru['ID'] + '-' + hari + '-' + jamKe;
    if (schedule[slotKey]) continue;
    return guru;
  }
  
  // Fallback to guru kelas
  for (const guru of guruKelasList) {
    if (jamTracker[guru['ID']].current >= jamTracker[guru['ID']].max) continue;
    const slotKey = guru['ID'] + '-' + hari + '-' + jamKe;
    if (schedule[slotKey]) continue;
    return guru;
  }
  
  return null;
}

function simpanJadwalKeSpreadsheet(jadwal) {
  const sheet = getSheet(CONFIG.SHEET_NAMES.HASIL);
  
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

function getJadwalStats(jadwal, kelasList) {
  let totalSlots = 0;
  const guruStats = {};
  
  Object.keys(jadwal).forEach(kelasId => {
    totalSlots += jadwal[kelasId].length;
    jadwal[kelasId].forEach(slot => {
      if (!guruStats[slot.guru]) guruStats[slot.guru] = 0;
      guruStats[slot.guru]++;
    });
  });
  
  return { totalSlots, totalKelas: kelasList.length, guruStats };
}

function resetJadwal() {
  try {
    const sheet = getSheet(CONFIG.SHEET_NAMES.HASIL);
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }
    return { success: true, message: 'Jadwal berhasil direset!' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ============================================================================
// FORCE INSERT SAMPLE DATA (for troubleshooting)
// ============================================================================

function forceInsertSampleData() {
  Logger.log('=== Starting forceInsertSampleData ===');
  const ss = getSS();
  
  // Force insert Guru
  let guruSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.GURU);
  if (!guruSheet) guruSheet = ss.insertSheet(CONFIG.SHEET_NAMES.GURU);
  if (guruSheet.getLastRow() > 0) guruSheet.clear();
  
  const guruHeaders = ['ID', 'Nama Guru', 'Jenis Guru', 'Mata Pelajaran', 'Maksimal Jam/Minggu', 'Status', 'Created At'];
  guruSheet.getRange(1, 1, 1, guruHeaders.length).setValues([guruHeaders]);
  guruSheet.getRange(1, 1, 1, guruHeaders.length).setFontWeight('bold').setBackground('#4CAF50').setFontColor('white');
  
  const guruData = [
    ['GURU001', 'Ahmad Fauzi', 'Guru Kelas', 'Semua Mapel', 24, 'Aktif', new Date()],
    ['GURU002', 'Siti Nurhaliza', 'Guru Kelas', 'Semua Mapel', 24, 'Aktif', new Date()],
    ['GURU003', 'Budi Santoso', 'Guru Mapel', 'PJOK', 18, 'Aktif', new Date()],
    ['GURU004', 'Fatimah Zahra', 'Guru Mapel', 'Bahasa Inggris', 18, 'Aktif', new Date()],
    ['GURU005', 'Umar Abdullah', 'Guru Mapel', 'PAI', 18, 'Aktif', new Date()],
    ['GURU006', 'Aisyah Putri', 'Guru Mapel', 'SBdP', 18, 'Aktif', new Date()]
  ];
  guruSheet.getRange(2, 1, guruData.length, guruData[0].length).setValues(guruData);
  Logger.log('Guru data inserted: ' + guruData.length + ' rows');
  
  // Force insert Kelas
  let kelasSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.KELAS);
  if (!kelasSheet) kelasSheet = ss.insertSheet(CONFIG.SHEET_NAMES.KELAS);
  if (kelasSheet.getLastRow() > 0) kelasSheet.clear();
  
  const kelasHeaders = ['ID', 'Nama Kelas', 'Tingkat', 'Jumlah Jam/Hari', 'Guru Kelas', 'Status', 'Created At'];
  kelasSheet.getRange(1, 1, 1, kelasHeaders.length).setValues([kelasHeaders]);
  kelasSheet.getRange(1, 1, 1, kelasHeaders.length).setFontWeight('bold').setBackground('#2196F3').setFontColor('white');
  
  const kelasData = generateKelasSampleData();
  kelasSheet.getRange(2, 1, kelasData.length, kelasData[0].length).setValues(kelasData);
  Logger.log('Kelas data inserted: ' + kelasData.length + ' rows');
  
  // Force insert Mapel
  let mapelSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MAPEL);
  if (!mapelSheet) mapelSheet = ss.insertSheet(CONFIG.SHEET_NAMES.MAPEL);
  if (mapelSheet.getLastRow() > 0) mapelSheet.clear();
  
  const mapelHeaders = ['ID', 'Mata Pelajaran', 'Jam/Minggu (Kls 1-3)', 'Jam/Minggu (Kls 4-6)', 'Kategori', 'Warna', 'Created At'];
  mapelSheet.getRange(1, 1, 1, mapelHeaders.length).setValues([mapelHeaders]);
  mapelSheet.getRange(1, 1, 1, mapelHeaders.length).setFontWeight('bold').setBackground('#9C27B0').setFontColor('white');
  
  const mapelData = [
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
  mapelSheet.getRange(2, 1, mapelData.length, mapelData[0].length).setValues(mapelData);
  Logger.log('Mapel data inserted: ' + mapelData.length + ' rows');
  
  Logger.log('=== forceInsertSampleData completed ===');
  return { 
    success: true, 
    message: 'Data sample berhasil di-insert!',
    guruCount: guruData.length,
    kelasCount: kelasData.length,
    mapelCount: mapelData.length
  };
}

/**
 * Test database connection
 */
function testDataConnection() {
  try {
    const ss = getSS();
    const sheets = ss.getSheets();
    const sheetNames = sheets.map(s => s.getName());
    
    const result = {
      spreadsheetName: ss.getName(),
      sheetNames: sheetNames,
      guruSheetExists: sheetNames.includes(CONFIG.SHEET_NAMES.GURU),
      kelasSheetExists: sheetNames.includes(CONFIG.SHEET_NAMES.KELAS),
      mapelSheetExists: sheetNames.includes(CONFIG.SHEET_NAMES.MAPEL)
    };
    
    if (result.guruSheetExists) {
      const guruSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.GURU);
      result.guruRowCount = guruSheet.getLastRow();
    }
    if (result.kelasSheetExists) {
      const kelasSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.KELAS);
      result.kelasRowCount = kelasSheet.getLastRow();
    }
    if (result.mapelSheetExists) {
      const mapelSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MAPEL);
      result.mapelRowCount = mapelSheet.getLastRow();
    }
    
    return result;
  } catch (e) {
    return { error: e.toString() };
  }
}
