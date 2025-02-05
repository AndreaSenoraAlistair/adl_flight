import React, { useState, useEffect } from "react"; 
import Background from './Components/Background/Background';
import Navbar from './Components/Navbar/Navbar';
import Hero from './Components/Hero/Hero';
const App = () => {
  let heroData = [
    {text1:"Cravings at 30,000 feet?",text2:"We’ve got you covered."},
    {text1:"Escape into",text2:"stories while you soar."},
    {text1:"Connect and",text2:"share, even in the air."},
  ]
  const [heroCount,setHeroCount] = useState(0);
  const [playStatus,setPlayStatus] = useState(false);
  
  useEffect(()=>{
    setInterval(() => {
      setHeroCount((count)=>{return count===2?0:count+1})
    }, 3000);
  },[])

  return (
    <div style={{ position: 'relative' }}>
      <Background playStatus={playStatus} heroCount={heroCount} />
      <Navbar />    
      <Hero
        setPlayStatus={setPlayStatus}
        heroData={heroData[heroCount]}
        heroCount={heroCount}
        setHeroCount={setHeroCount}
        playStatus={playStatus}
      />
    </div>
  );
}

export default App