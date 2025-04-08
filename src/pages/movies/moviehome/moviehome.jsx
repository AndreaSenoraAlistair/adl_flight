import MovieNavbar from "../../../Components/movies/movienavbar/MovieNavbar";
import Featured from "../../../Components/movies/featured/Featured";
import "./moviehome.scss";
import List from "../../../Components/movies/list/List";
import { useEffect, useState } from "react";
import axios from "axios";

const MovieHome = ({ type }) => {
  const [lists, setLists] = useState([]);
  const [genre, setGenre] = useState(null);

  // Automatically switch base URL depending on environment
  const API_BASE_URL = "https://inlight-entertainment-backend.onrender.com"


  useEffect(() => {
    const getRandomLists = async () => {
      try {
        let url = `${API_BASE_URL}/api/lists`;
        const queryParams = [];

        if (type) queryParams.push(`type=${type}`);
        if (genre) queryParams.push(`genre=${genre}`);

        if (queryParams.length > 0) {
          url += `?${queryParams.join("&")}`;
        }

        console.log("📡 Fetching from URL:", url);

        const res = await axios.get(url);
        setLists(res.data);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
      }
    };

    getRandomLists();
  }, [type, genre]);

  return (
    <div className="home">
      <MovieNavbar />
      <Featured type={type} setGenre={setGenre} />
      {lists.map((list) => (
        <List key={list._id} list={list} />
      ))}
    </div>
  );
};

export default MovieHome;
