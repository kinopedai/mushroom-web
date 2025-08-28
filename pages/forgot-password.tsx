import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // 状態管理
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // パスワードリセットメール送信
  const handleSendResetEmail = async () => {
    try {
      // バリデーション
      if (!email) {
        alert('メールアドレスを入力してください');
        return;
      }

      if (!email.includes('@')) {
        alert('有効なメールアドレスを入力してください');
        return;
      }

      setIsLoading(true);
      
      // デモ用の送信処理
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEmailSent(true);
      
    } catch (error) {
      console.error('Reset email failed:', error);
      alert('メール送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  // メール送信完了画面
  if (emailSent) {
    return (
      <div className="app-container">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <CheckCircle className="login-icon" style={{ color: '#28a745' }} />
              <h1>メールを送信しました</h1>
              <p>パスワードリセット用のリンクをお送りしました</p>
            </div>

            <div className="reset-email-sent">
              <div className="sent-email-info">
                <p><strong>送信先:</strong> {email}</p>
                <p>メールが届かない場合は、迷惑メールフォルダもご確認ください。</p>
              </div>

              <div className="reset-instructions">
                <h3>次の手順:</h3>
                <ol>
                  <li>メールボックスを確認</li>
                  <li>「パスワードリセット」メールを開く</li>
                  <li>メール内のリンクをクリック</li>
                  <li>新しいパスワードを設定</li>
                </ol>
              </div>

              <button 
                className="btn btn-secondary"
                onClick={() => setEmailSent(false)}
              >
                別のメールアドレスで再送信
              </button>
            </div>

            <div className="login-links">
              <Link href="/login" className="back-to-login-link">
                <ArrowLeft size={16} />
                ログインページに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <Mail className="login-icon" />
            <h1>パスワードを忘れた場合</h1>
            <p>登録済みのメールアドレスにリセット用リンクをお送りします</p>
          </div>

          {/* メールアドレス入力フォーム */}
          <div className="email-login-section">
            <div className="form-group">
              <label className="form-label">
                <Mail className="form-icon" />
                メールアドレス
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="登録済みのメールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button 
              className="btn btn-primary login-submit-btn"
              onClick={handleSendResetEmail}
              disabled={isLoading}
            >
              {isLoading ? '送信中...' : 'リセットメールを送信'}
            </button>
          </div>

          <div className="login-links">
            <Link href="/login" className="back-to-login-link">
              <ArrowLeft size={16} />
              ログインページに戻る
            </Link>
          </div>

          <div className="login-footer">
            <p>
              メールが届かない場合は、入力したメールアドレスが正しいかご確認ください
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}