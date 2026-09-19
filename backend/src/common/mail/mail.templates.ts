/**
 * Email Templates Module for LexiNote
 * Aligned 100% with Frontend Brand Identity:
 * - Primary Palette: #FF8BA7 (Soft Pink), #FF7096 (Primary Dark), #FFD3B6 (Peach), #33272A (Text)
 * - Typography & Layout: Playful, clean, responsive HTML email design matching LexiNote frontend.
 */

export const renderBaseTemplate = (contentHtml: string): string => {
  const currentYear = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LexiNote Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FFF9F0; font-family: 'Fredoka', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #33272A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FFF9F0; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(255, 139, 167, 0.15), 0 8px 10px -6px rgba(51, 39, 42, 0.05); border: 2px solid #FFE4EC;">
          
          <!-- Frontend Brand Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF8BA7 0%, #FF7096 100%); padding: 32px 40px; text-align: center;">
              <div style="font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
                <span style="font-size: 30px;">📖</span> <span style="font-family: 'Fredoka', Arial, sans-serif;">LexiNote</span>
              </div>
              <div style="color: #FFF0F4; font-size: 13px; margin-top: 6px; font-weight: 500; letter-spacing: 0.5px;">
                HỆ THỐNG HỌC TỪ VỰNG THÔNG MINH
              </div>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px 40px; background-color: #ffffff;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FFFDF9; padding: 24px 40px; text-align: center; border-top: 1px solid #FFE8EE;">
              <p style="margin: 0; font-size: 13px; color: #594A4E; line-height: 1.6;">
                Email này được gửi tự động từ <strong>LexiNote App</strong>.<br>
                Vui lòng không trả lời trực tiếp email này.
              </p>
              <div style="margin-top: 12px; font-size: 12px; color: #A08C90;">
                © ${currentYear} LexiNote. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Account Verification Email Template
 */
export const renderVerificationEmailTemplate = (fullName: string, verificationCode: string): string => {
  const content = `
    <h2 style="margin: 0 0 16px; color: #33272A; font-size: 22px; font-weight: 700;">Chào mừng bạn đến với LexiNote, ${fullName}! 🌸</h2>
    <p style="color: #594A4E; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
      Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất kích hoạt tài khoản của bạn, vui lòng nhập mã xác nhận 6 chữ số dưới đây:
    </p>
    
    <div style="background: linear-gradient(180deg, #FFF0F4 0%, #FFE4EC 100%); border: 2px dashed #FF8BA7; border-radius: 16px; padding: 22px; text-align: center; margin: 24px 0;">
      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #D64567; letter-spacing: 1.5px; margin-bottom: 8px;">MÃ XÁC THỰC CỦA BẠN</div>
      <div style="font-size: 38px; font-weight: 800; color: #C23355; letter-spacing: 10px; font-family: monospace;">${verificationCode}</div>
      <div style="font-size: 12px; color: #D64567; margin-top: 8px; font-weight: 600;">⏱️ Mã có hiệu lực trong 30 phút</div>
    </div>

    <p style="color: #7A696D; font-size: 13px; line-height: 1.5; margin-top: 24px; border-left: 3px solid #FFD3B6; padding-left: 12px;">
      Nếu bạn không thực hiện đăng ký tài khoản này, vui lòng bỏ qua email. Tài khoản của bạn luôn được bảo vệ an toàn.
    </p>
  `;
  return renderBaseTemplate(content);
};

/**
 * Forgot Password Email Template
 */
export const renderForgotPasswordTemplate = (fullName: string, resetCode: string): string => {
  const content = `
    <h2 style="margin: 0 0 16px; color: #33272A; font-size: 22px; font-weight: 700;">Yêu cầu đặt lại mật khẩu 🔑</h2>
    <p style="color: #594A4E; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
      Xin chào <strong>${fullName}</strong>,<br>
      Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản LexiNote của bạn. Mã xác thực đặt lại mật khẩu của bạn là:
    </p>
    
    <div style="background: linear-gradient(180deg, #FFF5F0 0%, #FFE8DE 100%); border: 2px dashed #FF7096; border-radius: 16px; padding: 22px; text-align: center; margin: 24px 0;">
      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #D64567; letter-spacing: 1.5px; margin-bottom: 8px;">MÃ KHÔI PHỤC MẬT KHẨU</div>
      <div style="font-size: 38px; font-weight: 800; color: #C23355; letter-spacing: 10px; font-family: monospace;">${resetCode}</div>
      <div style="font-size: 12px; color: #D64567; margin-top: 8px; font-weight: 600;">⏱️ Mã có hiệu lực trong 15 phút</div>
    </div>

    <p style="color: #7A696D; font-size: 13px; line-height: 1.5; margin-top: 24px; border-left: 3px solid #FF8BA7; padding-left: 12px;">
      Nếu bạn không yêu cầu mã này, vui lòng không chia sẻ mã cho bất kỳ ai. Tài khoản của bạn vẫn hoàn toàn an toàn.
    </p>
  `;
  return renderBaseTemplate(content);
};

/**
 * Admin Password Reset Notification Template
 */
export const renderAdminPasswordResetTemplate = (fullName: string, newDefaultPassword: string): string => {
  const content = `
    <h2 style="margin: 0 0 16px; color: #33272A; font-size: 22px; font-weight: 700;">Thông báo Đặt lại Mật khẩu từ Quản trị viên 🛡️</h2>
    <p style="color: #594A4E; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
      Xin chào <strong>${fullName}</strong>,<br>
      Quản trị viên hệ thống đã hỗ trợ cấp lại mật khẩu cho tài khoản LexiNote của bạn. Mật khẩu đăng nhập mặc định tạm thời là:
    </p>
    
    <div style="background: linear-gradient(180deg, #FFF0F4 0%, #FFE4EC 100%); border: 2px dashed #FF7096; border-radius: 16px; padding: 22px; text-align: center; margin: 24px 0;">
      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #D64567; letter-spacing: 1.5px; margin-bottom: 8px;">MẬT KHẨU MẶC ĐỊNH MỚI</div>
      <div style="font-size: 34px; font-weight: 800; color: #C23355; letter-spacing: 6px; font-family: monospace;">${newDefaultPassword}</div>
    </div>

    <div style="background-color: #FFF5E6; border: 1.5px solid #FFD3B6; border-radius: 12px; padding: 14px 16px; color: #8A4F2A; font-size: 13px; font-weight: 600; margin-top: 20px;">
      ⚠️ <strong>Khuyến nghị an toàn:</strong> Vui lòng đăng nhập ngay và đổi lại mật khẩu cá nhân trong phần Cài đặt tài khoản. Tất cả phiên đăng nhập cũ đã được đăng xuất an toàn.
    </div>
  `;
  return renderBaseTemplate(content);
};
