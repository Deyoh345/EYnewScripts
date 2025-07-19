// rpgReward.js
// Modul sistem reward RPG Empire Yapping
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

function giveReward(userId, reward) {
    const db = loadDB();
    if (!db[userId]) return false;
    db[userId].gold = (db[userId].gold || 0) + (reward.gold || 0);
    db[userId].legion = (db[userId].legion || 0) + (reward.legion || 0);
    db[userId].exp = (db[userId].exp || 0) + (reward.exp || 0);
    saveDB(db);
    return true;
}

module.exports = {
    giveReward
};
