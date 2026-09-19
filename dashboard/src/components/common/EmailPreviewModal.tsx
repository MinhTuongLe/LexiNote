import React, { useState, useEffect } from 'react';
import { X, Mail, ShieldCheck, KeyRound, Lock, Send, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/Toast';
import { useLazyGetMailPreviewQuery } from '@/store/api/usersApi';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'verification' | 'forgot_password' | 'admin_reset';
  defaultRecipientName?: string;
  defaultRecipientEmail?: string;
  defaultCode?: string;
}

type TemplateType = 'verification' | 'forgot_password' | 'admin_reset';

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
                Xem Trước Email Template (Email Preview)
              </h3>
              <p className="text-xs text-muted-foreground">
                Xem trước giao diện HTML email thực tế sẽ gửi tới người dùng
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
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTemplateType('verification')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                templateType === 'verification'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              1. Xác Thực Đăng Ký
            </button>
            <button
              onClick={() => setTemplateType('forgot_password')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                templateType === 'forgot_password'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              2. Quên Mật Khẩu
            </button>
            <button
              onClick={() => setTemplateType('admin_reset')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                templateType === 'admin_reset'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              3. Admin Reset Mật Khẩu
            </button>
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
                placeholder="Mã 6 chữ số..."
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
