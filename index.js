const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');

// ✅ توليد OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ إعداد WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// ✅ طباعة QR بالكونسول
client.on('qr', (qr) => {
  console.log('📱 امسح هيدا الـ QR لتسجيل الدخول:');
  qrcode.generate(qr, { small: true });
});

// ✅ جاهزية WhatsApp
client.on('ready', () => {
  console.log('✅ WhatsApp جاهز!');
});

client.initialize();

// ✅ إعداد Express API
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Endpoint لإرسال OTP
app.post('/send-otp', async (req, res) => {
  const phone = req.body.phone;
  if (!phone) return res.status(400).send({ status: "error", message: "Phone number missing" });

  const otp = generateOTP();
  try {
    await client.sendMessage(`${phone}@c.us`, `رمز التحقق الخاص بك هو: ${otp}`);
    console.log(`✅ OTP ${otp} انبعت لرقم ${phone}`);
    res.send({ status: "success", otp });
  } catch (e) {
    console.error(`❌ فشل الإرسال:`, e.message);
    res.status(500).send({ status: "error", message: "فشل الإرسال" });
  }
});

// ✅ شغل السيرفر على البورت 10000
const PORT = 10000;
app.listen(PORT, () => {
  console.log(`🚀 السيرفر شغّال على البورت ${PORT}`);
});
