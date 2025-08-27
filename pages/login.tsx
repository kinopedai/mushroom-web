import React, { useState, useEffect } from 'react';
import { LogIn, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/router';

// 型定義
interface UserData {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface LoginState {
  isLoggedIn: boolean;
  user: UserData | null;
  loading: boolean;
}　

// 定数
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const LOGIN_TIMEOUT = 5000;
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24時間

export default function LoginPage() {
  const router = useRouter();
  
  // 状態管理
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>({
    isLoggedIn: false,
    user: null,
    loading: false
  });

  // Google認証処理
  const handleGoogleLogin = async () => {
    try {
      // Google Client IDが設定されているかチェック
      if (!GOOGLE_CLIENT_ID) {
        alert('Google認証が設定されていません。管理者にお問い合わせください。');
        return;
      }

      setIsLoading(true);
      
      if (!window.google?.accounts?.id) {
        alert('Google Sign-In APIの読み込みに失敗しました。ページを再読み込みしてください。');
        return;
      }

      await new Promise<UserData>((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: any) => {
            try {
              if (!response.credential) {
                reject(new Error('No credential received'));
                return;
              }

              // JWTデコード
              const parts = response.credential.split('.');
              if (parts.length !== 3) {
                reject(new Error('Invalid token format'));
                return;
              }

              const payload = JSON.parse(atob(parts[1]));
              const userData: UserData = {
                id: payload.sub,
                name: payload.name,
                email: payload.email,
                picture: payload.picture
              };
              
              // セッション保存
              saveUserSession(userData);
              
              setLoginState({
                isLoggedIn: true,
                user: userData,
                loading: false
              });
              
              resolve(userData);
            } catch (error) {
              reject(error);
            }
          }
        });
        
        window.google.accounts.id.prompt();
      });
      
      // ログイン成功後のリダイレクト
      setTimeout(() => {
        router.push('/');
      }, 1500);
      
    } catch (error) {
      console.error('Google login failed:', error);
      alert('Googleログインに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  // メール認証処理
  const handleEmailLogin = async () => {
    try {
      // バリデーション
      if (!email || !password) {
        alert('メールアドレスとパスワードを入力してください');
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

      setIsLoading(true);
      
      // デモ用のログイン処理
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const userData: UserData = {
        id: `email-user-${Date.now()}`,
        name: email.split('@')[0],
        email: email
      };
      
      saveUserSession(userData);
      
      setLoginState({
        isLoggedIn: true,
        user: userData,
        loading: false
      });
      
      router.push('/');
      
    } catch (error) {
      console.error('Email login failed:', error);
      alert('ログインに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  // ログアウト処理
  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('loginTime');
      
      setLoginState({
        isLoggedIn: false,
        user: null,
        loading: false
      });
      
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // パスワード忘れ処理
  const handleForgotPassword = () => {
    if (!email) {
      alert('メールアドレスを入力してから「パスワードを忘れた場合」をクリックしてください');
      return;
    }
    
    alert(`パスワードリセットメールを ${email} に送信しました。\n（デモ用：実際にはメールは送信されません）`);
  };

  // 新規登録処理
  const handleSignup = () => {
    if (!email || !password) {
      alert('新規登録には メールアドレスとパスワードを入力してください');
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

    const confirmPassword = prompt('パスワードを再入力してください:');
    if (confirmPassword !== password) {
      alert('パスワードが一致しません');
      return;
    }

    // 新規登録処理（デモ用）
    const userData: UserData = {
      id: `new-user-${Date.now()}`,
      name: email.split('@')[0],
      email: email
    };
    
    saveUserSession(userData);
    
    setLoginState({
      isLoggedIn: true,
      user: userData,
      loading: false
    });
    
    alert('新規登録が完了しました！');
    router.push('/');
  };

  // セッション保存
  const saveUserSession = (userData: UserData) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('loginTime', Date.now().toString());
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  // セッションチェック
  const checkExistingSession = () => {
    try {
      const savedUser = localStorage.getItem('user');
      const loginTime = localStorage.getItem('loginTime');
      
      if (savedUser && loginTime) {
        const userData = JSON.parse(savedUser);
        const sessionAge = Date.now() - parseInt(loginTime);
        
        if (sessionAge < SESSION_DURATION) {
          setLoginState({
            isLoggedIn: true,
            user: userData,
            loading: false
          });
        } else {
          // セッション期限切れ
          localStorage.removeItem('user');
          localStorage.removeItem('loginTime');
        }
      }
    } catch (error) {
      console.error('Failed to check session:', error);
      // エラー時はセッションをクリア
      localStorage.removeItem('user');
      localStorage.removeItem('loginTime');
    }
  };

  // 初期化処理
  useEffect(() => {
    // Google APIスクリプトの読み込み
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      checkExistingSession();
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Sign-In API');
      checkExistingSession();
    };
    
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // ログイン済みの場合の表示
  if (loginState.isLoggedIn && loginState.user) {
    return (
      <div className="app-container">
        <div className="login-container">
          <div className="login-card logged-in-card">
            <div className="login-header">
              <User className="login-icon" />
              <h1>ログイン済み</h1>
            </div>
            
            <div className="user-info">
              {loginState.user.picture && (
                <img 
                  src={loginState.user.picture} 
                  alt="プロフィール画像" 
                  className="user-avatar"
                />
              )}
              <div className="user-details">
                <h2>{loginState.user.name}</h2>
                <p>{loginState.user.email}</p>
              </div>
            </div>
            
            <div className="login-actions">
              <button 
                className="btn btn-primary"
                onClick={() => router.push('/')}
              >
                アプリに戻る
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleLogout}
              >
                ログアウト
              </button>
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
            <h1>キノコ狩り記録システム</h1>
          </div>

          {/* メール認証フォーム */}
          <div className="email-login-section">
            <div className="form-group">
              <label className="form-label">
                <Mail className="form-icon" />
                メールアドレス
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
                <Lock className="form-icon" />
                パスワード
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="パスワードを入力"
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

            <button 
              className="btn btn-primary login-submit-btn"
              onClick={handleEmailLogin}
              disabled={isLoading}
            >
              {isLoading ? 'ログイン中...' : 'メールでログイン'}
            </button>

            <button 
              type="button"
              className="forgot-password-link"
              onClick={() => router.push('/forgot-password')}
            >
              パスワードを忘れた場合
            </button>
          </div>

          <div className="login-divider">
            <span>または</span>
          </div>

          {/* Google認証ボタン */}
          <div className="google-login-section">
            <button 
              className="google-login-btn"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? 'ログイン中...' : 'Googleでログイン'}
            </button>
          </div>

          <div className="signup-section">
            <p className="signup-text">アカウントをお持ちでない方</p>
            <button 
              className="btn btn-secondary signup-btn"
              onClick={() => router.push('/signup')}
              disabled={isLoading}
            >
              新規登録
            </button>
          </div>

          <div className="login-footer">
            <p>
              初回利用の方は新規登録、既存ユーザーの方はログイン
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}