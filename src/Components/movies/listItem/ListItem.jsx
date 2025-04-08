import "./listitem.scss";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AddIcon from "@mui/icons-material/Add";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ListItem({ index, item }) {
  const [isHovered, setIsHovered] = useState(false);
  const [movie, setMovie] = useState(null);

  // ✅ Backend URL
  const API_BASE_URL = "https://inlight-entertainment-backend.onrender.com";

  useEffect(() => {
    const getMovie = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const TOKEN = user?.accessToken;

        const res = await axios.get(`${API_BASE_URL}/api/movies/find/${item}`, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        });

        setMovie(res.data);
      } catch (err) {
        console.error("❌ Error fetching movie:", err);
      }
    };

    getMovie();
  }, [item]);

  return (
    <Link
      to={movie ? "/watch" : "#"}
      state={movie ? { movieId: movie._id } : null}
    >
      <div
        className="listItem"
        style={{
          left: isHovered ? index * 225 - 50 + index * 2.5 : "auto",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {movie ? (
          <>
            <img src={movie.imgSm} alt={movie.title || "Movie"} />
            {isHovered && (
              <>
                <video src={movie.trailer} autoPlay loop muted />
                <div className="itemInfo">
                  <div className="icons">
                    <PlayArrowIcon className="icon" />
                    <AddIcon className="icon" />
                    <ThumbUpAltOutlinedIcon className="icon" />
                    <ThumbDownOutlinedIcon className="icon" />
                  </div>
                  <div className="itemInfoTop">
                    <span>{movie.duration}</span>
                    <span className="limit">+{movie.limit}</span>
                    <span>{movie.year}</span>
                  </div>
                  <div className="desc">{movie.desc}</div>
                  <div className="genre">{movie.genre}</div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="loading">Loading...</div>
        )}
      </div>
    </Link>
  );
}
