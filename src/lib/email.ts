import { Resend } from 'resend'
import {
  getVerificationEmailHtml,
  getWelcomeEmailHtml,
  getPasswordResetEmailHtml,
  getPasswordChangedEmailHtml,
  getWeeklyReportEmailHtml,
} from './email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)
const fromEmail = process.env.RESEND_FROM_EMAIL || 'FlexiLog <noreply@mail.alvin-luo.me>'

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = getSiteUrl()
  const verifyUrl = baseUrl + '/auth/confirm?token=' + token
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: '【FlexiLog】验证你的邮箱',
      html: getVerificationEmailHtml(verifyUrl),
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return { error: 'Failed to send email' }
  }
}

export async function sendWelcomeEmail(email: string, userName: string) {
  const baseUrl = getSiteUrl()
  const dashboardUrl = baseUrl + '/dashboard'
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: '【FlexiLog】欢迎加入！',
      html: getWelcomeEmailHtml(userName, dashboardUrl),
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return { error: 'Failed to send email' }
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = getSiteUrl()
  const resetUrl = baseUrl + '/auth/reset-password?token=' + token
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: '【FlexiLog】重置密码',
      html: getPasswordResetEmailHtml(resetUrl),
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return { error: 'Failed to send email' }
  }
}

export async function sendPasswordChangedEmail(email: string) {
  const baseUrl = getSiteUrl()
  const loginUrl = baseUrl + '/login'
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: '【FlexiLog】密码已更改',
      html: getPasswordChangedEmailHtml(loginUrl),
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send password changed email:', error)
    return { error: 'Failed to send email' }
  }
}

export async function sendWeeklyReportEmail(
  email: string,
  userName: string,
  stats: {
    workouts: number
    totalVolume: number
    streak: number
    topExercise: string
  }
) {
  const baseUrl = getSiteUrl()
  const dashboardUrl = baseUrl + '/dashboard'
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: '【FlexiLog】' + userName + '的周训练报告',
      html: getWeeklyReportEmailHtml(userName, stats, dashboardUrl),
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send weekly report email:', error)
    return { error: 'Failed to send email' }
  }
}
