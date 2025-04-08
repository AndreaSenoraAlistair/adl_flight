import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./featured.scss";

export default function Featured({ type, setGenre }) {
  const [content, setContent] = useState({});
  const navigate = useNavigate();

  const API_BASE_URL = "https://inlight-entertainment-backend.onrender.com";

  useEffect(() => {
    const getRandomContent = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const TOKEN = user?.accessToken;

        const url = type
          ? `${API_BASE_URL}/api/movies/random?type=${type}`
          : `${API_BASE_URL}/api/movies/random`;

        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        });

        setContent(res.data[0]);
      } catch (err) {
        console.error("❌ Error fetching random movie:", err);
      }
    };

    getRandomContent();
  }, [type]);

  const movieGenres = [
    "Adventure",
    "Comedy",
    "Crime",
    "Fantasy",
    "Horror",
    "Thriller",
  ];
  const seriesGenres = ["Adventure", "Thriller", "Crime"];

  return (
    <div className="featured">
      {type && (
        <div className="category">
          <span>{type === "movie" ? "Movies" : "Series"}</span>
          <select
            name="genre"
            id="genre"
            onChange={(e) => setGenre(e.target.value)}
          >
            <option>Genre</option>
            {(type === "movie" ? movieGenres : seriesGenres).map((genre) => (
              <option key={genre.toLowerCase()} value={genre.toLowerCase()}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      )}

      {content.img && <img src={content.img} alt="featured content" />}

      <div className="info">
        <span className="desc">{content.desc}</span>
        <div className="buttons">
          <button
            className="play"
            onClick={() =>
              navigate(`/movies/${type === "movie" ? "movies" : "series"}`)
            }
          >
            <PlayArrowIcon />
            <span>Play</span>
          </button>
          <button className="more">
            <InfoOutlinedIcon />
            <span>Info</span>
          </button>
        </div>
      </div>
    </div>
  );
}
