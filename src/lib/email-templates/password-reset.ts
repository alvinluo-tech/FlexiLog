import { getEmailLayout } from './layout'

export function getPasswordResetEmailHtml(resetUrl: string) {
  const content = `
    <h2>重置密码</h2>
    <p>我们收到了重置你密码的请求。请点击下方按钮设置新密码。</p>
    
    <a href="${resetUrl}" class="button">重置密码</a>
    
    <div class="link-box">
      <div class="link-box-label">如果按钮无法点击，请复制以下链接：</div>
      <a href="${resetUrl}">${resetUrl}</a>
    </div>

    <div class="divider"></div>

    <div class="warning-box">
      <p>⚠️ 此链接将在 1 小时后失效。如果你没有请求重置密码，请忽略此邮件，你的密码不会被更改。</p>
    </div>
  `
  
  return getEmailLayout(content)
}
