import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const resend = new Resend('re_iwW7gB11_Cdy8kz6ToAWVTwq7hyu22gE3');

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // Booking endpoint
    if (path.includes('/booking') && req.method === 'POST') {
      const { checkin, checkout, guests, roomName, totalPrice, guestName, guestEmail } = await req.json();

      const data = await resend.emails.send({
        from: 'Mario Hotel <onboarding@resend.dev>',
        to: guestEmail,
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

      return new Response(
        JSON.stringify({ success: true, message: 'Booking confirmed!', data }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Contact endpoint
    if (path.includes('/contact') && req.method === 'POST') {
      const { name, email, message } = await req.json();

      const data = await resend.emails.send({
        from: 'Mario Hotel Website <onboarding@resend.dev>',
        to: 'sabrinka.k@gmail.com',
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

      return new Response(
        JSON.stringify({ success: true, message: 'Message sent!', data }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Server error', error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
