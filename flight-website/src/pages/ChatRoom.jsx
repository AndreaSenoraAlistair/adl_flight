import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io("https://inlight-entertainment-backend.onrender.com");

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

    // Generate avatar color based on seat number
    const getAvatarColor = (seatNum) => {
        const colors = ["#4F46E5", "#7C3AED", "#EC4899", "#F59E0B", "#10B981"];
        return colors[parseInt(seatNum) % colors.length];
    };

    const otherSeatColor = getAvatarColor(otherSeat);
    const mySeatColor = getAvatarColor(mySeat);

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.avatarContainer}>
                    <div style={{ ...styles.avatar, backgroundColor: otherSeatColor }}>
                        <span style={styles.avatarText}>{otherSeat}</span>
                    </div>
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
                    const seatColor = isMe ? mySeatColor : otherSeatColor;

                    return (
                        <div key={index} style={{
                            ...styles.messageRow,
                            justifyContent: isMe ? "flex-end" : "flex-start",
                            marginBottom: "12px"
                        }}>
                            {!isMe && showAvatar && (
                                <div style={{ ...styles.messageAvatar, backgroundColor: seatColor }}>
                                    {msg.fromSeat}
                                </div>
                            )}

                            <div style={{
                                ...styles.messageBubble,
                                backgroundColor: isMe ? seatColor : "#E9EDF0",
                                color: isMe ? "#FFFFFF" : "#333333",
                                borderBottomLeftRadius: !isMe && !showAvatar ? 8 : 20,
                                borderBottomRightRadius: isMe && !showAvatar ? 8 : 20,
                                borderTopLeftRadius: isMe ? 20 : (showAvatar ? 4 : 20),
                                borderTopRightRadius: !isMe ? 20 : (showAvatar ? 4 : 20),
                                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                                border: isMe ? "none" : "1px solid #D1D9E0"
                            }}>
                                <div style={styles.messageText}>{msg.message}</div>
                                <div style={{
                                    ...styles.messageTime,
                                    color: isMe ? "rgba(255, 255, 255, 0.8)" : "#666666"
                                }}>
                                    {formatTime(msg.timestamp)}
                                </div>
                            </div>

                            {isMe && showAvatar && (
                                <div style={{ ...styles.messageAvatar, backgroundColor: seatColor }}>
                                    {msg.fromSeat}
                                </div>
                            )}
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
                    placeholder="Type a message..."
                    style={styles.input}
                />
                <button
                    onClick={sendMessage}
                    style={{
                        ...styles.button,
                        backgroundColor: mySeatColor,
                        opacity: message.trim() ? 1 : 0.7,
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
        backgroundColor: "#F5F7FA",
        color: "#333333",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    header: {
        display: "flex",
        alignItems: "center",
        padding: "16px 20px",
        borderBottom: "1px solid #D1D9E0",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    avatarContainer: {
        marginRight: "14px",
    },
    avatar: {
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    avatarText: {
        color: "#FFFFFF",
        fontSize: "16px",
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        margin: 0,
        fontSize: "18px",
        fontWeight: "600",
        color: "#333333",
    },
    typing: {
        fontSize: "12px",
        color: "#666666",
        marginTop: "4px",
        fontStyle: "italic",
    },
    chatBox: {
        flex: 1,
        overflowY: "auto",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F5F7FA",
    },
    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "#666666",
        textAlign: "center",
        fontSize: "16px",
    },
    messageRow: {
        display: "flex",
        alignItems: "flex-end",
        marginBottom: "4px",
    },
    messageAvatar: {
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        color: "#FFFFFF",
        margin: "0 8px",
    },
    messageBubble: {
        padding: "12px 16px",
        maxWidth: "70%",
        position: "relative",
        wordWrap: "break-word",
    },
    messageText: {
        fontSize: "15px",
        lineHeight: "1.4",
        wordBreak: "break-word",
        fontWeight: "400",
    },
    messageTime: {
        fontSize: "11px",
        textAlign: "right",
        marginTop: "5px",
    },
    inputContainer: {
        display: "flex",
        alignItems: "center",
        padding: "16px 20px",
        borderTop: "1px solid #D1D9E0",
        backgroundColor: "#FFFFFF",
    },
    input: {
        flex: 1,
        padding: "12px 16px",
        borderRadius: "24px",
        border: "1px solid #D1D9E0",
        backgroundColor: "#FFFFFF",
        color: "#333333",
        outline: "none",
        fontSize: "15px",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    },
    button: {
        marginLeft: "12px",
        padding: "10px 18px",
        border: "none",
        borderRadius: "20px",
        color: "#FFFFFF",
        fontWeight: "600",
        cursor: "pointer",
        fontSize: "15px",
        transition: "all 0.2s ease",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
};

export default ChatRoom;