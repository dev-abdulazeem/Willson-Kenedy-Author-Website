const brevo = require('@getbrevo/brevo');

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const sendNewBookEmail = async (subscriberEmail, book) => {
  const bookUrl = `https://your-frontend-url.vercel.app/books/${book.slug}`;
  
  const sendSmtpEmail = {
    to: [{ email: subscriberEmail }],
    sender: { 
      email: process.env.FROM_EMAIL, 
      name: process.env.FROM_NAME 
    },
    subject: `New Release: ${book.title} by Willson Kenedy`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Georgia', 'Times New Roman', serif; background: #f5f5f0; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 0 auto; background: #fafaf8; }
          .header { background: #1a1a2e; padding: 40px; text-align: center; }
          .header h1 { color: #f5f5f0; font-size: 28px; margin: 0; font-weight: 700; }
          .header p { color: #c4704b; margin: 10px 0 0; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; }
          .content { padding: 40px; }
          .intro { color: #666; font-size: 16px; margin-bottom: 30px; line-height: 1.6; }
          .book-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .book-image { width: 100%; height: 350px; object-fit: cover; display: block; }
          .book-details { padding: 35px; }
          .genre { color: #c4704b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; font-weight: 600; }
          .title { font-size: 28px; color: #1a1a2e; margin: 0 0 15px; font-weight: 700; line-height: 1.2; }
          .synopsis { color: #555; line-height: 1.7; margin-bottom: 25px; font-size: 15px; }
          .price { font-size: 22px; color: #d4af37; font-weight: bold; margin-bottom: 25px; }
          .cta-button { display: inline-block; background: #c4704b; color: white; padding: 16px 45px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; letter-spacing: 0.5px; }
          .cta-button:hover { background: #a85d3e; }
          .divider { height: 1px; background: #e0e0e0; margin: 30px 0; }
          .footer { background: #1a1a2e; padding: 35px; text-align: center; color: #888; font-size: 12px; line-height: 1.6; }
          .footer a { color: #c4704b; text-decoration: none; }
          .footer a:hover { text-decoration: underline; }
          .social { margin: 20px 0; }
          .social a { display: inline-block; margin: 0 10px; color: #888; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Willson Kenedy</h1>
            <p>New Release Alert</p>
          </div>
          <div class="content">
            <p class="intro">Dear Reader,<br><br>A new story awaits you. I'm excited to share my latest work with you.</p>
            <div class="book-card">
              ${book.cover_image_url ? `<img src="https://willson-kenedy-author-website.onrender.com${book.cover_image_url}" class="book-image" alt="${book.title}">` : '<div style="height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999; font-size: 18px;">Willson Kenedy</div>'}
              <div class="book-details">
                <p class="genre">${book.genre || 'Fiction'}</p>
                <h2 class="title">${book.title}</h2>
                <p class="synopsis">${book.synopsis}</p>
                ${book.price ? `<p class="price">$${book.price}</p>` : ''}
                <a href="${book.buy_link || bookUrl}" class="cta-button">Get Your Copy →</a>
              </div>
            </div>
            <div class="divider"></div>
            <p style="color: #888; font-size: 13px; text-align: center;">Available now at all major retailers</p>
          </div>
          <div class="footer">
            <p>You're receiving this because you subscribed to Willson Kenedy's newsletter.</p>
            <div class="social">
              <a href="https://x.com/willsonkenedy">X</a> | 
              <a href="https://instagram.com/willsonkenedy">Instagram</a> | 
              <a href="https://willson-kenedy.vercel.app">Website</a>
            </div>
            <p><a href="#">Unsubscribe</a> | <a href="https://willson-kenedy.vercel.app">Visit Website</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Email sent to ${subscriberEmail}:`, data.messageId);
    return true;
  } catch (error) {
    console.error(`Failed to send to ${subscriberEmail}:`, error.message);
    return false;
  }
};

const sendToAllSubscribers = async (book, pool) => {
  try {
    const result = await pool.query('SELECT email FROM subscribers');
    const subscribers = result.rows;

    if (subscribers.length === 0) {
      console.log('No subscribers to notify');
      return;
    }

    console.log(`Sending new book email to ${subscribers.length} subscribers...`);

    // Brevo allows up to 100 emails per API call, but we'll do individual for tracking
    // Or use batch for efficiency
    const batchSize = 50;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const results = await Promise.allSettled(
        batch.map(sub => sendNewBookEmail(sub.email, book))
      );

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          sent++;
        } else {
          failed++;
          console.error(`Failed for ${batch[index].email}`);
        }
      });

      // Rate limiting - pause between batches
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`Email campaign complete: ${sent} sent, ${failed} failed`);
    return { sent, failed, total: subscribers.length };
  } catch (err) {
    console.error('Failed to send subscriber emails:', err);
    throw err;
  }
};

// Welcome email for new subscribers
const sendWelcomeEmail = async (subscriberEmail) => {
  const sendSmtpEmail = {
    to: [{ email: subscriberEmail }],
    sender: { 
      email: process.env.FROM_EMAIL, 
      name: process.env.FROM_NAME 
    },
    subject: 'Welcome to Willson Kenedy\'s Newsletter',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Georgia', serif; background: #f5f5f0; margin: 0; padding: 0; }
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
            <p class="text">Thank you for subscribing. You'll be the first to know about new releases, exclusive content, and behind-the-scenes updates.</p>
            <a href="https://willson-kenedy.vercel.app/books" class="cta">Explore Books</a>
          </div>
          <div class="footer">
            <p>You're receiving this because you subscribed to Willson Kenedy's newsletter.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Welcome email sent to ${subscriberEmail}`);
    return true;
  } catch (error) {
    console.error(`Failed to send welcome to ${subscriberEmail}:`, error.message);
    return false;
  }
};

module.exports = { sendNewBookEmail, sendToAllSubscribers, sendWelcomeEmail };