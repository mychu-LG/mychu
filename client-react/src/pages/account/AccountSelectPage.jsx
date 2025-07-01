import { useNavigate } from 'react-router-dom';
import './AccountSelectPage.css';
import logo from '../../assets/images/logos/welllist_backno.png';
import iconEmail from '../../assets/images/logos/simple_logo.png';
import iconNaver from '../../assets/images/logos/naver_logo.png';
import iconKakao from '../../assets/images/logos/kakao_logo.png';
import bgImage from '../../assets/images/backgrounds/login_image3.png';

const AccountPage = () => {
  const navigate = useNavigate();

  const handleNaverLogin = () => {
    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_NAVER_REDIRECT_URI;
    const state = crypto.randomUUID(); // CSRF 방지용
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    window.location.href = naverAuthUrl;
  };

  const handleKakaoLogin = () => {
    const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = kakaoAuthUrl;
  };

  return (
    <div
      className="account-page"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      <div className="background-overlay" />

      <div className="account-logo" onClick={() => navigate('/')}>
        <img src={logo} alt="WellList 홈으로" />
      </div>

      <div className="account-content">
        <h2 className="account-title">반가워요!<br />계정을 선택해주세요.</h2>

        <div className="account-buttons">
          <button className="account-btn" onClick={() => navigate('/login')}>
            <div className="btn-icon">
              <img src={iconEmail} alt="이메일" />
            </div>
            <div className="btn-label">이메일로 시작하기</div>
          </button>

          <button className="account-btn" onClick={handleNaverLogin}>
            <div className="btn-icon">
              <img src={iconNaver} alt="네이버" />
            </div>
            <div className="btn-label">네이버로 시작하기</div>
          </button>

          <button className="account-btn" onClick={handleKakaoLogin}>
            <div className="btn-icon">
              <img src={iconKakao} alt="카카오" />
            </div>
            <div className="btn-label">카카오로 시작하기</div>
          </button>
        </div>

        <p className="signup-text">
          아직 계정이 없으신가요? <span onClick={() => navigate('/signup')}>회원가입</span>
        </p>
      </div>
    </div>
  );
};

export default AccountPage;