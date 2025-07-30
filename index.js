const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// ✅ توليد OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ إعداد العميل
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// ✅ طباعة QR بالـ Terminal
client.on('qr', (qr) => {
  console.log('📱 امسح هيدا الـ QR لتسجيل الدخول:');
  qrcode.generate(qr, { small: true });
});

// ✅ عند الجاهزية
client.on('ready', () => {
  console.log('✅ WhatsApp جاهز!');
});

// ✅ بدء الاتصال
client.initialize();
