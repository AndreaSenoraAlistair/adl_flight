import { useState } from "react";
import axios from "axios";
import "./Hero.css";

const Hero = ({ heroData, setHeroCount, heroCount, setPlayStatus, playStatus }) => {
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input.trim()) return;
    
        const userMessage = { sender: "You", text: input };
        setMessages(prevMessages => [...prevMessages, userMessage]);
    
        try {
            const response = await axios.post("http://localhost:5000/api/chat", { message: input });
    
            console.log("🔹 API Response:", response.data); // ✅ Debugging
    
            const botMessage = { sender: "Bot", text: response.data.reply || "No response from the bot." };
            setMessages(prevMessages => [...prevMessages, botMessage]);
        } catch (error) {
            console.error("❌ Chatbot API Error:", error);
            setMessages(prevMessages => [...prevMessages, { sender: "Bot", text: "Error connecting to chatbot." }]);
        }
    
        setInput("");
    };
    

    return (
        <div className="hero">
            <div className="hero-text">
                <p>{heroData.text1}</p>
                <p>{heroData.text2}</p>
            </div>
            <div className="hero-explore">
                <p>Explore the features</p>
            </div>
            <div className="hero-dot-play">
                <ul className="hero-dots">
                    <li onClick={() => setHeroCount(0)} className={heroCount === 0 ? "hero-dot orange" : "hero-dot"}></li>
                    <li onClick={() => setHeroCount(1)} className={heroCount === 1 ? "hero-dot orange" : "hero-dot"}></li>
                    <li onClick={() => setHeroCount(2)} className={heroCount === 2 ? "hero-dot orange" : "hero-dot"}></li>
                </ul>
                <div className="hero-controls">
                    <div className="hero-play">
                        <p>See the video</p>
                    </div>
                    <button className="chatbot-btn" onClick={() => setShowChat(!showChat)}>Chatbot</button>
                </div>
            </div>

            {showChat && (
                <div className="chat-window">
                    <div className="chat-header">
                        <p>Chatbot</p>
                        <button onClick={() => setShowChat(false)}>✖</button>
                    </div>
                    <div className="chat-body">
                        {messages.map((msg, index) => (
                            <p key={index} className={msg.sender === "You" ? "user-message" : "bot-message"}>
                                <strong>{msg.sender}: </strong>{msg.text}
                            </p>
                        ))}
                    </div>
                    <div className="chat-input">
                        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." />
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Hero;
