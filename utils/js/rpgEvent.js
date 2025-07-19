// rpgEvent.js
// Modul sistem event RPG Empire Yapping
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../../data/rpg_event.json');

function loadEventDB() {
    if (!fs.existsSync(dbPath)) return { events: [] };
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}
function saveEventDB(db) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function getActiveEvents() {
    const db = loadEventDB();
    return db.events.filter(e => e.active);
}
function addEvent(event) {
    const db = loadEventDB();
    db.events.push(event);
    saveEventDB(db);
}
function logEventParticipation(eventId, userId) {
    const db = loadEventDB();
    const event = db.events.find(e => e.id === eventId);
    if (!event) return false;
    event.participants = event.participants || [];
    if (!event.participants.includes(userId)) event.participants.push(userId);
    saveEventDB(db);
    return true;
}

module.exports = {
    getActiveEvents,
    addEvent,
    logEventParticipation
};
