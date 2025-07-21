// Event handler untuk membantu pergantian bahasa bot
let currentLanguage = 'python';

function switchLanguage(newLang) {
    currentLanguage = newLang;
    // Bisa tambahkan logika lain, misal update config file, emit event, dsb
    console.log(`Bahasa bot diubah menjadi: ${newLang}`);
}

function getCurrentLanguage() {
    return currentLanguage;
}

module.exports = {
    switchLanguage,
    getCurrentLanguage
};
