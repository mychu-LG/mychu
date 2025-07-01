import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const NaverCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state) {
      // 서버 연동 없이 바로 메인으로 이동
      navigate('/main');
    } else {
      // 실패 시 account 페이지로 이동
      navigate('/account');
    }
  }, [searchParams, navigate]);

  return null;
};

export default NaverCallback;
