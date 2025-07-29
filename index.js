const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // ✅ أضفنا CORS

const app = express();
const port = process.env.PORT || 10000;

app.use(cors()); // ✅ تفعيل CORS لكل origins
app.use(bodyParser.json());

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('📱 امسح QR من واتساب');
});

client.on('ready', () => {
    console.log('✅ WhatsApp جاهز!');
});

client.initialize();

app.post('/send-otp', async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).send({ status: 'error', message: 'رقم الهاتف مفقود' });
    }

    const otp = generateOTP();
    const formattedPhone = `${phone}@c.us`;
    const message = `رمز التحقق الخاص بك هو: ${otp}`;

    try {
        await client.sendMessage(formattedPhone, message);
        console.log(`✅ OTP sent to ${phone}: ${otp}`);
        res.send({ status: 'success', otp });
    } catch (err) {
        console.error('❌ فشل الإرسال:', err);
        res.status(500).send({ status: 'error', message: 'فشل الإرسال' });
    }
});

app.get('/', (req, res) => {
    res.send("✅ WhatsApp OTP Server is running");
});

app.listen(port, () => {
    console.log(`🚀 السيرفر شغّال عالبورت ${port}`);
});
