import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const ChatRoom = () => {
    const { seat1, seat2 } = useParams();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        socket.emit("join", seat1);
        socket.emit("join_chat", { seat1, seat2 });

        socket.on("receive_message", (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.off("receive_message");
        };
    }, [seat1, seat2]);

    const sendMessage = () => {
        if (message.trim() === "") return;

        const newMessage = {
            fromSeat: seat1,
            toSeat: seat2,
            message,
        };

        socket.emit("send_message", newMessage);
        setMessages((prev) => [...prev, newMessage]);
        setMessage("");
    };

    return (
        <div style={styles.chatContainer}>
            <div style={styles.chatRoom}>
                <div style={styles.header}>Chat with Seat {seat2}</div>
                <div style={styles.messages}>
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            style={{
                                ...styles.message,
                                ...(msg.fromSeat === seat1 ? styles.sent : styles.received),
                            }}
                        >
                            <strong>{msg.fromSeat}: </strong> {msg.message}
                        </div>
                    ))}
                </div>
                <div style={styles.chatInput}>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        style={styles.input}
                    />
                    <button onClick={sendMessage} style={styles.button}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

// ✅ Centered Chat Box with 50% Width
const styles = {
    chatContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f9f9f9",
    },
    chatRoom: {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "50vw",
        textAlign: "center",
        backgroundColor: "white",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
        borderRadius: "10px",
        overflow: "hidden",
    },
    header: {
        textAlign: "center",
        backgroundColor: "#007bff",
        color: "white",
        padding: "15px",
        fontSize: "1.5rem",
        fontWeight: "bold",
    },
    messages: {
        flexGrow: 1,
        padding: "10px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxHeight: "calc(100vh - 120px)",
    },
    message: {
        padding: "10px 15px",
        borderRadius: "15px",
        maxWidth: "70%",
        wordWrap: "break-word",
    },
    sent: {
        alignSelf: "flex-end",
        backgroundColor: "#007bff",
        color: "white",
        borderRadius: "15px 15px 0 15px",
        textAlign: "right",
    },
    received: {
        alignSelf: "flex-start",
        backgroundColor: "#e0e0e0",
        color: "black",
        borderRadius: "15px 15px 15px 0",
    },
    chatInput: {
        display: "flex",
        padding: "10px",
        background: "white",
        borderTop: "1px solid #ddd",
        position: "fixed",
        bottom: 0,
        width: "50vw",
    },
    input: {
        flexGrow: 1,
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        fontSize: "1rem",
        width: "100%",
    },
    button: {
        marginLeft: "10px",
        padding: "10px 15px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "1rem",
    },
};

export default ChatRoom;
