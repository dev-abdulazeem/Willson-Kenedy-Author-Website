const pool = require('../config/db');

let brevoClient = null;

// Brevo v5 uses BrevoClient, not TransactionalEmailsApi
try {
  const { BrevoClient } = require('@getbrevo/brevo');
  
  if (process.env.BREVO_API_KEY) {
    brevoClient = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY
    });
    console.log('✅ Brevo v5 client initialized');
  } else {
    console.warn('⚠️ BREVO_API_KEY not set in .env');
  }
} catch (err) {
  console.error('❌ Brevo v5 load error:', err.message);
}

const sendNewBookEmail = async (subscriberEmail, book) => {
  if (!brevoClient || !process.env.BREVO_API_KEY) {
    console.log(`[EMAIL DISABLED] Would send to ${subscriberEmail}`);
    return true;
  }

  const bookUrl = `https://your-frontend-url.vercel.app/books/${book.slug}`;
  
  try {
    await brevoClient.sendTransacEmail({
      to: [{ email: subscriberEmail }],
      sender: { 
        email: process.env.FROM_EMAIL || 'hello@willsonkenedy.com', 
        name: process.env.FROM_NAME || 'Willson Kenedy' 
      },
      subject: `New Release: ${book.title} by Willson Kenedy`,
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Georgia, serif; background: #f5f5f0; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #fafaf8; }
            .header { background: #1a1a2e; padding: 40px; text-align: center; }
            .header h1 { color: #f5f5f0; font-size: 28px; margin: 0; }
            .header p { color: #c4704b; margin: 10px 0 0; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; }
            .content { padding: 40px; }
            .book-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
            .book-image { width: 100%; height: 350px; object-fit: cover; display: block; }
            .book-details { padding: 35px; }
            .genre { color: #c4704b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
            .title { font-size: 28px; color: #1a1a2e; margin: 0 0 15px; }
            .synopsis { color: #555; line-height: 1.7; margin-bottom: 25px; }
            .price { font-size: 22px; color: #d4af37; font-weight: bold; margin-bottom: 25px; }
            .cta-button { display: inline-block; background: #c4704b; color: white; padding: 16px 45px; text-decoration: none; border-radius: 8px; font-weight: 600; }
            .footer { background: #1a1a2e; padding: 35px; text-align: center; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Willson Kenedy</h1>
              <p>New Release Alert</p>
            </div>
            <div class="content">
              <p style="color: #666; margin-bottom: 30px;">Dear Reader,<br><br>A new story awaits you.</p>
              <div class="book-card">
                ${book.cover_image_url ? `<img src="https://willson-kenedy-author-website.onrender.com${book.cover_image_url}" class="book-image" alt="${book.title}">` : ''}
                <div class="book-details">
                  <p class="genre">${book.genre || 'Fiction'}</p>
                  <h2 class="title">${book.title}</h2>
                  <p class="synopsis">${book.synopsis}</p>
                  ${book.price ? `<p class="price">$${book.price}</p>` : ''}
                  <a href="${book.buy_link || bookUrl}" class="cta-button">Get Your Copy →</a>
                </div>
              </div>
            </div>
            <div class="footer">
              <p>You're receiving this because you subscribed to Willson Kenedy's newsletter.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    
    console.log(`✅ Email sent to ${subscriberEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send to ${subscriberEmail}:`, error.message);
    return false;
  }
};

const sendToAllSubscribers = async (book, pool) => {
  try {
    if (!brevoClient || !process.env.BREVO_API_KEY) {
      console.log('[EMAIL DISABLED] BREVO not configured');
      return { sent: 0, failed: 0, total: 0 };
    }

    const result = await pool.query('SELECT email FROM subscribers');
    const subscribers = result.rows;

    if (subscribers.length === 0) {
      console.log('No subscribers to notify');
      return { sent: 0, failed: 0, total: 0 };
    }

    console.log(`📧 Sending to ${subscribers.length} subscribers...`);

    const batchSize = 50;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const results = await Promise.allSettled(
        batch.map(sub => sendNewBookEmail(sub.email, book))
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          sent++;
        } else {
          failed++;
        }
      });

      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`✅ Complete: ${sent} sent, ${failed} failed`);
    return { sent, failed, total: subscribers.length };
  } catch (err) {
    console.error('Failed to send emails:', err);
    throw err;
  }
};

const sendWelcomeEmail = async (subscriberEmail) => {
  if (!brevoClient || !process.env.BREVO_API_KEY) {
    console.log(`[EMAIL DISABLED] Would send welcome to ${subscriberEmail}`);
    return true;
  }

  try {
    await brevoClient.sendTransacEmail({
      to: [{ email: subscriberEmail }],
      sender: { 
        email: process.env.FROM_EMAIL || 'hello@willsonkenedy.com', 
        name: process.env.FROM_NAME || 'Willson Kenedy' 
      },
      subject: 'Welcome to Willson Kenedy\'s Newsletter',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Georgia, serif; background: #f5f5f0; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #fafaf8; }
            .header { background: #1a1a2e; padding: 40px; text-align: center; }
            .header h1 { color: #f5f5f0; font-size: 28px; margin: 0; }
            .content { padding: 40px; text-align: center; }
            .welcome { font-size: 20px; color: #1a1a2e; margin-bottom: 20px; }
            .text { color: #666; line-height: 1.7; margin-bottom: 30px; }
            .cta { display: inline-block; background: #c4704b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; }
            .footer { background: #1a1a2e; padding: 30px; text-align: center; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Willson Kenedy</h1>
            </div>
            <div class="content">
              <h2 class="welcome">Welcome to the Story</h2>
              <p class="text">Thank you for subscribing. You'll be the first to know about new releases.</p>
              <a href="https://willson-kenedy.vercel.app/books" class="cta">Explore Books</a>
            </div>
            <div class="footer">
              <p>You're receiving this because you subscribed to Willson Kenedy's newsletter.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    
    console.log(`✅ Welcome email sent to ${subscriberEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send welcome to ${subscriberEmail}:`, error.message);
    return false;
  }
};

module.exports = { sendNewBookEmail, sendToAllSubscribers, sendWelcomeEmail };