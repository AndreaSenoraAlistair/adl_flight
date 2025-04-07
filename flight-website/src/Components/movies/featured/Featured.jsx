import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./featured.scss";

export default function Featured({ type, setGenre }) {
  const [content, setContent] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const getRandomContent = async () => {
      try {
        const res = await axios.get(`/api/movies/random?type=${type}`);
        setContent(res.data[0]);
      } catch (err) {
        console.log(err);
      }
    };
    getRandomContent();
  }, [type]);

  const movieGenres = ["Adventure", "Comedy", "Crime", "Fantasy", "Horror", "Thriller"];
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

      <img src={content.img} alt="" />

      <div className="info">
        <span className="desc">{content.desc}</span>
        <div className="buttons">
          <button
            className="play"
            onClick={() => navigate(`/movies/${type === "movie" ? "movies" : "series"}`)}
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
