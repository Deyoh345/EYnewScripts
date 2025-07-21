
// conquerorPath.js
// Sistem Conqueror's Path: leveling, penaklukan wilayah, dan pengembangan militer
const fs = require('fs');
const path = require('path');
const userDbPath = path.join(__dirname, '../../../data/rpg_users.json');
const { getNamaWilayah, getWilayahUser, tambahWilayahUser, setWilayahUser } = require('./handleWilayah');

// Struktur data user: { level, exp, wilayah: [index], militer: { infantri, kavaleri, artileri }, gelar: [], alliance: null }

function loadUserDB() {
    if (!fs.existsSync(userDbPath)) return {};
    return JSON.parse(fs.readFileSync(userDbPath, 'utf8'));
}

function saveUserDB(db) {
    fs.mkdirSync(path.dirname(userDbPath), { recursive: true });
    fs.writeFileSync(userDbPath, JSON.stringify(db, null, 2));
}

// Inisialisasi data conqueror user jika belum ada
function initConqueror(userId) {
    const db = loadUserDB();
    if (!db[userId]) db[userId] = {};
    if (!db[userId].conqueror) {
        db[userId].conqueror = {
            level: 1,
            exp: 0,
            wilayah: [],
            militer: { infantri: 10, kavaleri: 0, artileri: 0 },
            gelar: [],
            alliance: null
        };
    }
    saveUserDB(db);
    return db[userId].conqueror;
}

// Hitung exp yang dibutuhkan untuk naik level
function expForLevel(level) {
    return 100 + (level - 1) * 50;
}

// Fungsi menaklukkan wilayah baru
function taklukkanWilayah(userId) {
    const db = loadUserDB();
    initConqueror(userId);
    const user = db[userId].conqueror;
    // Cari wilayah berikutnya yang belum dimiliki
    let nextWilayahIdx = user.wilayah.length;
    const wilayahBaru = getNamaWilayah(nextWilayahIdx);
    if (wilayahBaru === 'Wilayah Tak Dikenal') return { success: false, msg: 'Semua wilayah telah ditaklukkan!' };
    user.wilayah.push(nextWilayahIdx);
    // Tambah exp dan sumber daya
    const expGain = 50 + user.level * 10;
    user.exp += expGain;
    // Cek level up
    let naikLevel = false;
    while (user.exp >= expForLevel(user.level)) {
        user.exp -= expForLevel(user.level);
        user.level++;
        naikLevel = true;
    }
    // Tambah sumber daya ke user utama (opsional)
    db[userId].gold = (db[userId].gold || 0) + 20;
    db[userId].legion = (db[userId].legion || 0) + 2;
    // Update conquered wilayah utama
    db[userId].conquered = user.wilayah.length;
    saveUserDB(db);
    return {
        success: true,
        wilayah: wilayahBaru,
        expGain,
        level: user.level,
        naikLevel
    };
}

// Upgrade militer
function upgradeMiliter(userId, tipe, jumlah = 1) {
    const db = loadUserDB();
    initConqueror(userId);
    const user = db[userId].conqueror;
    if (!['infantri','kavaleri','artileri'].includes(tipe)) return false;
    user.militer[tipe] = (user.militer[tipe] || 0) + jumlah;
    saveUserDB(db);
    return true;
}

// Pilih strategi tempur
function setStrategi(userId, strategi) {
    const db = loadUserDB();
    initConqueror(userId);
    db[userId].conqueror.strategi = strategi;
    saveUserDB(db);
}

// Tambah gelar
function tambahGelar(userId, gelar) {
    const db = loadUserDB();
    initConqueror(userId);
    if (!db[userId].conqueror.gelar.includes(gelar)) db[userId].conqueror.gelar.push(gelar);
    saveUserDB(db);
}

// Gabung/membuat alliance
function setAlliance(userId, namaAlliance) {
    const db = loadUserDB();
    initConqueror(userId);
    db[userId].conqueror.alliance = namaAlliance;
    saveUserDB(db);
}

// Ambil data conqueror user
function getConquerorData(userId) {
    const db = loadUserDB();
    return db[userId] && db[userId].conqueror ? db[userId].conqueror : null;
}

module.exports = {
    initConqueror,
    taklukkanWilayah,
    upgradeMiliter,
    setStrategi,
    tambahGelar,
    setAlliance,
    getConquerorData
};
