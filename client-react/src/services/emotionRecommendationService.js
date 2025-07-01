import axios from 'axios';

// 환경변수 버전은 주석처리 또는 삭제
// const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const BASE_URL = "http://localhost:8000";

export async function getEmotionRecommendations({ userIdx, genre, isHome, isDrama, isMovie }) {
  const params = {};
  if (genre) params.genre = genre;
  if (isHome !== undefined) params.is_home = isHome;
  if (isDrama !== undefined) params.is_drama = isDrama;
  if (isMovie !== undefined) params.is_movie = isMovie;

  // 항상 절대경로로 요청
  const url = `${BASE_URL}/emotion/recommendations/${userIdx}`;
  const res = await axios.get(url, { params });
  return res.data.recommendations || [];
} 