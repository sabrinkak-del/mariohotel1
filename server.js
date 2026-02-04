const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const path = require('path');

const app = express();
const port = 3000;

// Initialize Resend with the provided API key
const resend = new Resend('re_iwW7gB11_Cdy8kz6ToAWVTwq7hyu22gE3');

// Middleware
app.use(cors({ origin: '*' })); // Allow all origins including file://
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
app.use(express.static(path.join(__dirname, '.'))); // Serve static files from current directory

// Route: Booking Endpoint
app.post('/api/booking', async (req, res) => {
    const { checkin, checkout, guests, roomName, totalPrice, guestName, guestEmail } = req.body;

    try {
        // Send Confirmation to Guest
        const data = await resend.emails.send({
            from: 'Mario Hotel <onboarding@resend.dev>',
            to: guestEmail, // Sends to the guest
            subject: `אישור הזמנה: ${roomName} במלון מריו`,
            html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px; text-align: right;">
          <h1 style="color: #D4AF37; text-align: center;">ההזמנה אושרה!</h1>
          <p>היי <strong>${guestName}</strong>,</p>
          <p>תודה שבחרת במלון מריו. אנחנו מחכים לארח אותך.</p>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top:0;">פרטי ההזמנה</h3>
            <p><strong>חדר:</strong> ${roomName}</p>
            <p><strong>צ'ק-אין:</strong> ${checkin}</p>
            <p><strong>צ'ק-אאוט:</strong> ${checkout}</p>
            <p><strong>אורחים:</strong> ${guests}</p>
            <hr style="border: 0; border-top: 1px solid #eee;">
            <p style="font-size: 1.2em; font-weight: bold;">סה"כ שולם: ₪${totalPrice.toLocaleString()}</p>
          </div>

          <p>נתראה בקרוב,</p>
          <p style="font-size: 0.9em; color: #777;">צוות מלון מריו</p>
        </div>
      `
        });

        res.status(200).json({ success: true, message: 'Booking confirmed!', data });
    } catch (error) {
        console.error('Booking Error:', error);
        res.status(500).json({ success: false, message: 'Failed to process booking (Check API limits)', error });
    }
});

// Route: Contact Endpoint
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        // Send Notification to Hotel Management
        const data = await resend.emails.send({
            from: 'Mario Hotel Website <onboarding@resend.dev>',
            to: 'sabrinka.k@gmail.com', // Admin email
            subject: `פנייה חדשה מהאתר: ${name}`,
            html: `
        <div dir="rtl" style="font-family: Arial, text-align: right;">
          <h2>מישהו יצר קשר מהאתר</h2>
          <p><strong>שם:</strong> ${name}</p>
          <p><strong>אימייל:</strong> ${email}</p>
          <p><strong>תוכן ההודעה:</strong></p>
          <blockquote style="background: #f0f0f0; padding: 10px; border-right: 4px solid #D4AF37;">
            ${message}
          </blockquote>
        </div>
      `
        });

        res.status(200).json({ success: true, message: 'Message sent!', data });
    } catch (error) {
        console.error('Contact Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message', error });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
