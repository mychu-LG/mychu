import React from 'react';
import './Footer.css';
import welllistLogo from '../../assets/images/logos/welllist_backno.png';

/**
 * 글로벌 푸터 컴포넌트
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-logo">
              <img src={welllistLogo} alt="WellList" className="logo-image" />
            </div>
            
            <div className="footer-links">
              <div className="footer-section">
                <h3>서비스 안내</h3>
                <ul>
                  <li><a href="/about">서비스 소개</a></li>
                  <li><a href="/faq">자주 묻는 질문</a></li>
                  <li><a href="/contact">문의하기</a></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h3>콘텐츠</h3>
                <ul>
                  <li><a href="/movie">영화</a></li>
                  <li><a href="/drama">드라마</a></li>
                  <li><a href="/new">신작 안내</a></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h3>회원 지원</h3>
                <ul>
                  <li><a href="/mylist">마이페이지</a></li>
                  <li><a href="/account">계정 관리</a></li>
                  <li><a href="/rating">평가하기</a></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h3>법적 고지</h3>
                <ul>
                  <li><a href="/terms">이용약관</a></li>
                  <li><a href="/privacy">개인정보처리방침</a></li>
                  <li><a href="/cookie">쿠키 정책</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p className="copyright">&copy; {currentYear} WellList. All rights reserved.</p>
            <div className="social-links">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
