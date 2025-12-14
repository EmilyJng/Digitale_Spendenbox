
// Importe
const express = require('express');
// ... weitere Importe (stripe, sqlite, jwt)

const app = express();
const PORT = 3000;

// Wichtig: CORS für die Kommunikation mit dem Angular Frontend erlauben
app.use(require('cors')({ origin: 'http://localhost:4200' })); // Angular Standard-Port
app.use(express.json()); // Body Parser

// --- Routen-Definitionen ---

// 1. Öffentliche Route (Landing Page Daten)
app.get('/api/campaigns', async (req, res) => {
    // Hier Logik, um alle aktiven Kampagnen aus der SQLite-DB abzufragen
    // z.B. SELECT name, current_amount, goal_amount, last_donor_name FROM Campaigns;
    res.json([{ name: 'Beispiel-Aktion', last_donor_name: 'Max M.' }]);
});

// 2. Geschützte Route (Muss das JWT-Token prüfen)
app.post('/api/campaigns', /* authorizeMiddleware */ async (req, res) => {
    // Logik zum Erstellen einer neuen Kampagne
});

// 3. Zahlungsroute (Stripe)
app.post('/api/donate/create-intent', async (req, res) => {
    // Hier die Stripe-Logik, wie im vorherigen Schritt beschrieben
});

// Server starten
app.listen(PORT, () => {
    console.log(`Express Server läuft mit Bun auf http://localhost:${PORT}`);
});