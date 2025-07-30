const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
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

// ✅ QR على الكونسول فقط
client.on('qr', (qr) => {
  console.log('📱 امسح هيدا الـ QR لتسجيل الدخول:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp جاهز!');
});

client.on('auth_failure', (msg) => {
  console.error('❌ فشل تسجيل الدخول:', msg);
});

client.on('disconnected', (reason) => {
  console.log('⚠️ تم فصل الاتصال:', reason);
});

client.initialize();

// ✅ Endpoint لإرسال OTP
app.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).send({ status: 'error', message: 'رقم الهاتف مفقود' });
  }

  const otp = generateOTP();
  const formattedPhone = `${phone}@c.us`;
  const message = `رمز التحقق الخاص بك هو: ${otp}`;

  try {
    if (!client.info || !client.info.wid) {
      console.error("❌ WhatsApp client not ready");
      return res.status(500).send({ status: "error", message: "واتساب غير متصل حالياً" });
    }

    await client.sendMessage(formattedPhone, message);
    console.log(`✅ OTP sent to ${phone}`);
    console.log(`🔐 OTP Code: ${otp}`);
    res.send({ status: 'success', otp });
  } catch (err) {
    console.error('❌ فشل الإرسال:', err);
    res.status(500).send({ status: 'error', message: 'فشل الإرسال' });
  }
});

// ✅ Endpoint للتأكد إنو السيرفر شغّال
app.get('/', (req, res) => {
  res.send("✅ WhatsApp OTP Server is running (QR بالكونسول فقط)");
});

// ✅ تشغيل السيرفر
app.listen(port, () => {
  console.log(`🚀 السيرفر شغّال على البورت ${port}`);
});
