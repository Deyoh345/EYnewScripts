// rpgQuest.js
// Modul manajemen quest RPG Empire Yapping
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

// Struktur quest: { id, nama, deskripsi, exp, gold, selesai: [userId] }
const QUEST_LIST = [
    { id: 1, nama: 'Penakluk Pertama', deskripsi: 'Taklukkan 1 wilayah', exp: 100, gold: 50 },
    { id: 2, nama: 'Legion Awal', deskripsi: 'Kumpulkan 20 legion', exp: 80, gold: 30 }
];

function getQuestList() {
    return QUEST_LIST;
}
function getUserQuest(userId) {
    const db = loadDB();
    return db[userId]?.quest || [];
}
function addUserQuest(userId, questId) {
    const db = loadDB();
    if (!db[userId]) return false;
    db[userId].quest = db[userId].quest || [];
    if (!db[userId].quest.includes(questId)) db[userId].quest.push(questId);
    saveDB(db);
    return true;
}
function completeQuest(userId, questId) {
    const db = loadDB();
    if (!db[userId]) return false;
    db[userId].completedQuest = db[userId].completedQuest || [];
    if (!db[userId].completedQuest.includes(questId)) db[userId].completedQuest.push(questId);
    saveDB(db);
    return true;
}

module.exports = {
    getQuestList,
    getUserQuest,
    addUserQuest,
    completeQuest
};
