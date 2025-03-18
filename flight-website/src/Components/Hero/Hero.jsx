import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./Hero.css";

const Hero = ({ heroData, setHeroCount, heroCount, setPlayStatus, playStatus }) => {
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    
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
            const response = await axios.post("http://localhost:5000/api/chat", { message: input });
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

    return (
        <div className="hero" style={styles.hero}>
            {/* The entire hero section without a white background - letting the video show through */}
            <div className="hero-content" style={styles.heroContent}>
                <div className="hero-text" style={styles.heroText}>
                    <h1 style={styles.heroHeading}>{heroData.text1 || "Connect and"}</h1>
                    <p style={styles.heroSubheading}>{heroData.text2 || "share, even in the air."}</p>
                    
                    <div className="hero-cta" style={styles.heroCta}>
                        <button 
                            className="video-btn" 
                            style={styles.videoButton}
                            onClick={() => setPlayStatus(!playStatus)}
                        >
                            <span style={styles.playIcon}>▶</span> Watch Video
                        </button>
                        
                        <button 
                            className="chatbot-btn" 
                            style={styles.chatButton}
                            onClick={() => setShowChat(!showChat)}
                        >
                            <span style={styles.chatIcon}>💬</span> Chat with Us
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="hero-explore" style={styles.heroExplore}>
                <p>Explore the features</p>
            </div>
            
            <div className="hero-navigation" style={styles.heroNavigation}>
                <ul className="hero-dots" style={styles.heroDots}>
                    {[0, 1, 2].map(index => (
                        <li 
                            key={index}
                            onClick={() => setHeroCount(index)} 
                            style={{
                                ...styles.heroDot,
                                ...(heroCount === index ? styles.heroDotActive : {})
                            }}
                        />
                    ))}
                </ul>
            </div>

            {/* Chat window */}
            {showChat && (
                <div className="chat-window" style={styles.chatWindow}>
                    <div className="chat-header" style={styles.chatHeader}>
                        <div style={styles.chatHeaderLeft}>
                            <div style={styles.chatAvatar}>💬</div>
                            <p style={styles.chatTitle}>Assistant</p>
                        </div>
                        <button style={styles.closeButton} onClick={() => setShowChat(false)}>✖</button>
                    </div>
                    
                    <div className="chat-body" style={styles.chatBody}>
                        {messages.length === 0 && (
                            <div style={styles.emptyChat}>
                                <div style={styles.welcomeMessage}>
                                    <div style={styles.welcomeIcon}>👋</div>
                                    <p>Hi there! How can I help you today?</p>
                                </div>
                                <div style={styles.suggestionChips}>
                                    {["Features", "Pricing", "Support", "Getting Started"].map((suggestion, i) => (
                                        <button 
                                            key={i} 
                                            style={styles.suggestionChip}
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
                                style={msg.sender === "You" ? styles.userMessage : styles.botMessage}
                            >
                                {msg.sender === "Bot" && <div style={styles.botAvatar}>💬</div>}
                                <div style={styles.messageContent}>
                                    <div style={styles.messageText}>{msg.text}</div>
                                    <div style={styles.messageTime}>
                                        {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {isTyping && (
                            <div style={styles.botMessage}>
                                <div style={styles.botAvatar}>💬</div>
                                <div style={styles.typingIndicator}>
                                    <span style={{...styles.typingDot, animationDelay: "0s"}}></span>
                                    <span style={{...styles.typingDot, animationDelay: "0.2s"}}></span>
                                    <span style={{...styles.typingDot, animationDelay: "0.4s"}}></span>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <div className="chat-input" style={styles.chatInput}>
                        <input 
                            style={styles.input}
                            value={input} 
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message here..." 
                        />
                        <button 
                            style={{
                                ...styles.sendButton,
                                ...(input.trim() ? styles.sendButtonActive : {})
                            }}
                            onClick={sendMessage}
                            disabled={!input.trim()}
                        >
                            <span style={styles.sendIcon}>➤</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    // Hero section styles - no white background
    hero: {
        position: "relative",
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        // Removed the background color/gradient to allow video to show through
        overflow: "hidden",
        padding: "0 20px"
    },
    heroContent: {
        maxWidth: "1200px",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 1,
        // Added some padding to create space between content and edges
        padding: "0 20px" 
    },
    heroText: {
        textAlign: "center",
        maxWidth: "800px",
        // Added a semi-transparent background for better text readability on video
        backgroundColor: "rgba(255, 255, 255, 0.1)", 
        backdropFilter: "blur(5px)",
        borderRadius: "15px",
        padding: "30px",
        marginBottom: "40px"
    },
    heroHeading: {
        fontSize: "4rem",
        fontWeight: "700",
        marginBottom: "1rem",
        color: "#FF6B00", // Using the orange color from your design
        lineHeight: 1.2
    },
    heroSubheading: {
        fontSize: "1.5rem",
        color: "#333",
        marginBottom: "2.5rem",
        lineHeight: 1.6
    },
    heroCta: {
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        marginTop: "30px",
        flexWrap: "wrap"
    },
    videoButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "14px 28px",
        backgroundColor: "#FF6B00",
        color: "white",
        border: "none",
        borderRadius: "50px",
        fontSize: "1rem",
        fontWeight: "600",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        boxShadow: "0 4px 12px rgba(255, 107, 0, 0.3)"
    },
    playIcon: {
        marginRight: "10px",
        fontSize: "0.8rem"
    },
    chatButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "14px 28px",
        backgroundColor: "white",
        color: "#FF6B00",
        border: "2px solid #FF6B00",
        borderRadius: "50px",
        fontSize: "1rem",
        fontWeight: "600",
        cursor: "pointer",
        transition: "transform 0.2s, background-color 0.2s",
    },
    chatIcon: {
        marginRight: "10px"
    },
    heroExplore: {
        position: "absolute",
        bottom: "80px",
        textAlign: "center",
        color: "#333",
        fontSize: "1rem",
        // Added a semi-transparent background for better readability
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        padding: "10px 20px",
        borderRadius: "30px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    },
    heroNavigation: {
        position: "absolute",
        bottom: "30px",
        zIndex: 10
    },
    heroDots: {
        display: "flex",
        listStyle: "none",
        padding: 0,
        gap: "12px"
    },
    heroDot: {
        width: "12px",
        height: "12px",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: "50%",
        cursor: "pointer",
        transition: "background-color 0.3s, transform 0.3s"
    },
    heroDotActive: {
        backgroundColor: "#FF6B00",
        transform: "scale(1.2)"
    },

    // Chat window styles
    chatWindow: {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "350px",
        height: "500px",
        backgroundColor: "#fff",
        borderRadius: "15px",
        boxShadow: "0 5px 30px rgba(0, 0, 0, 0.15)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 1000,
        border: "1px solid #eaeaea",
        transition: "all 0.3s ease"
    },
    chatHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 20px",
        backgroundColor: "#FF6B00",
        color: "white",
        borderBottom: "1px solid #eaeaea"
    },
    chatHeaderLeft: {
        display: "flex",
        alignItems: "center"
    },
    chatAvatar: {
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        backgroundColor: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginRight: "10px",
        fontSize: "1.2rem"
    },
    chatTitle: {
        margin: 0,
        fontSize: "16px",
        fontWeight: "600"
    },
    closeButton: {
        background: "none",
        border: "none",
        color: "white",
        fontSize: "16px",
        cursor: "pointer",
        transition: "transform 0.2s",
        padding: "5px"
    },
    chatBody: {
        flex: 1,
        padding: "20px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        backgroundColor: "#f9f9f9"
    },
    emptyChat: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: "20px"
    },
    welcomeMessage: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
        maxWidth: "100%",
        textAlign: "center",
        color: "#333"
    },
    welcomeIcon: {
        fontSize: "2rem",
        marginBottom: "10px"
    },
    suggestionChips: {
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        justifyContent: "center"
    },
    suggestionChip: {
        padding: "8px 15px",
        backgroundColor: "white",
        border: "1px solid #FF6B00",
        borderRadius: "20px",
        color: "#FF6B00",
        fontSize: "14px",
        cursor: "pointer",
        transition: "background-color 0.2s",
        fontWeight: "500"
    },
    userMessage: {
        alignSelf: "flex-end",
        display: "flex",
        maxWidth: "80%"
    },
    botMessage: {
        alignSelf: "flex-start",
        display: "flex",
        maxWidth: "80%",
        gap: "10px"
    },
    botAvatar: {
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        backgroundColor: "#FF6B00",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "0.9rem",
        flexShrink: 0
    },
    messageContent: {
        display: "flex",
        flexDirection: "column"
    },
    messageText: {
        backgroundColor: props => props.sender === "You" ? "#FF6B00" : "white",
        color: props => props.sender === "You" ? "white" : "#333",
        padding: "12px 16px",
        borderRadius: props => props.sender === "You" 
            ? "18px 18px 0 18px" 
            : "18px 18px 18px 0",
        boxShadow: "0 1px 5px rgba(0, 0, 0, 0.05)",
        wordBreak: "break-word",
        lineHeight: 1.5
    },
    messageTime: {
        fontSize: "0.7rem",
        color: "#999",
        marginTop: "5px",
        alignSelf: props => props.sender === "You" ? "flex-end" : "flex-start"
    },
    typingIndicator: {
        backgroundColor: "white",
        padding: "15px 20px",
        borderRadius: "18px 18px 18px 0",
        display: "flex",
        gap: "5px"
    },
    typingDot: {
        width: "8px",
        height: "8px",
        backgroundColor: "#ccc",
        borderRadius: "50%",
        display: "inline-block",
        animation: "pulse 1.2s infinite"
    },
    chatInput: {
        display: "flex",
        padding: "15px",
        borderTop: "1px solid #eaeaea",
        backgroundColor: "white",
        alignItems: "center"
    },
    input: {
        flex: 1,
        padding: "12px 15px",
        border: "1px solid #e0e0e0",
        borderRadius: "25px",
        outline: "none",
        fontSize: "14px",
        transition: "border-color 0.3s",
        backgroundColor: "#f9f9f9"
    },
    sendButton: {
        marginLeft: "10px",
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ddd",
        color: "white",
        border: "none",
        borderRadius: "50%",
        cursor: "pointer"
    },
    sendButtonActive: {
        backgroundColor: "#FF6B00",
        transform: "scale(1.05)",
        boxShadow: "0 2px 10px rgba(255, 107, 0, 0.3)"
    },
    sendIcon: {
        fontSize: "14px"
    }
};

export default Hero;