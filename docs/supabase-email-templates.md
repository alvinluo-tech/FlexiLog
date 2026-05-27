# FlexiLog Supabase 邮件模板

> 将以下 HTML 代码复制到 Supabase Dashboard → Authentication → Email Templates 中

---

## 1. Confirm Signup (注册确认)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0a0a0b;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#2563eb,#3b82f6);border-radius:12px;padding:12px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="white"/>
                    </svg>
                  </td>
                </tr>
              </table>
              <div style="margin-top:12px;font-size:28px;font-weight:700;color:#3b82f6;letter-spacing:-0.02em;">FlexiLog</div>
              <div style="margin-top:4px;font-size:14px;color:#71717a;">AI 智能健身记录</div>
            </td>
          </tr>
          
          <!-- Card -->
          <tr>
            <td style="background:#111113;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:40px 32px;">
              <!-- Title -->
              <div style="font-size:22px;font-weight:600;color:#fafafa;margin-bottom:16px;letter-spacing:-0.01em;">
                验证你的邮箱
              </div>
              
              <!-- Description -->
              <div style="font-size:15px;color:#a1a1aa;line-height:1.6;margin-bottom:24px;">
                感谢注册 FlexiLog！请点击下方按钮验证你的邮箱地址，开始你的健身之旅。
              </div>
              
              <!-- Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <a href="{{ .ConfirmationURL }}" style="display:block;width:100%;padding:16px 24px;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;text-align:center;box-sizing:border-box;">
                      验证邮箱
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Link Box -->
              <div style="margin-top:20px;background:#18181b;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:12px 16px;">
                <div style="color:#52525b;font-size:12px;margin-bottom:8px;">如果按钮无法点击，请复制以下链接：</div>
                <a href="{{ .ConfirmationURL }}" style="color:#3b82f6;font-size:13px;word-break:break-all;">{{ .ConfirmationURL }}</a>
              </div>
              
              <!-- Divider -->
              <div style="height:1px;background:rgba(255,255,255,0.06);margin:24px 0;"></div>
              
              <!-- Info Box -->
              <div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.15);border-radius:10px;padding:16px;">
                <div style="color:#60a5fa;font-size:13px;line-height:1.5;">
                  💡 验证完成后，你将可以使用所有 FlexiLog 功能，包括 AI 训练计划生成。
                </div>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <div style="color:#52525b;font-size:12px;line-height:1.5;">
                © 2024 FlexiLog. All rights reserved.
              </div>
              <div style="margin-top:8px;">
                <a href="#" style="color:#71717a;font-size:12px;text-decoration:none;">隐私政策</a>
                <span style="color:#52525b;font-size:12px;margin:0 8px;">·</span>
                <a href="#" style="color:#71717a;font-size:12px;text-decoration:none;">服务条款</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Reset Password (重置密码)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0a0a0b;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#2563eb,#3b82f6);border-radius:12px;padding:12px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="white"/>
                    </svg>
                  </td>
                </tr>
              </table>
              <div style="margin-top:12px;font-size:28px;font-weight:700;color:#3b82f6;letter-spacing:-0.02em;">FlexiLog</div>
              <div style="margin-top:4px;font-size:14px;color:#71717a;">AI 智能健身记录</div>
            </td>
          </tr>
          
          <!-- Card -->
          <tr>
            <td style="background:#111113;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:40px 32px;">
              <!-- Lock Icon -->
              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);border-radius:50%;padding:16px;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="#f59e0b" stroke-width="2"/>
                    <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="#f59e0b" stroke-width="2"/>
                    <circle cx="12" cy="16" r="1" fill="#f59e0b"/>
                  </svg>
                </div>
              </div>
              
              <!-- Title -->
              <div style="font-size:22px;font-weight:600;color:#fafafa;margin-bottom:16px;text-align:center;letter-spacing:-0.01em;">
                重置密码
              </div>
              
              <!-- Description -->
              <div style="font-size:15px;color:#a1a1aa;line-height:1.6;margin-bottom:24px;text-align:center;">
                我们收到了重置你密码的请求。请点击下方按钮设置新密码。
              </div>
              
              <!-- Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <a href="{{ .ConfirmationURL }}" style="display:block;width:100%;padding:16px 24px;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;text-align:center;box-sizing:border-box;">
                      重置密码
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Link Box -->
              <div style="margin-top:20px;background:#18181b;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:12px 16px;">
                <div style="color:#52525b;font-size:12px;margin-bottom:8px;">如果按钮无法点击，请复制以下链接：</div>
                <a href="{{ .ConfirmationURL }}" style="color:#3b82f6;font-size:13px;word-break:break-all;">{{ .ConfirmationURL }}</a>
              </div>
              
              <!-- Divider -->
              <div style="height:1px;background:rgba(255,255,255,0.06);margin:24px 0;"></div>
              
              <!-- Warning Box -->
              <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.15);border-radius:10px;padding:16px;">
                <div style="color:#f59e0b;font-size:13px;line-height:1.5;">
                  ⚠️ 此链接将在 1 小时后失效。如果你没有请求重置密码，请忽略此邮件，你的密码不会被更改。
                </div>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <div style="color:#52525b;font-size:12px;line-height:1.5;">
                © 2024 FlexiLog. All rights reserved.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Magic Link (魔法链接登录)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0a0a0b;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#2563eb,#3b82f6);border-radius:12px;padding:12px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="white"/>
                    </svg>
                  </td>
                </tr>
              </table>
              <div style="margin-top:12px;font-size:28px;font-weight:700;color:#3b82f6;letter-spacing:-0.02em;">FlexiLog</div>
              <div style="margin-top:4px;font-size:14px;color:#71717a;">AI 智能健身记录</div>
            </td>
          </tr>
          
          <!-- Card -->
          <tr>
            <td style="background:#111113;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:40px 32px;">
              <!-- Magic Icon -->
              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);border-radius:50%;padding:16px;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              
              <!-- Title -->
              <div style="font-size:22px;font-weight:600;color:#fafafa;margin-bottom:16px;text-align:center;letter-spacing:-0.01em;">
                登录 FlexiLog
              </div>
              
              <!-- Description -->
              <div style="font-size:15px;color:#a1a1aa;line-height:1.6;margin-bottom:24px;text-align:center;">
                点击下方按钮登录你的 FlexiLog 账号。
              </div>
              
              <!-- Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <a href="{{ .ConfirmationURL }}" style="display:block;width:100%;padding:16px 24px;background:linear-gradient(135deg,#7c3aed,#8b5cf6);color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;text-align:center;box-sizing:border-box;">
                      登录
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Link Box -->
              <div style="margin-top:20px;background:#18181b;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:12px 16px;">
                <div style="color:#52525b;font-size:12px;margin-bottom:8px;">如果按钮无法点击，请复制以下链接：</div>
                <a href="{{ .ConfirmationURL }}" style="color:#3b82f6;font-size:13px;word-break:break-all;">{{ .ConfirmationURL }}</a>
              </div>
              
              <!-- Divider -->
              <div style="height:1px;background:rgba(255,255,255,0.06);margin:24px 0;"></div>
              
              <!-- Info -->
              <div style="text-align:center;color:#52525b;font-size:12px;line-height:1.5;">
                如果你没有请求登录，请忽略此邮件。
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <div style="color:#52525b;font-size:12px;line-height:1.5;">
                © 2024 FlexiLog. All rights reserved.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 4. Email Change (邮箱变更)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0a0a0b;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#2563eb,#3b82f6);border-radius:12px;padding:12px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="white"/>
                    </svg>
                  </td>
                </tr>
              </table>
              <div style="margin-top:12px;font-size:28px;font-weight:700;color:#3b82f6;letter-spacing:-0.02em;">FlexiLog</div>
              <div style="margin-top:4px;font-size:14px;color:#71717a;">AI 智能健身记录</div>
            </td>
          </tr>
          
          <!-- Card -->
          <tr>
            <td style="background:#111113;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:40px 32px;">
              <!-- Mail Icon -->
              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);border-radius:50%;padding:16px;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="4" width="20" height="16" rx="2" stroke="#22c55e" stroke-width="2"/>
                    <path d="M22 4L12 13L2 4" stroke="#22c55e" stroke-width="2"/>
                  </svg>
                </div>
              </div>
              
              <!-- Title -->
              <div style="font-size:22px;font-weight:600;color:#fafafa;margin-bottom:16px;text-align:center;letter-spacing:-0.01em;">
                确认邮箱变更
              </div>
              
              <!-- Description -->
              <div style="font-size:15px;color:#a1a1aa;line-height:1.6;margin-bottom:24px;text-align:center;">
                你请求将 FlexiLog 账号的邮箱地址变更为：
                <div style="margin-top:12px;padding:12px;background:#18181b;border-radius:8px;color:#fafafa;font-weight:500;">
                  {{ .NewEmail }}
                </div>
              </div>
              
              <!-- Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <a href="{{ .ConfirmationURL }}" style="display:block;width:100%;padding:16px 24px;background:linear-gradient(135deg,#16a34a,#22c55e);color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;text-align:center;box-sizing:border-box;">
                      确认变更
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <div style="height:1px;background:rgba(255,255,255,0.06);margin:24px 0;"></div>
              
              <!-- Warning -->
              <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.15);border-radius:10px;padding:16px;">
                <div style="color:#f59e0b;font-size:13px;line-height:1.5;">
                  ⚠️ 如果你没有请求此变更，请忽略此邮件。你的邮箱不会被更改。
                </div>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <div style="color:#52525b;font-size:12px;line-height:1.5;">
                © 2024 FlexiLog. All rights reserved.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 配置说明

### 在 Supabase Dashboard 中设置

1. 进入 **Authentication → Email Templates**
2. 选择对应的模板类型
3. 粘贴上方的 HTML 代码
4. 保存

### Supabase 变量说明

| 变量 | 说明 |
|------|------|
| `{{ .ConfirmationURL }}` | 确认/重置链接 |
| `{{ .NewEmail }}` | 新邮箱地址（仅邮箱变更） |
| `{{ .Token }}` | 验证令牌 |
| `{{ .TokenHash }}` | 令牌哈希 |
| `{{ .SiteURL }}` | 站点 URL |
| `{{ .Email }}` | 用户邮箱 |

### 设计特点

- **暗色主题**: #0a0a0b 背景，符合 FlexiLog 品牌
- **渐变按钮**: 蓝色渐变 (#2563eb → #3b82f6)
- **圆角卡片**: 16px 圆角，微妙边框
- **信息提示框**: 蓝色/黄色/绿色不同语义
- **响应式布局**: 适配移动端
- **品牌一致性**: 统一的 FlexiLog 风格
