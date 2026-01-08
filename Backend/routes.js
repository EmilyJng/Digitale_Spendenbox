const express = require("express");
const authorize = require("./authMiddleware");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// --- Hilfsfunktion für einfache SQLite-Abfragen ---
// Da SQLite3 Callback-basiert ist, wrappen wir es in Promises für async/await
const runAsync = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
};

const getAsync = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

const allAsync = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

// ====================================================================
// 1. AUTHENTIFIZIERUNG & BENUTZER ROUTEN
// ====================================================================

// Registrierung
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "E-Mail und Passwort sind erforderlich." });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO Users (email, password_hash) VALUES (?, ?)";
    await runAsync(req.db, sql, [email, hash]);

    res.status(201).json({ message: "Benutzer erfolgreich registriert." });
  } catch (err) {
    // SQLite Fehlercode 19 ist UNIQUE Constraint Failed
    if (err.errno === 19) {
      return res
        .status(409)
        .json({ message: "Diese E-Mail-Adresse wird bereits verwendet." });
    }
    console.log(err);
    res
      .status(500)
      .json({ message: "Interner Serverfehler bei der Registrierung." });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await getAsync(
      req.db,
      "SELECT id, password_hash FROM Users WHERE email = ?",
      [email]
    );

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res
        .status(401)
        .json({ message: "Ungültige Anmeldeinformationen." });
    }

    // Erstellt JWT-Token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, userId: user.id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Interner Serverfehler beim Login." });
  }
});

// ====================================================================
// 2. KAMPAGNEN ROUTEN
// ====================================================================

