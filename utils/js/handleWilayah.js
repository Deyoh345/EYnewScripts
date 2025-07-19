// handleWilayah.js
// Modul utilitas untuk mengelola wilayah kekuasaan user/fractio/collegium
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/rpg_users.json');

function loadUserDB() {
    if (!fs.existsSync(dbPath)) return {};
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function saveUserDB(db) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// Tambah wilayah ke user
function tambahWilayahUser(userId, jumlah = 1) {
    const db = loadUserDB();
    if (!db[userId]) return false;
    db[userId].conquered = (db[userId].conquered || 0) + jumlah;
    saveUserDB(db);
    return true;
}

// Kurangi wilayah user
function kurangiWilayahUser(userId, jumlah = 1) {
    const db = loadUserDB();
    if (!db[userId]) return false;
    db[userId].conquered = Math.max(0, (db[userId].conquered || 0) - jumlah);
    saveUserDB(db);
    return true;
}

// Set wilayah user
function setWilayahUser(userId, jumlah) {
    const db = loadUserDB();
    if (!db[userId]) return false;
    db[userId].conquered = Math.max(0, jumlah);
    saveUserDB(db);
    return true;
}

// Ambil jumlah wilayah user
function getWilayahUser(userId) {
    const db = loadUserDB();
    if (!db[userId]) return 0;
    return db[userId].conquered || 0;
}

// Daftar wilayah versi Empire Yapping (inspirasi Roman Empire, nama unik)
const WILAYAH_LIST = [
    'Yappingum',
    'Canisium',
    'Latium Nova',
    'Aurelia',
    'Barkonia',
    'Meowtania',
    'Pupetia',
    'Discordia',
    'Roma Yappa',
    'Imperium Vox',
    'Gallia Yappensis',
    'Britannia Woof',
    'Asia Miaw',
    'Aegyptus Meme',
    'Hispania Lata',
    'Graecia Woof',
    'Afrika Bark',
    'Germania Howl',
    'Dacia Meme',
    'Syria Yapping',
    'Armenia',
    'Illyria',
    'Numidia',
    'Mauretania',
    'Thracia',
    'Noricum',
    'Raetia',
    'Cyrenaica',
    'Cappadocia',
    'Pontus',
    'Bithynia',
    'Lusitania',
    'Sardinia',
    'Corsica',
    'Sicilia',
    'Creta',
    'Cyprus',
    'Judea',
    'Moesia',
    'Pannonia',
    'Dalmatia'
];

// Ambil 5 wilayah acak unik untuk collegium
function getWilayahCollegium(jumlah = 5) {
    // Shuffle array, ambil 5 unik
    const arr = WILAYAH_LIST.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, jumlah);
}

// Ambil nama wilayah berdasarkan index (0-based)
function getNamaWilayah(index) {
    if (index < 0 || index >= WILAYAH_LIST.length) return 'Wilayah Tak Dikenal';
    return WILAYAH_LIST[index];
}

// Ambil seluruh daftar wilayah
function getDaftarWilayah() {
    return WILAYAH_LIST.slice();
}

module.exports = {
    tambahWilayahUser,
    kurangiWilayahUser,
    setWilayahUser,
    getWilayahUser,
    getNamaWilayah,
    getDaftarWilayah,
    getWilayahCollegium
};
