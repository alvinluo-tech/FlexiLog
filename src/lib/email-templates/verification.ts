import { getEmailLayout } from './layout'

export function getVerificationEmailHtml(verifyUrl: string) {
  const content = `
    <h2>验证你的邮箱</h2>
    <p>感谢注册 FlexiLog！请点击下方按钮验证你的邮箱地址，开始你的健身之旅。</p>
    
    <a href="${verifyUrl}" class="button">验证邮箱</a>
    
    <div class="link-box">
      <div class="link-box-label">如果按钮无法点击，请复制以下链接：</div>
      <a href="${verifyUrl}">${verifyUrl}</a>
    </div>

    <div class="divider"></div>

    <div class="info-box">
      <p>💡 验证完成后，你将可以使用所有 FlexiLog 功能，包括 AI 训练计划生成。</p>
    </div>
  `
  
  return getEmailLayout(content)
}
