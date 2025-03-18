import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const ChatRoom = () => {
    const [searchParams] = useSearchParams();
    const seat1 = searchParams.get("seat1");
    const seat2 = searchParams.get("seat2");

    const mySeat = localStorage.getItem("seatNumber"); // User's seat
    const otherSeat = mySeat === seat1 ? seat2 : seat1; // Chat partner's seat

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const messagesEndRef = React.useRef(null);

    useEffect(() => {
        if (!seat1 || !seat2) return;

        const roomName = [seat1, seat2].sort().join("-");
        console.log(`🔗 Joining chat room: ${roomName}`);

        // Join the chat room
        socket.emit("rejoin_chat", { seat1, seat2 });

        // Listen for incoming messages
        socket.on("receive_message", (data) => {
            console.log("📩 Received message:", data);
            setMessages((prev) => [...prev, data]);
        });

        // Listen for typing indicators
        socket.on("user_typing", (data) => {
            if (data.fromSeat !== mySeat) {
                setIsTyping(true);
                clearTimeout(typingTimeout);
                setTypingTimeout(setTimeout(() => setIsTyping(false), 2000));
            }
        });

        return () => {
            socket.off("receive_message");
            socket.off("user_typing");
        };
    }, [seat1, seat2, mySeat, typingTimeout]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleTyping = (e) => {
        setMessage(e.target.value);
        
        // Emit typing event
        const roomName = [seat1, seat2].sort().join("-");
        socket.emit("typing", {
            fromSeat: mySeat,
            toSeat: otherSeat,
            room: roomName
        });
    };

    const sendMessage = () => {
        if (message.trim() === "") return;

        console.log("🛫 Sending message:", message);

        const roomName = [seat1, seat2].sort().join("-");

        const newMessage = {
            fromSeat: mySeat,
            toSeat: otherSeat,
            message,
            room: roomName,
            timestamp: new Date().toISOString(),
        };

        socket.emit("send_message", newMessage, (ack) => {
            if (ack && ack.success) {
                console.log("✅ Message successfully sent:", newMessage);
                setMessage(""); // Clear input
            } else {
                console.error("❌ Message failed to send", ack?.error);
            }
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Format timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.avatarContainer}>
                    <div style={styles.avatar}>{otherSeat}</div>
                </div>
                <div style={styles.headerInfo}>
                    <h2 style={styles.headerTitle}>Seat {otherSeat}</h2>
                    {isTyping && <div style={styles.typing}>typing...</div>}
                </div>
            </header>

            <div style={styles.chatBox}>
                {messages.length === 0 && (
                    <div style={styles.emptyState}>
                        <p>No messages yet. Say hello! 👋</p>
                    </div>
                )}
                
                {messages.map((msg, index) => {
                    const isMe = msg.fromSeat === mySeat;
                    const showAvatar = index === 0 || messages[index - 1]?.fromSeat !== msg.fromSeat;
                    
                    return (
                        <div key={index} style={{
                            ...styles.messageRow,
                            justifyContent: isMe ? "flex-end" : "flex-start"
                        }}>
                            {!isMe && showAvatar && (
                                <div style={styles.messageAvatar}>{msg.fromSeat}</div>
                            )}
                            
                            <div style={{
                                ...styles.messageBubble,
                                backgroundColor: isMe ? "#0A84FF" : "#323232",
                                borderBottomLeftRadius: !isMe && !showAvatar ? 4 : 18,
                                borderBottomRightRadius: isMe && !showAvatar ? 4 : 18,
                                borderTopLeftRadius: 18,
                                borderTopRightRadius: 18,
                            }}>
                                <div style={styles.messageText}>{msg.message}</div>
                                <div style={styles.messageTime}>{formatTime(msg.timestamp)}</div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div style={styles.inputContainer}>
                <input
                    type="text"
                    value={message}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    placeholder="Message..."
                    style={styles.input}
                />
                <button 
                    onClick={sendMessage} 
                    style={{
                        ...styles.button,
                        opacity: message.trim() ? 1 : 0.5,
                    }}
                    disabled={!message.trim()}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#171717",
        color: "#fff",
    },
    header: {
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: "1px solid #2C2C2C",
        backgroundColor: "#1A1A1A",
    },
    avatarContainer: {
        marginRight: "12px",
    },
    avatar: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        backgroundColor: "#0A84FF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        margin: 0,
        fontSize: "18px",
        fontWeight: "500",
    },
    typing: {
        fontSize: "12px",
        color: "#8E8E93",
        marginTop: "2px",
    },
    chatBox: {
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "#8E8E93",
        textAlign: "center",
    },
    messageRow: {
        display: "flex",
        alignItems: "flex-end",
        marginBottom: "2px",
    },
    messageAvatar: {
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        backgroundColor: "#2C2C2C",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        marginRight: "8px",
    },
    messageBubble: {
        padding: "10px 14px",
        maxWidth: "70%",
        position: "relative",
    },
    messageText: {
        fontSize: "15px",
        lineHeight: "1.4",
        wordBreak: "break-word",
    },
    messageTime: {
        fontSize: "10px",
        color: "rgba(255, 255, 255, 0.6)",
        textAlign: "right",
        marginTop: "4px",
    },
    inputContainer: {
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        borderTop: "1px solid #2C2C2C",
        backgroundColor: "#1A1A1A",
    },
    input: {
        flex: 1,
        padding: "12px 16px",
        borderRadius: "24px",
        border: "none",
        backgroundColor: "#2C2C2C",
        color: "#fff",
        outline: "none",
        fontSize: "15px",
    },
    button: {
        marginLeft: "10px",
        padding: "8px 16px",
        backgroundColor: "#0A84FF",
        border: "none",
        borderRadius: "20px",
        color: "#fff",
        fontWeight: "500",
        cursor: "pointer",
        fontSize: "15px",
        transition: "opacity 0.2s",
    },
};

export default ChatRoom;