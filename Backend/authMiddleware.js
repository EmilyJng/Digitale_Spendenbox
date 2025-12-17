const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware, die prüft, ob ein gültiges JWT im Header vorhanden ist.
 * Wird vor allen geschützten Routen (z.B. /api/campaigns POST) verwendet.
 */
function authorize(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Autorisierungstoken fehlt.' });
    }

    // Header Format: "Bearer <token>"
    const token = authHeader.split(' ')[1]; 
    
    if (!token) {
        return res.status(401).json({ message: 'Token-Format ist ungültig (Erwarte: Bearer <token>).' });
    }

    try {
        // Überprüft und dekodiert das Token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Speichert die Benutzer-ID für die nachfolgenden Routen
        req.userId = decoded.userId; 
        next(); // Fährt mit der Route fort
    } catch (err) {
        // Token ist abgelaufen oder ungültig
        return res.status(403).json({ message: 'Ungültiges oder abgelaufenes Token.' });
    }
}

module.exports = authorize;