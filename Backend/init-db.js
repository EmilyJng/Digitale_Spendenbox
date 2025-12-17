const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Pfad zur Datenbankdatei
const DB_PATH = './db.sqlite';
// Pfad zur SQL-Schema-Datei
const SCHEMA_PATH = './db-schema.sql';

/**
 * Initialisiert die SQLite-Datenbank.
 * Erstellt die Datei, falls sie nicht existiert, und richtet die Tabellen ein.
 */
function initDatabase() {
    // Öffnet die Datenbank im Read/Write Modus. 
    // Wenn die Datei nicht existiert, wird sie erstellt.
    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Fehler beim Öffnen der Datenbank:', err.message);
            return;
        }
        console.log(`Erfolgreich mit der SQLite-Datenbank ${DB_PATH} verbunden.`);

        // Laden des SQL-Schemas
        fs.readFile(SCHEMA_PATH, 'utf8', (err, sql) => {
            if (err) {
                console.error('Fehler beim Laden des SQL-Schemas:', err.message);
                return;
            }

            // Führt alle SQL-Befehle aus der Datei aus (CREATE TABLE IF NOT EXISTS)
            db.exec(sql, (err) => {
                if (err) {
                    console.error('Fehler beim Erstellen der Datenbanktabellen:', err.message);
                } else {
                    console.log('Datenbanktabellen erfolgreich erstellt oder geprüft.');
                }
                
                // Schließt die Datenbankverbindung nach der Initialisierung
                db.close((err) => {
                    if (err) {
                        console.error('Fehler beim Schließen der Datenbank:', err.message);
                    } else {
                        console.log('Datenbankverbindung geschlossen. Initialisierung abgeschlossen.');
                    }
                });
            });
        });
    });
}

// Führen Sie die Initialisierung aus
initDatabase();