const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getMyData = async (userIdx) => {
  const res = await fetch(`${API_BASE_URL}/my-data?user_idx=${userIdx}`);
  if (!res.ok) {
    throw new Error("CSV 데이터 불러오기 실패");
  }
  return await res.json();
};
