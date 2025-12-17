const sqlite3 = require('sqlite3').verbose();

const DB_PATH = './db.sqlite';

function initializeDatabase() {
    // Öffnet die Datenbank im Read/Write Modus. 
    const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error('Fehler beim Öffnen/Verbinden der Datenbank:', err.message);
            // In einer Produktionsumgebung sollte hier der Server beendet werden
            process.exit(1); 
        }
        console.log('Datenbankverbindung erfolgreich hergestellt.');
    });
    
    return db;
}

module.exports = { 
    initializeDatabase 
};