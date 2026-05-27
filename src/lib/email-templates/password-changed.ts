import { getEmailLayout } from './layout'

export function getPasswordChangedEmailHtml(loginUrl: string) {
  const content = `
    <h2>密码已更改</h2>
    <p>你的 FlexiLog 密码已成功更改。</p>
    
    <div class="info-box">
      <p>🔐 如果这不是你本人操作，请立即联系我们。</p>
    </div>
    
    <a href="${loginUrl}" class="button">登录账号</a>
    
    <div class="divider"></div>
    
    <p style="font-size: 13px;">此次密码更改的时间：${new Date().toLocaleString('zh-CN')}</p>
  `
  
  return getEmailLayout(content)
}
