import React, { useState } from 'react';
import { UserPlus, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

// 型定義
interface UserData {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  picture?: string;
}

export default function SignupPage() {
  const router = useRouter();
  
  // 状態管理
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 新規登録処理
  const handleSignup = async () => {
    try {
      // バリデーション
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        alert('必須項目を全て入力してください');
        return;
      }

      if (firstName.length < 1 || lastName.length < 1) {
        alert('名前を正しく入力してください');
        return;
      }

      if (!email.includes('@')) {
        alert('有効なメールアドレスを入力してください');
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

      if (phone && !/^[\d\-\+\(\)\s]+$/.test(phone)) {
        alert('電話番号の形式が正しくありません');
        return;
      }

      setIsLoading(true);
      
      // デモ用の登録処理
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const userData: UserData = {
        id: `new-user-${Date.now()}`,
        name: `${firstName} ${lastName}`,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone || undefined
      };
      
      // セッション保存
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('loginTime', Date.now().toString());
      
      alert('新規登録が完了しました！');
      router.push('/');
      
    } catch (error) {
      console.error('Signup failed:', error);
      alert('新規登録に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <UserPlus className="login-icon" />
            <h1>新規登録</h1>
            <p>アカウントを作成してキノコ狩り記録を始めましょう</p>
          </div>

          {/* 新規登録フォーム */}
          <div className="email-login-section">
            <div className="name-fields">
              <div className="form-group half-width">
                <label className="form-label">
                  <UserPlus className="form-icon" />
                  姓 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="山田"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="form-group half-width">
                <label className="form-label">
                  <UserPlus className="form-icon" />
                  名 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="太郎"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail className="form-icon" />
                メールアドレス <span className="required">*</span>
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <svg className="form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                電話番号（任意）
              </label>
              <input
                type="tel"
                className="form-input"
                placeholder="090-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock className="form-icon" />
                パスワード <span className="required">*</span>
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
                パスワード確認 <span className="required">*</span>
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
              onClick={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? '登録中...' : '新規登録'}
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
              登録することで、利用規約とプライバシーポリシーに同意したものとみなされます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}