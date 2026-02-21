const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    makeCacheableSignalKeyStore 
} = require("@kelvdra/baileys");
const express = require("express");
const pino = require("pino");
const readline = require("readline");

const app = express();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    // 1. Auth State setup (ye 'session' folder mein login save karega)
    const { state, saveCreds } = await useMultiFileAuthState('session');

    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false, // QR code band
        logger: pino({ level: "fatal" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"], // Important for pairing
    });

    // 2. Pairing Code Logic
    if (!sock.authState.creds.registered) {
        console.log("\n--- WhatsApp Pairing Setup ---");
        const phoneNumber = await question('Apna Number enter karein (e.g. 923001234567): ');
        
        // Thoda wait karein taake socket ready ho jaye
        await delay(3000);
        const code = await sock.requestPairingCode(phoneNumber.trim());
        
        console.log(`\n👉 Aapka Pairing Code hai: \x1b[32m${code}\x1b[0m`);
        console.log("Apne WhatsApp par jayein: Settings > Linked Devices > Link with Phone Number\n");
    }

    // 3. Connection Updates
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log("\x1b[34m✅ Bot Connect Ho Gaya! Ab API Ready Hai.\x1b[0m");
        }
        if (connection === 'close') {
            console.log("Connection khatam, dobara start ho raha hai...");
            startBot();
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // 4. CallMeBot Jaisa API Endpoint
    // Example: http://localhost:3000/send?number=923001234567&text=Hello+Bhai
    app.get("/send", async (req, res) => {
        const { number, text } = req.query;
        if (!number || !text) return res.status(400).json({ error: "Number aur Text missing hain!" });

        try {
            const jid = `${number}@s.whatsapp.net`;
            await sock.sendMessage(jid, { text: text });
            res.json({ status: "success", target: number, message: "Message Sent!" });
        } catch (err) {
            res.status(500).json({ status: "failed", error: err.message });
        }
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startBot();
});

