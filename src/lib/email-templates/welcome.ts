import { getEmailLayout } from './layout'

export function getWelcomeEmailHtml(userName: string, dashboardUrl: string) {
  const content = `
    <h2>欢迎加入 FlexiLog！</h2>
    <p>Hi ${userName}，你的账号已成功验证。</p>
    
    <p>FlexiLog 是你的 AI 健身伙伴，可以帮助你：</p>
    
    <div style="margin: 20px 0; padding: 16px; background: #18181b; border-radius: 10px;">
      <p style="margin: 8px 0; color: #fafafa;">🏋️ 记录每一次训练</p>
      <p style="margin: 8px 0; color: #fafafa;">🤖 AI 生成个性化计划</p>
      <p style="margin: 8px 0; color: #fafafa;">📊 追踪你的进步</p>
      <p style="margin: 8px 0; color: #fafafa;">💪 达成健身目标</p>
    </div>
    
    <a href="${dashboardUrl}" class="button">开始训练</a>
    
    <div class="divider"></div>
    
    <p style="font-size: 13px;">建议先去「个人设置」填写你的身体参数，AI 教练会根据这些数据为你生成更精准的训练计划。</p>
  `
  
  return getEmailLayout(content)
}
