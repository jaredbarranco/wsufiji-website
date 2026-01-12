export const ConfirmationEmail = ({ userName, applicationUrl }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Scholarship Application Confirmation - Phi Gamma Delta</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8f9fa;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
          background: #4a05a8;
          color: white;
          padding: 30px 40px;
          text-align: center;
        }
        .header h1 {
          font-family: 'Playfair Display', 'Merriweather', serif;
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          color: white;
        }
        .content {
          padding: 40px;
        }
        .success-message {
          background: #d4edda;
          color: #155724;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          border: 1px solid #c3e6cb;
          text-align: center;
        }
        .success-message h2 {
          font-family: 'Playfair Display', 'Merriweather', serif;
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 10px 0;
          color: #155724;
        }
        .content p {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 20px;
          color: #555;
        }
        .highlight {
          color: #4a05a8;
          font-weight: 600;
        }
        .button {
          display: inline-block;
          background: #4a05a8;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          text-align: center;
        }
        .button:hover {
          background: #663399;
        }
        .footer {
          background: #2c3e50;
          color: white;
          padding: 30px 40px;
          text-align: center;
        }
        .footer p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .footer .highlight {
          color: #C5B358;
          font-weight: 600;
        }
        @media only screen and (max-width: 600px) {
          .container {
            margin: 10px;
            border-radius: 0;
          }
          .header, .content, .footer {
            padding-left: 20px;
            padding-right: 20px;
          }
          .button {
            display: block;
            width: 100%;
            box-sizing: border-box;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Phi Gamma Delta - Pi Mu Chapter</h1>
        </div>

        <div class="content">
          <div class="success-message">
            <h2>Application Submitted Successfully!</h2>
            <p>Welcome to our review process, ${userName}!</p>
          </div>

          <p>Thank you for submitting your scholarship application to the <span class="highlight">Pi Mu Chapter</span> of Phi Gamma Delta at Washington State University.</p>

          <p>We have received your submission and our scholarship committee will review it carefully. You will be notified of the decision via email once the review process is complete.</p>

          <div style="text-align: center;">
            <a href="${applicationUrl}" class="button">View Your Application</a>
          </div>

          <p>If you have any questions about your application or the process, please don't hesitate to contact us.</p>

          <p>Best regards,<br>The Scholarship Committee<br>Pi Mu Chapter - Phi Gamma Delta</p>
        </div>

        <div class="footer">
          <p><span class="highlight">Phi Gamma Delta</span> - Building Courageous Leaders Since 1848</p>
        </div>
      </div>
    </body>
    </html>
  `;
};