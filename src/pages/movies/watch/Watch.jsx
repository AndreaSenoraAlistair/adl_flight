import "./watch.scss";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Watch() {
  const location = useLocation();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);

  const API_BASE_URL = "https://inlight-entertainment-backend.onrender.com";

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const movieId = location.state?.movieId;
        if (!movieId) {
          console.error("No movieId found in state!");
          return;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        const TOKEN = user?.accessToken;

        const res = await axios.get(`${API_BASE_URL}/api/movies/find/${movieId}`, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        });

        setMovie(res.data);
      } catch (err) {
        console.error("❌ Error fetching movie:", err);
      }
    };

    fetchMovie();
  }, [location]);

  if (!movie) {
    return <h2 className="loading-text">Loading...</h2>;
  }

  const getEmbeddedTrailerUrl = (url) => {
    if (!url) return "";
    let trailerUrl = url
      .replace("youtu.be", "www.youtube.com/embed")
      .replace("watch?v=", "embed/")
      .split("&")[0];

    return `${trailerUrl}?autoplay=1&controls=1&rel=0&modestbranding=1&showinfo=0`;
  };

  return (
    <div className="watch">
      <div className="back" onClick={() => navigate(-1)}>
        <ArrowBackOutlinedIcon />
        Home
      </div>
      <iframe
        className="video"
        src={getEmbeddedTrailerUrl(movie.trailer)}
        title={movie.title || "Movie Trailer"}
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
      ></iframe>
    </div>
  );
}
