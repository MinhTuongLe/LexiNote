const errorTranslations: Record<string, Record<string, string>> = {
  vi: {
    'error.auth.not_admin_access': 'Bạn không có quyền truy cập vào bảng quản trị! 🚫',
    'error.auth.email_not_found': 'Email không tồn tại trong hệ thống! 📧',
    'error.auth.wrong_password': 'Mật khẩu không chính xác! ❌',
    'error.auth.account_deactivated': 'Tài khoản của bạn đã bị vô hiệu hóa! 🔒',
    'error.auth.account_inactive': 'Tài khoản chưa được kích hoạt hoặc đang bị tạm khóa! 🔒',
    'error.auth.unverified_email': 'Vui lòng xác thực email để đăng nhập! 📧',
    'error.auth.missing_fields': 'Vui lòng điền đầy đủ thông tin! 🐰',
    'error.auth.password_too_short': 'Mật khẩu phải dài ít nhất 6 ký tự! 🔑',
    'error.auth.email_exists': 'Email này đã được sử dụng! 😿',
    'error.auth.session_expired': 'Phiên đăng nhập đã hết hạn! ⏰',
    'error.auth.unauthorized': 'Không có quyền truy cập! 🚫',
    'error.word.not_found': 'Không tìm thấy từ vựng trong kho dữ liệu!',
  },
  en: {
    'error.auth.not_admin_access': 'Access denied. Administrator privileges required! 🚫',
    'error.auth.email_not_found': 'Email does not exist! 📧',
    'error.auth.wrong_password': 'Incorrect password! ❌',
    'error.auth.account_deactivated': 'Your account has been deactivated! 🔒',
    'error.auth.account_inactive': 'Account is inactive or suspended! 🔒',
    'error.auth.unverified_email': 'Please verify your email to login! 📧',
    'error.auth.missing_fields': 'Missing required fields! 🐰',
    'error.auth.password_too_short': 'Password must be at least 6 characters! 🔑',
    'error.auth.email_exists': 'E-mail already registered! 😿',
    'error.auth.session_expired': 'Session expired! ⏰',
    'error.auth.unauthorized': 'Unauthorized access! 🚫',
    'error.word.not_found': 'Word not found in repository!',
  }
};

export function getErrorMessage(err: unknown, fallback = 'An unexpected error occurred.'): string {
  if (!err) return fallback;

  let rawMessage = '';
  if (typeof err === 'string') {
    rawMessage = err;
  } else if (typeof err === 'object' && err !== null) {
    const errorObj = err as { data?: { message?: string | string[] }; message?: string };
    if (errorObj.data?.message) {
      rawMessage = Array.isArray(errorObj.data.message) ? errorObj.data.message[0] : errorObj.data.message;
    } else if (errorObj.message) {
      rawMessage = errorObj.message;
    }
  }

  if (!rawMessage) return fallback;

  let currentLang = 'vi';
  try {
    const settings = localStorage.getItem('lexi_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      if (parsed?.lang?.toLowerCase() === 'en') {
        currentLang = 'en';
      }
    }
  } catch {
    currentLang = 'vi';
  }

  const dict = errorTranslations[currentLang] || errorTranslations['vi'];
  return dict[rawMessage] || rawMessage;
}
