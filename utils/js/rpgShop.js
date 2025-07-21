// rpgShop.js
// Modul shop RPG Empire Yapping
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../../data/rpg_users.json');

const SHOP_ITEMS = [
    { id: 1, nama: 'Potion', harga: 30, deskripsi: 'Memulihkan legion.' },
    { id: 2, nama: 'Banner', harga: 100, deskripsi: 'Atribut khusus untuk profil.' }
];

function loadDB() {
    if (!fs.existsSync(dbPath)) return {};
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}
function saveDB(db) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function getShopItems() {
    return SHOP_ITEMS;
}
function buyItem(userId, itemId) {
    const db = loadDB();
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!db[userId] || !item) return false;
    if ((db[userId].gold || 0) < item.harga) return false;
    db[userId].gold -= item.harga;
    db[userId].inventory = db[userId].inventory || [];
    db[userId].inventory.push(itemId);
    saveDB(db);
    return true;
}

module.exports = {
    getShopItems,
    buyItem
};
