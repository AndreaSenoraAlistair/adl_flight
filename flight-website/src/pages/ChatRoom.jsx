import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import "../pages/ChatRoom.css";


const socket = io("http://localhost:5000");

const ChatRoom = () => {
    const { seatNumber, chatPartner } = useParams();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        socket.emit("join", seatNumber);
        socket.emit("join_chat", { seat1: seatNumber, seat2: chatPartner });

        socket.on("receive_message", (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.off("receive_message");
        };
    }, [seatNumber, chatPartner]);

    const sendMessage = () => {
        if (message.trim() === "") return;

        const newMessage = {
            fromSeat: seatNumber,
            toSeat: chatPartner,
            message,
        };

        socket.emit("send_message", newMessage);
        setMessages((prev) => [...prev, newMessage]);
        setMessage("");
    };

    return (
        <div className="chat-room">
            <h2>Chat with Seat {chatPartner}</h2>
            <div className="messages">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.fromSeat === seatNumber ? "sent" : "received"}`}
                    >
                        <strong>{msg.fromSeat}: </strong> {msg.message}
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatRoom;
