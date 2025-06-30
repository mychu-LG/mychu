import axios from 'axios';

export async function getEmotionRecommendations({ userIdx, genre, isHome, isDrama, isMovie }) {
  const params = {};
  if (genre) params.genre = genre;
  if (isHome !== undefined) params.is_home = isHome;
  if (isDrama !== undefined) params.is_drama = isDrama;
  if (isMovie !== undefined) params.is_movie = isMovie;

  const res = await axios.get(`/emotion/recommendations/${userIdx}`, { params });
  return res.data.recommendations || [];
} 