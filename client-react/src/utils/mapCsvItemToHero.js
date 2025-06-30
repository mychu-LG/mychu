export const mapCsvItemToHero = (item) => ({
    idx: item.idx,
    asset_nm: item.super_asset_nm,
    genre: item.new_genre,
    release_year: 2024, // CSV에 없으니 기본값
    description: item.smry,
    poster_path: item.new_poster_path || "https://placehold.co/300x450?text=No+Image",
    is_movie: Number(item.is_movie),
    is_drama: Number(item.is_drama),
  });
  