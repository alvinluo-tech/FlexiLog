export function getEmailLayout(content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          background: #0a0a0b; 
          color: #fafafa; 
          margin: 0; 
          padding: 0; 
          -webkit-font-smoothing: antialiased;
        }
        .container { 
          max-width: 480px; 
          margin: 0 auto; 
          padding: 40px 20px; 
        }
        .card { 
          background: #111113; 
          border: 1px solid rgba(255,255,255,0.08); 
          border-radius: 16px; 
          padding: 40px 32px; 
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
        }
        .logo { 
          text-align: center; 
          margin-bottom: 32px; 
        }
        .logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }
        .logo-icon svg {
          width: 24px;
          height: 24px;
          fill: white;
        }
        .logo h1 { 
          color: #3b82f6; 
          font-size: 28px; 
          margin: 0; 
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .logo p { 
          color: #71717a; 
          font-size: 14px; 
          margin-top: 4px; 
        }
        h2 { 
          font-size: 22px; 
          margin: 0 0 16px 0; 
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        p { 
          color: #a1a1aa; 
          font-size: 15px; 
          line-height: 1.6; 
          margin: 0 0 16px 0; 
        }
        .button { 
          display: block; 
          width: 100%; 
          padding: 16px 24px; 
          background: linear-gradient(135deg, #2563eb, #3b82f6); 
          color: #ffffff; 
          text-decoration: none; 
          border-radius: 10px; 
          font-weight: 600; 
          font-size: 15px;
          text-align: center; 
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .button:hover { 
          background: linear-gradient(135deg, #1d4ed8, #2563eb); 
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.4);
        }
        .button-secondary {
          display: block; 
          width: 100%; 
          padding: 14px 24px; 
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          color: #a1a1aa; 
          text-decoration: none; 
          border-radius: 10px; 
          font-weight: 500; 
          font-size: 14px;
          text-align: center; 
          box-sizing: border-box;
          margin-top: 12px;
        }
        .link-box {
          background: #18181b;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          padding: 12px 16px;
          margin-top: 20px;
          word-break: break-all;
        }
        .link-box a {
          color: #3b82f6;
          font-size: 13px;
          text-decoration: none;
        }
        .link-box-label {
          color: #52525b;
          font-size: 12px;
          margin-bottom: 8px;
        }
        .divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 24px 0;
        }
        .footer { 
          text-align: center; 
          margin-top: 32px; 
          padding-top: 24px; 
          border-top: 1px solid rgba(255,255,255,0.06); 
        }
        .footer p { 
          color: #52525b; 
          font-size: 12px; 
          line-height: 1.5;
        }
        .footer a {
          color: #71717a;
          text-decoration: none;
        }
        .code-box {
          background: #18181b;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          margin: 24px 0;
        }
        .code {
          font-size: 32px;
          font-weight: 700;
          color: #3b82f6;
          letter-spacing: 0.1em;
          font-family: 'Geist Mono', monospace;
        }
        .info-box {
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.15);
          border-radius: 10px;
          padding: 16px;
          margin: 20px 0;
        }
        .info-box p {
          color: #60a5fa;
          font-size: 13px;
          margin: 0;
        }
        .warning-box {
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.15);
          border-radius: 10px;
          padding: 16px;
          margin: 20px 0;
        }
        .warning-box p {
          color: #f59e0b;
          font-size: 13px;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h1>FlexiLog</h1>
            <p>AI 智能健身记录</p>
          </div>
          ${content}
        </div>
        <div class="footer">
          <p>© 2024 FlexiLog. All rights reserved.</p>
          <p><a href="#">隐私政策</a> · <a href="#">服务条款</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}
