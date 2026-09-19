import React, { useState, useEffect } from 'react';
import { X, Mail, ShieldCheck, KeyRound, Lock, Send, RefreshCw, UserPlus, AlertTriangle, Trash2, Award, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/Toast';
import { useLazyGetMailPreviewQuery } from '@/store/api/usersApi';

export type TemplateType =
  | 'verification'
  | 'forgot_password'
  | 'admin_reset'
  | 'welcome'
  | 'password_changed'
  | 'status_changed'
  | 'account_deleted'
  | 'role_updated'
  | 'sessions_revoked';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TemplateType;
  defaultRecipientName?: string;
  defaultRecipientEmail?: string;
  defaultCode?: string;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'admin_reset',
  defaultRecipientName = 'Nguyễn Văn A',
  defaultRecipientEmail = 'user@example.com',
  defaultCode = '123456',
}) => {
  const { toast } = useToast();
  const [templateType, setTemplateType] = useState<TemplateType>(defaultType);
  const [fullName, setFullName] = useState(defaultRecipientName);
  const [sampleCode, setSampleCode] = useState(defaultCode);
  const [htmlContent, setHtmlContent] = useState('');
  const [subject, setSubject] = useState('');

  const [triggerGetMailPreview, { isLoading }] = useLazyGetMailPreviewQuery();

  useEffect(() => {
    if (isOpen) {
      setTemplateType(defaultType);
      setFullName(defaultRecipientName || 'Nguyễn Văn A');
      setSampleCode(defaultCode || '123456');
    }
  }, [isOpen, defaultType, defaultRecipientName, defaultCode]);

  const fetchPreview = async () => {
    try {
      const res = await triggerGetMailPreview({
        type: templateType,
        fullName: fullName.trim() || 'Nguyễn Văn A',
        code: sampleCode.trim() || '123456',
      }).unwrap();
      setHtmlContent(res.html || '');
      setSubject(res.subject || '');
    } catch (error: any) {
      toast({
        title: 'Lỗi tải preview!',
        description: error?.data?.message || 'Không thể lấy HTML template.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPreview();
    }
  }, [isOpen, templateType, fullName, sampleCode]);

  if (!isOpen) return null;

  const templateTabs: { id: TemplateType; label: string; icon: any; activeClass: string }[] = [
    { id: 'verification', label: '1. Xác Thực Đăng Ký', icon: Lock, activeClass: 'bg-purple-600 text-white shadow-purple-500/20' },
    { id: 'forgot_password', label: '2. Quên Mật Khẩu', icon: KeyRound, activeClass: 'bg-rose-600 text-white shadow-rose-500/20' },
    { id: 'admin_reset', label: '3. Admin Reset Pass', icon: ShieldCheck, activeClass: 'bg-sky-600 text-white shadow-sky-500/20' },
    { id: 'welcome', label: '4. Chào Mừng User Mới', icon: UserPlus, activeClass: 'bg-emerald-600 text-white shadow-emerald-500/20' },
    { id: 'password_changed', label: '5. Cảnh Báo Đổi Pass', icon: Lock, activeClass: 'bg-amber-600 text-white shadow-amber-500/20' },
    { id: 'status_changed', label: '6. Tạm Khóa / Mở Khóa', icon: AlertTriangle, activeClass: 'bg-red-600 text-white shadow-red-500/20' },
    { id: 'account_deleted', label: '7. Xóa Tài Khoản', icon: Trash2, activeClass: 'bg-pink-700 text-white shadow-pink-500/20' },
    { id: 'role_updated', label: '8. Cập Nhật Quyền', icon: Award, activeClass: 'bg-indigo-600 text-white shadow-indigo-500/20' },
    { id: 'sessions_revoked', label: '9. Thu Hồi Session', icon: Zap, activeClass: 'bg-orange-600 text-white shadow-orange-500/20' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-background border border-border w-full max-w-[1240px] h-[92vh] max-h-[940px] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                Xem Trước Email Template (Email Preview Center)
              </h3>
              <p className="text-xs text-muted-foreground">
                Xem trước giao diện HTML email thực tế của toàn bộ 9 luồng thông báo hệ thống
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Controls */}
        <div className="p-4 border-b border-border bg-muted/10 space-y-3">
          {/* Template Selection Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {templateTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = templateType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTemplateType(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? `${tab.activeClass} shadow-md`
                      : 'bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Dynamic Sample Data Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tên người nhận mẫu</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập tên người nhận..."
                className="h-8 text-xs rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Mã OTP / Mật khẩu mẫu</label>
              <Input
                value={sampleCode}
                onChange={(e) => setSampleCode(e.target.value)}
                placeholder="Mã 6 chữ số / mật khẩu..."
                className="h-8 text-xs rounded-lg font-mono"
              />
            </div>
          </div>
        </div>

        {/* Email Client Inbox Frame Simulation */}
        <div className="flex-1 overflow-hidden bg-slate-900/5 dark:bg-slate-950 p-4 flex flex-col">
          {/* Simulated Email Header */}
          <div className="bg-background border border-border rounded-t-xl p-3 border-b border-border space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground truncate max-w-md">{subject || 'Đang tải tiêu đề...'}</span>
              <span className="text-[11px] text-muted-foreground font-mono">Chế độ Xem Trước (Preview Mode)</span>
            </div>
            <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
              <span><strong>Từ:</strong> LexiNote App &lt;no-reply@lexinote.app&gt;</span>
              <span><strong>Tới:</strong> {defaultRecipientEmail}</span>
            </div>
          </div>

          {/* Rendered HTML iFrame Container */}
          <div className="flex-1 bg-white border-x border-b border-border rounded-b-xl overflow-hidden relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : null}
            <iframe
              title="Email Template Preview"
              srcDoc={htmlContent}
              className="w-full h-full border-0"
              sandbox="allow-same-origin"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            💡 Giao diện hiển thị 100% chính xác chuẩn Responsive HTML Email trên Outlook, Gmail, Apple Mail.
          </span>
          <Button variant="outline" onClick={onClose} size="sm" className="rounded-xl">
            Đóng Xem Trước
          </Button>
        </div>

      </div>
    </div>
  );
};
