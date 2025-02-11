import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Background from "./Components/Background/Background";
import Navbar from "./Components/Navbar/Navbar";
import Hero from "./Components/Hero/Hero";
import Login from "./Components/LoginForm";
import Moments from "./pages/Moments"; // ✅ Import Moments Page
import Chatroom from "./pages/ChatRoom"; // ✅ Import Chatroom Page

const App = () => {
  let heroData = [
    { text1: "Cravings at 30,000 feet?", text2: "We’ve got you covered." },
    { text1: "Escape into", text2: "stories while you soar." },
    { text1: "Connect and", text2: "share, even in the air." },
  ];

  const [heroCount, setHeroCount] = useState(0);
  const [playStatus, setPlayStatus] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [seatNumber, setSeatNumber] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroCount((count) => (count === 2 ? 0 : count + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <AppContent
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        setSeatNumber={setSeatNumber}
        heroData={heroData}
        heroCount={heroCount}
        setHeroCount={setHeroCount}
        playStatus={playStatus}
        setPlayStatus={setPlayStatus}
        seatNumber={seatNumber}
      />
    </Router>
  );
};

const AppContent = ({
  isLoggedIn,
  setIsLoggedIn,
  setSeatNumber,
  heroData,
  heroCount,
  setHeroCount,
  playStatus,
  setPlayStatus,
  seatNumber
}) => {
  const location = useLocation(); // ✅ Get the current page route

  return (
    <div style={{ position: "relative" }}>
      {!isLoggedIn ? (
        <Routes>
          {/* ✅ Pass setSeatNumber to store seat info during login */}
          <Route
            path="/login"
            element={<Login setIsLoggedIn={setIsLoggedIn} setSeatNumber={setSeatNumber} />}
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <>
          {/* ✅ Show Background only on the home page */}
          {location.pathname === "/" && (
            <Background playStatus={playStatus} heroCount={heroCount} />
          )}

          <Navbar /> {/* ✅ Navbar is always visible after login */}

          <Routes>
            <Route
              path="/"
              element={
                <Hero
                  setPlayStatus={setPlayStatus}
                  heroData={heroData[heroCount]}
                  heroCount={heroCount}
                  setHeroCount={setHeroCount}
                  playStatus={playStatus}
                />
              }
            />
            {/* ✅ Pass seatNumber to Moments & Chatroom */}
            <Route path="/moments" element={<Moments seatNumber={seatNumber} />} />
            <Route path="/chatroom" element={<Chatroom seatNumber={seatNumber} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </>
      )}
    </div>
  );
};

export default App;
