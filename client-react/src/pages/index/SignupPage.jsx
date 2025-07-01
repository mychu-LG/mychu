import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupPage.css';
import logo from '../../assets/images/logos/welllist_backno.png';
import bgImage from '../../assets/images/backgrounds/login_image3.png';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    contact: '',
    name: '',
    password: '',
    confirmPassword: '',
    birthdate: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ text: '', level: '' });
  const [isFormValid, setIsFormValid] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'contact':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '유효한 이메일을 입력하세요';
        break;
      case 'name':
        if (!value.trim()) return '닉네임을 입력하세요';
        break;
      case 'confirmPassword':
        if (value !== formData.password) return '비밀번호가 일치하지 않습니다';
        break;
      case 'birthdate':
        if (!value) return '생년월일을 입력하세요';
        break;
      case 'agreeTerms':
        if (!value) return '이용약관에 동의해야 합니다';
        break;
      default:
        return '';
    }
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, fieldValue) }));

    if (name === 'password') {
      evaluatePasswordStrength(fieldValue);
    }
  };

  const evaluatePasswordStrength = (password) => {
    let level = 0;
    if (password.length >= 8) level++;
    if (/[a-z]/.test(password)) level++;
    if (/[A-Z]/.test(password)) level++;
    if (/[0-9]/.test(password)) level++;
    if (/[^A-Za-z0-9]/.test(password)) level++;

    const levels = ['매우 약함', '약함', '보통', '강함', '매우 강함'];
    const classes = ['very-weak', 'weak', 'medium', 'strong', 'very-strong'];
    setPasswordStrength({ text: levels[level - 1] || '', level: classes[level - 1] || '' });
  };

  useEffect(() => {
    const isValid =
      Object.values(errors).every((msg) => msg === '') &&
      Object.entries(formData).every(([key, val]) =>
        typeof val === 'boolean' ? val || key === 'agreeMarketing' : val.trim() !== ''
      );
    setIsFormValid(isValid);
  }, [errors, formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      alert('회원가입이 완료되었습니다!');
      navigate('/main');
    } catch {
      alert('회원가입 실패');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="signup-page"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      <div className="background-overlay" />
      <div className="login-logo" onClick={() => navigate('/')}>
        <img src={logo} alt="WellList 홈으로" />
      </div>

      <form className="signup-content" onSubmit={handleSubmit}>
        <h2 className="signup-title">WellList 회원가입</h2>
        <p className="signup-subtitle">무제한 영화, 드라마, 예능을 즐겨보세요</p>

        {/* 이메일 */}
        <input
          type="email"
          name="contact"
          placeholder="이메일"
          className={`form-input ${errors.contact ? 'invalid' : 'valid'}`}
          value={formData.contact}
          onChange={handleInputChange}
        />
        {errors.contact && <div className="input-error">{errors.contact}</div>}

        {/* 닉네임 */}
        <input
          type="text"
          name="name"
          placeholder="닉네임"
          className={`form-input ${errors.name ? 'invalid' : 'valid'}`}
          value={formData.name}
          onChange={handleInputChange}
        />
        {errors.name && <div className="input-error">{errors.name}</div>}

        {/* 비밀번호 */}
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="비밀번호 (8자 이상)"
            className={`form-input ${errors.password ? 'invalid' : 'valid'}`}
            value={formData.password}
            onChange={handleInputChange}
          />
          <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
              {showPassword ? (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              ) : (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.4 18.4 0 0 1 5.06-5.94" />
                  <path d="M9.88 4.24A9.17 9.17 0 0 1 12 4c7 0 11 8 11 8a18.4 18.4 0 0 1-2.12 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              )}
            </svg>
          </button>
        </div>
        {passwordStrength.text && (
          <div className={`password-strength ${passwordStrength.level}`}>
            비밀번호 강도: {passwordStrength.text}
          </div>
        )}
        {errors.password && <div className="input-error">{errors.password}</div>}

        {/* 비밀번호 확인 */}
        <div className="password-wrapper">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="비밀번호 확인"
            className={`form-input ${errors.confirmPassword ? 'invalid' : 'valid'}`}
            value={formData.confirmPassword}
            onChange={handleInputChange}
          />
          <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
              {showConfirmPassword ? (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              ) : (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.4 18.4 0 0 1 5.06-5.94" />
                  <path d="M9.88 4.24A9.17 9.17 0 0 1 12 4c7 0 11 8 11 8a18.4 18.4 0 0 1-2.12 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              )}
            </svg>
          </button>
        </div>
        {errors.confirmPassword && <div className="input-error">{errors.confirmPassword}</div>}

        {/* 생년월일 */}
        <input
          type="date"
          name="birthdate"
          placeholder="생년월일"
          className={`form-input ${errors.birthdate ? 'invalid' : 'valid'}`}
          value={formData.birthdate}
          onChange={handleInputChange}
        />
        {errors.birthdate && <div className="input-error">{errors.birthdate}</div>}

        {/* 약관 동의 */}
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleInputChange}
          />
          이용약관에 동의합니다
        </label>
        {errors.agreeTerms && <div className="input-error">{errors.agreeTerms}</div>}

        {/* 회원가입 버튼 */}
        <button type="submit" className={`signup-btn ${isFormValid ? 'active' : ''}`} disabled={!isFormValid || isLoading}>
          {isLoading ? '가입 중...' : '회원가입'}
        </button>

        <div className="signup-footer">
          이미 계정이 있으신가요?
          <button type="button" onClick={() => navigate('/login')}>
            로그인
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;
