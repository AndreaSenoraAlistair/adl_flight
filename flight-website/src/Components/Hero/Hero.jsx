import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Hero.css";

const FlightHome = ({ heroData, setHeroCount, heroCount, setPlayStatus, playStatus }) => {
    const navigate = useNavigate();
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [passengerInfo, setPassengerInfo] = useState({
        name: "",
        seatNumber: ""
    });
    const messagesEndRef = useRef(null);

    // Get passenger info from localStorage on component mount
    useEffect(() => {
        const storedName = localStorage.getItem("passengerName") || "Guest User";
        const storedSeat = localStorage.getItem("passengerSeat") || "---";

        setPassengerInfo({
            name: storedName,
            seatNumber: storedSeat
        });
    }, []);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: "You", text: input };
        setMessages(prevMessages => [...prevMessages, userMessage]);

        setInput("");
        setIsTyping(true);

        try {
            const response = await axios.post("http://localhost:5000/api/chatbot/chatbot", { message: input });
            setIsTyping(false);

            console.log("🔹 API Response:", response.data);

            const botMessage = {
                sender: "Bot",
                text: response.data.reply || "No response from the bot."
            };
            setMessages(prevMessages => [...prevMessages, botMessage]);
        } catch (error) {
            setIsTyping(false);
            console.error("❌ Chatbot API Error:", error);
            setMessages(prevMessages => [...prevMessages, {
                sender: "Bot",
                text: "Error connecting to chatbot."
            }]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleFeatureClick = (feature) => {
        // Handle feature card clicks
        console.log(`Feature clicked: ${feature}`);
        // You can add specific actions for each feature here

        // Open chat with relevant query
        setShowChat(true);
        setInput(`Tell me about ${feature}`);
    };

    return (
        <div className="flight-home">
            {/* Passenger Info Display - Now more prominent */}
            {/* <div className="passenger-info-container">
                <div className="passenger-info">
                    <div className="passenger-avatar">
                        {passengerInfo.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="passenger-details">
                        <div className="passenger-name">{passengerInfo.name}</div>
                        <div className="passenger-seat">Seat {passengerInfo.seatNumber}</div>
                    </div>
                </div>
            </div>
             */}
            <div className="hero-container">
                {/* Illustration Background */}
                <div className="flight-illustration">
                    <div className="airplane-element"></div>
                    <div className="cloud-element cloud-1"></div>
                    <div className="cloud-element cloud-2"></div>
                    <div className="cloud-element cloud-3"></div>
                </div>

                <div className="hero-content">
                    <div className="hero-text">
                        <h1>{heroData.text1 || "Connect and"}</h1>
                        <p>{heroData.text2 || "share, even in the air."}</p>

                        <div className="hero-cta">
                            <button
                                className="video-btn"
                                onClick={() => setPlayStatus(!playStatus)}
                            >
                                <span className="play-icon">▶</span> Watch Video
                            </button>

                            <button
                                className="chatbot-btn"
                                onClick={() => setShowChat(!showChat)}
                            >
                                <span className="chat-icon">💬</span> Chat with Us
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hero-features">
                <h2>Your Perfect In-Flight Companion</h2>
                <div className="features-grid">
                    <button
                        className="feature-card"

                        onClick={() => navigate('/home')}
                    >
                        <div className="feature-icon">🍽️</div>
                        <h3>In-Flight Dining</h3>
                        <p>Order gourmet meals from our curated menu</p>
                    </button>

                    <button
                        className="feature-card"
                        onClick={() => navigate('/moments')}
                    >
                        <div className="feature-icon">📱</div>
                        <h3>Stay Connected</h3>
                        <p>Chat with fellow passengers during your journey</p>
                    </button>

                    <button
                        className="feature-card"
                        onClick={() => navigate('/movies')}
                    >
                        <div className="feature-icon">🎬</div>
                        <h3>Entertainment</h3>
                        <p>Access premium movies, shows, and games</p>
                    </button>
                </div>
            </div>

            <div className="hero-explore">
                <p>Explore the features</p>
            </div>

            <div className="hero-navigation">
                <ul className="hero-dots">
                    {[0, 1, 2].map(index => (
                        <li
                            key={index}
                            onClick={() => setHeroCount(index)}
                            className={`hero-dot ${heroCount === index ? 'active' : ''}`}
                        />
                    ))}
                </ul>
            </div>

            {/* Chat window */}
            {showChat && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="chat-header-left">
                            <div className="chat-avatar">💬</div>
                            <p className="chat-title">Flight Assistant</p>
                        </div>
                        <button className="close-button" onClick={() => setShowChat(false)}>✖</button>
                    </div>

                    <div className="chat-body">
                        {messages.length === 0 && (
                            <div className="empty-chat">
                                <div className="welcome-message">
                                    <div className="welcome-icon">👋</div>
                                    <p>Hi there, {passengerInfo.name}! How can I help with your flight today?</p>
                                </div>
                                <div className="suggestion-chips">
                                    {["In-flight Menu", "Entertainment", "Wi-Fi", "Flight Updates"].map((suggestion, i) => (
                                        <button
                                            key={i}
                                            className="suggestion-chip"
                                            onClick={() => setInput(`Tell me about ${suggestion}`)}
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={msg.sender === "You" ? "user-message" : "bot-message"}
                            >
                                {msg.sender === "Bot" && <div className="bot-avatar">💬</div>}
                                <div className="message-content">
                                    <div className="message-text">{msg.text}</div>
                                    <div className="message-time">
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="bot-message">
                                <div className="bot-avatar">💬</div>
                                <div className="typing-indicator">
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input">
                        <input
                            className="input-field"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message here..."
                        />
                        <button
                            className={`send-button ${input.trim() ? 'active' : ''}`}
                            onClick={sendMessage}
                            disabled={!input.trim()}
                        >
                            <span className="send-icon">➤</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlightHome;