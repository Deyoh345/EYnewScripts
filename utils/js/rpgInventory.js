// rpgInventory.js
// Modul inventory RPG Empire Yapping
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../../data/rpg_users.json');

function loadDB() {
    if (!fs.existsSync(dbPath)) return {};
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}
function saveDB(db) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function getInventory(userId) {
    const db = loadDB();
    return db[userId]?.inventory || [];
}
function addItem(userId, itemId) {
    const db = loadDB();
    if (!db[userId]) return false;
    db[userId].inventory = db[userId].inventory || [];
    db[userId].inventory.push(itemId);
    saveDB(db);
    return true;
}
function removeItem(userId, itemId) {
    const db = loadDB();
    if (!db[userId] || !db[userId].inventory) return false;
    db[userId].inventory = db[userId].inventory.filter(i => i !== itemId);
    saveDB(db);
    return true;
}

module.exports = {
    getInventory,
    addItem,
    removeItem
};
