import MovieNavbar from "../../../Components/movies/movienavbar/MovieNavbar";
import Featured from "../../../Components/movies/featured/Featured";
import "./moviehome.scss";
import List from "../../../Components/movies/list/List";
import { useEffect, useState } from "react";
import axios from "axios";

const MovieHome = ({ type }) => {
  const [lists, setLists] = useState([]);
  const [genre, setGenre] = useState(null);

  useEffect(() => {
    const getRandomLists = async () => {
      try {
        console.log("Fetching data...");
        const res = await axios.get(
          `/api/lists/${type ? "?type=" + type : ""}${genre ? "&genre=" + genre : ""}`
        );

        setLists(res.data);
      } catch (err) {
        console.error("Error fetching data:", err);
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
