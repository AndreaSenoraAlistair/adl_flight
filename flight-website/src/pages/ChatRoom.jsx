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

    useEffect(() => {
        if (!seat1 || !seat2) return;

        const roomName = [seat1, seat2].sort().join("-");
        console.log(`🔗 Joining chat room: ${roomName}`);

        // ✅ Join the chat room
        socket.emit("rejoin_chat", { seat1, seat2 });

        // ✅ Listen for incoming messages
        socket.on("receive_message", (data) => {
            console.log("📩 Received message:", data);
            setMessages((prev) => [...prev, data]); // ✅ Update chat UI only when message is received from backend
        });

        return () => {
            socket.off("receive_message"); // ✅ Cleanup listener on unmount
        };
    }, [seat1, seat2, mySeat]);


    const sendMessage = () => {
        if (message.trim() === "") return;

        console.log("🛫 Sending message:", message);

        const roomName = [seat1, seat2].sort().join("-");

        const newMessage = {
            fromSeat: mySeat,
            toSeat: otherSeat,
            message,
            room: roomName,
        };

        socket.emit("send_message", newMessage, (ack) => {
            if (ack && ack.success) {
                console.log("✅ Message successfully sent:", newMessage);
                // setMessages((prev) => [...prev, newMessage]); // ✅ Update UI immediately
                setMessage(""); // Clear input
            } else {
                console.error("❌ Message failed to send", ack?.error);
            }
        });
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Chat with Seat {otherSeat}</h2>

            <div style={styles.chatBox}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            ...styles.message,
                            background: msg.fromSeat === mySeat ? "#007AFF" : "#444",
                            alignSelf: msg.fromSeat === mySeat ? "flex-end" : "flex-start",
                        }}
                    >
                        <strong style={{ color: "#ddd" }}>{msg.fromSeat}: </strong>
                        {msg.message}
                    </div>
                ))}
            </div>

            <div style={styles.inputContainer}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={styles.input}
                />
                <button onClick={sendMessage} style={styles.button}>Send</button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        backgroundColor: "#1e1e1e",
        color: "#fff",
        padding: "20px",
    },
    header: {
        textAlign: "center",
        fontSize: "1.5rem",
        fontWeight: "bold",
        borderBottom: "2px solid #444",
        paddingBottom: "10px",
    },
    chatBox: {
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        padding: "10px",
        gap: "10px",
    },
    message: {
        padding: "10px",
        borderRadius: "8px",
        maxWidth: "75%",
        color: "#fff",
    },
    inputContainer: {
        display: "flex",
        alignItems: "center",
        padding: "10px",
        backgroundColor: "#222",
        borderRadius: "8px",
    },
    input: {
        flex: 1,
        padding: "12px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#333",
        color: "#fff",
        outline: "none",
        marginRight: "10px",
        fontSize: "16px",
    },
    button: {
        padding: "10px 15px",
        backgroundColor: "#007AFF",
        border: "none",
        borderRadius: "8px",
        color: "#fff",
        cursor: "pointer",
        fontSize: "16px",
    },
};

export default ChatRoom;
