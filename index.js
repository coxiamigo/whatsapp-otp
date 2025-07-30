const qrcode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

let currentQR = null; // لتخزين آخر QR جاهز

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
  currentQR = qr;
  qrcode.toDataURL(qr, (err, url) => {
    if (err) {
      console.error('❌ فشل توليد QR:', err);
      return;
    }
    console.log('✅ افتح هالرابط لسكان QR:\n', `http://41.253.126.246:10000/qr`);
  });
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

app.get('/qr', async (req, res) => {
  if (!currentQR) {
    return res.send("⏳ بانتظار توليد QR...");
  }

  try {
    const qrImage = await qrcode.toDataURL(currentQR);
    res.send(`
      <html><body style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column">
        <h2>امسح الكود لتسجيل الدخول</h2>
        <img src="${qrImage}" style="width:300px;height:300px" />
      </body></html>
    `);
  } catch (err) {
    res.status(500).send("❌ خطأ أثناء توليد QR");
  }
});

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

app.get('/', (req, res) => {
  res.send("✅ WhatsApp OTP Server is running");
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 السيرفر شغّال على البورت ${port}`);
});
