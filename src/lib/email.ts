import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const fromEmail = process.env.RESEND_FROM_EMAIL || 'FlexiLog <noreply@mail.alvin-luo.me>'

export async function sendVerificationEmail(email: string, token: string) {
  const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm?token=${token}`
  
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: '验证你的 FlexiLog 账号',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0b; color: #fafafa; margin: 0; padding: 0; }
            .container { max-width: 480px; margin: 0 auto; padding: 40px 20px; }
            .card { background: #111113; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 32px; }
            .logo { text-align: center; margin-bottom: 24px; }
            .logo h1 { color: #3b82f6; font-size: 24px; margin: 0; }
            .logo p { color: #71717a; font-size: 14px; margin-top: 4px; }
            h2 { font-size: 20px; margin: 0 0 16px 0; }
            p { color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; }
            .button { display: block; width: 100%; padding: 14px; background: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; text-align: center; box-sizing: border-box; }
            .button:hover { background: #2563eb; }
            .footer { text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); }
            .footer p { color: #52525b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="logo">
                <h1>FlexiLog</h1>
                <p>AI 健身记录</p>
              </div>
              <h2>验证你的邮箱</h2>
              <p>感谢注册 FlexiLog！请点击下方按钮验证你的邮箱地址：</p>
              <a href="${confirmUrl}" class="button">验证邮箱</a>
              <p style="font-size: 12px; color: #52525b; margin-top: 24px;">
                如果按钮无法点击，请复制以下链接到浏览器：<br>
                <a href="${confirmUrl}" style="color: #3b82f6; word-break: break-all;">${confirmUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>如果你没有注册 FlexiLog，请忽略此邮件。</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return { error: 'Failed to send email' }
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`
  
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: '重置你的 FlexiLog 密码',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0b; color: #fafafa; margin: 0; padding: 0; }
            .container { max-width: 480px; margin: 0 auto; padding: 40px 20px; }
            .card { background: #111113; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 32px; }
            .logo { text-align: center; margin-bottom: 24px; }
            .logo h1 { color: #3b82f6; font-size: 24px; margin: 0; }
            .logo p { color: #71717a; font-size: 14px; margin-top: 4px; }
            h2 { font-size: 20px; margin: 0 0 16px 0; }
            p { color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; }
            .button { display: block; width: 100%; padding: 14px; background: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; text-align: center; box-sizing: border-box; }
            .footer { text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); }
            .footer p { color: #52525b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="logo">
                <h1>FlexiLog</h1>
                <p>AI 健身记录</p>
              </div>
              <h2>重置密码</h2>
              <p>我们收到了重置你密码的请求。请点击下方按钮设置新密码：</p>
              <a href="${resetUrl}" class="button">重置密码</a>
              <p style="font-size: 12px; color: #52525b; margin-top: 24px;">
                如果你没有请求重置密码，请忽略此邮件。
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return { error: 'Failed to send email' }
  }
}
