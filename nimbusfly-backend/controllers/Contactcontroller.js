// in app.js (or a new file like controllers/contact.js)
const nodemailer = require('nodemailer');

async function contactUs(req, res) {
  const { email, message } = req.body;

  // 1. Simple checks
  if (!email || !message) {
    return res
      .status(400)
      .json({ success: false, message: 'Please provide both email and message.' });
  }

  try {
    // 2. Reuse your SMTP transporter
    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:  +process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 3. Send the mail to your admin address
    await transporter.sendMail({
      from:    `"Contact Form" <${process.env.SMTP_USER}>`,
      to:       [process.env.ADMIN_EMAIL,process.env.ADMIN_EMAIL2],  
      replyTo:  email,              
      subject: `New message from ${email}`,
      text: `
You have a new message from your website:

From:    ${email}

Message:
${message}
      `,
    });

    // 4. Let the client know it was sent
    res.json({ success: true, message: 'Thank you—your message has been sent!' });
  } catch (err) {
    console.error('ContactUs error:', err);
    res
      .status(500)
      .json({ success: false, message: 'Oops—could not send your message right now.' });
  }
}

module.exports = { contactUs };
