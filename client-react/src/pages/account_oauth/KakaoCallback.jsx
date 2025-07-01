import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const KakaoCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');

    if (code) {
      navigate('/main');
    } else {
      navigate('/account');
    }
  }, [searchParams, navigate]);

  return null;
};

export default KakaoCallback;
