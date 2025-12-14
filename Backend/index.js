
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeDatabase } = require('./database'); // Für die DB-Verbindung

// Lädt Umgebungsvariablen aus der .env-Datei (z.B. PORT, JWT_SECRET, STRIPE_SECRET_KEY)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Datenbank-Initialisierung ---
// Stellt sicher, dass die DB-Verbindung hergestellt ist, bevor der Server startet.
const db = initializeDatabase(); 

// Das DB-Objekt wird den Anfragen über req.db zugänglich gemacht (optional, aber nützlich)
app.use((req, res, next) => {
    req.db = db;
    next();
});

// --- Middleware ---

// 1. CORS-Konfiguration
// Erlaubt Anfragen vom Angular-Frontend (Standard: http://localhost:4200)
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    optionsSuccessStatus: 200 
};
app.use(cors(corsOptions));

// 2. Body Parser (WICHTIG: Webhook Body muss separat behandelt werden!)
// Normaler JSON Body Parser für alle Routen außer dem Stripe Webhook
app.use((req, res, next) => {
    if (req.originalUrl === '/api/stripe-webhook') {
        next(); // Überspringt den Body Parser für den Webhook
    } else {
        express.json()(req, res, next);
    }
});

// --- Routen-Einbindung ---
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// --- Serverstart ---

app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT} (Verwendung von Bun/Node)`);
    console.log(`Frontend erwartet unter: ${process.env.FRONTEND_URL}`);
});