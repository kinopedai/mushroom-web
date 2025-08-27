import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;
  
  // 状態管理
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  // トークン検証（デモ用）
  useEffect(() => {
    if (router.isReady) {
      // デモ用：トークンが存在するかチェック
      if (!token) {
        setTokenValid(false);
      }
    }
  }, [router.isReady, token]);

  // パスワードリセット処理
  const handleResetPassword = async () => {
    try {
      // バリデーション
      if (!password || !confirmPassword) {
        alert('全ての項目を入力してください');
        return;
      }

      if (password.length < 6) {
        alert('パスワードは6文字以上で入力してください');
        return;
      }

      if (password !== confirmPassword) {
        alert('パスワードが一致しません');
        return;
      }

      setIsLoading(true);
      
      // デモ用のリセット処理
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResetComplete(true);
      
    } catch (error) {
      console.error('Password reset failed:', error);
      alert('パスワードリセットに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  // トークンが無効な場合
  if (!tokenValid) {
    return (
      <div className="app-container">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <Lock className="login-icon" style={{ color: '#dc3545' }} />
              <h1>無効なリンク</h1>
              <p>このパスワードリセットリンクは無効または期限切れです</p>
            </div>

            <div className="error-message">
              <p>パスワードリセットリンクが無効です。以下の理由が考えられます：</p>
              <ul>
                <li>リンクの有効期限が切れている</li>
                <li>既に使用済みのリンク</li>
                <li>リンクが正しくコピーされていない</li>
              </ul>
            </div>

            <div className="login-links">
              <Link href="/forgot-password" className="btn btn-primary">
                新しいリセットリンクを取得
              </Link>
              <Link href="/login" className="back-to-login-link">
                ログインページに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // リセット完了画面
  if (resetComplete) {
    return (
      <div className="app-container">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <CheckCircle className="login-icon" style={{ color: '#28a745' }} />
              <h1>パスワードリセット完了</h1>
              <p>新しいパスワードが設定されました</p>
            </div>

            <div className="reset-complete-message">
              <p>パスワードの変更が完了しました。</p>
              <p>新しいパスワードでログインしてください。</p>
            </div>

            <div className="login-links">
              <Link href="/login" className="btn btn-primary">
                ログインページへ
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
            <Lock className="login-icon" />
            <h1>新しいパスワードを設定</h1>
            <p>新しいパスワードを入力してください</p>
          </div>

          {/* パスワード設定フォーム */}
          <div className="email-login-section">
            <div className="form-group">
              <label className="form-label">
                <Lock className="form-icon" />
                新しいパスワード
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="6文字以上のパスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock className="form-icon" />
                パスワード確認
              </label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="パスワードを再入力"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              className="btn btn-primary login-submit-btn"
              onClick={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? '設定中...' : 'パスワードを設定'}
            </button>
          </div>

          <div className="login-footer">
            <p>
              パスワードは6文字以上で設定してください
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}