// Landing Page: Alle aktiven Kampagnen abrufen (Öffentlich)
router.get("/campaigns", async (req, res) => {
  try {
    const sql = `
            SELECT id, name, description, goal_amount, current_amount, image_url, end_date
            FROM Campaigns
            WHERE is_active = 1
            ORDER BY created_at DESC
        `;
    const campaigns = await allAsync(req.db, sql);

    // Fügt den Namen des letzten Spenders hinzu (könnte in der Kampagnen-Tabelle gespeichert werden)
    // Alternative: Letzte Spende aus der Donations-Tabelle abrufen
    for (const campaign of campaigns) {
      const lastDonor = await getAsync(
        req.db,
        'SELECT donor_name FROM Donations WHERE campaign_id = ? AND payment_status = "succeeded" ORDER BY created_at DESC LIMIT 1',
        [campaign.id]
      );
      campaign.last_donor_name = lastDonor
        ? lastDonor.donor_name
        : "Noch keine Spende";

      const donorAmount = await getAsync(
        req.db,
        'SELECT amount FROM Donations WHERE campaign_id = ? AND payment_status = "succeeded" ORDER BY created_at DESC LIMIT 1',
        [campaign.id]
      );
      campaign.last_donor_amount = donorAmount ? donorAmount.amount : 0;
    }

    res.json(campaigns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Abrufen der Kampagnen." });
  }
});

// Eigene Spendenaktion erstellen (Geschützt durch authorize Middleware)
router.post("/campaigns", authorize, async (req, res) => {
  const {
    name,
    goal_amount,
    target_payment_id,
    image_url,
    description,
    end_date,
  } = req.body;
  const userId = req.userId; // Aus dem JWT-Token

  if (!name || !goal_amount || !target_payment_id || !end_date) {
    return res.status(400).json({
      message:
        "Name, Zielbetrag, Bankkonto (Ziel-ID) und Enddatum sind erforderlich.",
    });
  }

  try {
    const sql = `
            INSERT INTO Campaigns (user_id, name, goal_amount, target_payment_id, image_url, description, end_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
    const result = await runAsync(req.db, sql, [
      userId,
      name,
      goal_amount,
      target_payment_id,
      image_url,
      description,
      end_date,
    ]);

    res.status(201).json({
      message: "Aktion erfolgreich erstellt.",
      campaignId: result.lastID,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Erstellen der Kampagne." });
  }
});

// ====================================================================
// 3. ZAHLUNGS-ROUTEN (STRIPE)
// ====================================================================

// API-Endpunkt, der den Payment Intent für das Frontend erstellt
router.post("/donate/create-intent", async (req, res) => {
  const { amount, campaignId } = req.body;

  if (amount < 0.5 || !campaignId) {
    return res
      .status(400)
      .json({ message: "Ungültiger Betrag oder Kampagnen-ID." });
  }

  try {
    // Holen Sie die Ziel-ID (z.B. Stripe Connected Account ID)
    // const campaign = await getAsync(req.db, 'SELECT target_payment_id FROM Campaigns WHERE id = ?', [campaignId]);
    // if (!campaign) {
    //      return res.status(404).json({ message: 'Kampagne nicht gefunden.' });
    // }

    // Erstellt den Payment Intent über Stripe (Betrag in Cent)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "eur",
      // WICHTIG: Wenn Sie Stripe Connect verwenden, um Geld an den Kampagnenersteller
      // zu senden, muss dies hier konfiguriert werden (z.B. transfer_data.destination).
      // Für ein einfaches Setup wird das Geld auf Ihrem Hauptkonto verbucht.
      metadata: { campaign_id: campaignId },
    });

    // Gibt den geheimen Client-Schlüssel an das Frontend zurück
    res.status(200).send({ clientSecret: paymentIntent.client_secret });
  } catch (e) {
    console.error("Stripe Fehler:", e.message);
    res.status(500).send({ error: e.message });
  }
});

// ====================================================================
// 4. STRIPE WEBHOOK (Empfängt Zahlungsbestätigungen)
// ====================================================================

// WICHTIG: Dieser Endpunkt muss den RAW Body erhalten (kein express.json() verwenden)
router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const payload = req.body;
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      // Überprüft die Signatur des Webhooks, um sicherzustellen, dass er von Stripe kommt
      event = stripe.webhooks.constructEvent(
        payload,
        sig,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Verarbeitet das Ereignis
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const campaignId = paymentIntent.metadata.campaign_id;
      const amount = paymentIntent.amount / 100; // Zurück in Euro
      const donorName = paymentIntent.shipping?.name || "Anonym"; // Wenn Name verfügbar

      console.log(
        `Zahlung erfolgreich für Campaign ID: ${campaignId}, Betrag: ${amount}`
      );

      try {
        // 1. Spende in der Donations-Tabelle protokollieren
        const insertSql = `
                INSERT INTO Donations (campaign_id, amount, donor_name, payment_intent_id, payment_status)
                VALUES (?, ?, ?, ?, 'succeeded')
            `;
        await runAsync(req.db, insertSql, [
          campaignId,
          amount,
          donorName,
          paymentIntent.id,
        ]);

        // 2. Kampagnenzähler aktualisieren und letzten Spender festlegen
        const updateSql = `
                UPDATE Campaigns
                SET current_amount = current_amount + ?,
                    last_donor_name = ?
                WHERE id = ?
            `;
        await runAsync(req.db, updateSql, [amount, donorName, campaignId]);
      } catch (dbErr) {
        console.error("Datenbankfehler bei der Webhook-Verarbeitung:", dbErr);
        // Hier müssten Sie eine Benachrichtigung senden, dass eine manuelle Korrektur erforderlich ist
        return res.status(500).send("Datenbankfehler");
      }
    }

    // Antwortet an Stripe, dass das Ereignis erfolgreich empfangen wurde
    res.json({ received: true });
  }
);

// ====================================================================
// 5. STRIPE ACCOUNT ERSTELLEN
// ====================================================================

router.post("/create-stripe-account", authorize, async (req, res) => {
  // 1. Stripe Account erstellen/abrufen
  const user = await getAsync(
    req.db,
    "SELECT stripe_account_id FROM Users WHERE id = ?",
    [req.userId]
  );
  let accountId = user.stripe_account_id;

  if (!accountId) {
    // Erstellung eines Express-Accounts. 'country' ist obligatorisch.
    const account = await stripe.accounts.create({
      type: "express",
      country: "DE", // Muss das Land des Benutzers sein
      email: user.email,
      capabilities: {
        // Ermöglicht das Empfangen von Zahlungen per Karte
        card_payments: { requested: true },
        // Ermöglicht Auszahlungen auf das Bankkonto
        transfers: { requested: true },
      },
    });
    accountId = account.id;

    // 2. Account ID in Ihrer DB speichern
    await runAsync(
      req.db,
      "UPDATE Users SET stripe_account_id = ? WHERE id = ?",
      [accountId, req.userId]
    );
  }

  // 3. Erstellung des Onboarding-Links
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.FRONTEND_URL}/create-campaign`, // Wenn der Link abgelaufen ist
    return_url: `${process.env.FRONTEND_URL}/campaign-success`, // Nach erfolgreichem Onboarding
    type: "account_onboarding",
  });

  // 4. Weiterleitung an das Frontend senden
  res.json({ url: accountLink.url });
});

router.post("/donate/confirm", async (req, res) => {
  const payload = req.body;
  const { amount, campaignId, name, paymentIntentId } = payload;

  const insertSql = `
          INSERT INTO Donations (campaign_id, amount, donor_name, payment_intent_id, payment_status)
          VALUES (?, ?, ?, ?, 'succeeded')
      `;

  const updateSql = `
          UPDATE Campaigns
          SET current_amount = current_amount + ?
          WHERE id = ?
      `;
  await runAsync(req.db, insertSql, [
    campaignId,
    amount,
    name,
    paymentIntentId,
  ]);
  await runAsync(req.db, updateSql, [amount, campaignId]);
  res.status(200).json({ message: "Donation confirmed" });
});

// ====================================================================
// 6. Kontaktformular ROUTE/ Logging
// ====================================================================

router.post("/contactform/message", async (req, res) => {
  const { name, email, subject, message } = req.body;
  console.log("Kontaktformular Nachricht erhalten:", {
    name,
    email,
    subject,
    message,
  });
});

module.exports = router;
