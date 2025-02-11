import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Connect to WebSocket server

const Moments = () => {
    const navigate = useNavigate();
    const [seatNumber, setSeatNumber] = useState("");
    const [chatRequests, setChatRequests] = useState([]);
    const [inputSeat, setInputSeat] = useState("");

    useEffect(() => {
        // Retrieve seat number from localStorage
        const storedSeatNumber = localStorage.getItem("seatNumber");
        if (storedSeatNumber) {
            setSeatNumber(storedSeatNumber);
            socket.emit("join", storedSeatNumber); // Join WebSocket room
        }

        // Listen for incoming chat requests
        socket.on("chat_request", ({ fromSeat }) => {
            setChatRequests((prev) => [...prev, fromSeat]);
        });

        // Listen for chat request accepted event
        socket.on("chat_request_accepted", ({ fromSeat, toSeat }) => {
            // Navigate to chatroom with both seat numbers
            navigate(`/ChatRoom?seat1=${toSeat}&seat2=${fromSeat}`);
        });

        return () => {
            socket.off("chat_request");
            socket.off("chat_request_accepted");
        };
    }, []);

    // Function to check if seat number exists in DB
    const checkSeatNumber = async (seat) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/check-seat/${seat}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            return data.exists; // True if seat exists, false otherwise
        } catch (error) {
            console.error("Error checking seat:", error);
            return false;
        }
    };

    // Function to send chat request
    const handleSendRequest = async () => {
        if (!inputSeat.trim()) {
            alert("Please enter a valid seat number.");
            return;
        }

        const isValidSeat = await checkSeatNumber(inputSeat);

        if (!isValidSeat) {
            alert("Invalid seat number. The user may not be logged in.");
            return;
        }

        // Send chat request via WebSocket
        socket.emit("send_chat_request", { fromSeat: seatNumber, toSeat: inputSeat });

        // Send chat request to backend for storage
        await fetch("http://localhost:5000/api/chat/send-request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fromSeat: seatNumber, toSeat: inputSeat }),
        });

        alert(`Chat request sent to seat ${inputSeat}`);
        setInputSeat(""); // Clear input field
    };

    // Function to accept chat request
    const handleAcceptRequest = async (fromSeat) => {
        socket.emit("accept_chat_request", { fromSeat, toSeat: seatNumber });

        // Update backend chat request status
        await fetch("http://localhost:5000/api/chat/accept-request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fromSeat, toSeat: seatNumber }),
        });

        // Navigate to chatroom
        navigate(`/ChatRoom?seat1=${seatNumber}&seat2=${fromSeat}`);
    };

    return (
        <div style={styles.container}>
            <h2>Moments - Seat-to-Seat Chat</h2>

            <div>
                <label>Enter seat number to chat:</label>
                <input
                    type="text"
                    placeholder="Seat Number"
                    onChange={(e) => setInputSeat(e.target.value)}
                    value={inputSeat}
                    style={styles.input}
                />
                <button onClick={handleSendRequest} style={styles.button}>
                    Send Request
                </button>
            </div>

            <h3>Incoming Chat Requests:</h3>
            {chatRequests.length > 0 ? (
                chatRequests.map((fromSeat, index) => (
                    <div key={index} style={styles.requestBox}>
                        <p>Chat request from Seat {fromSeat}</p>
                        <button onClick={() => handleAcceptRequest(fromSeat)} style={styles.button}>
                            Accept
                        </button>
                    </div>
                ))
            ) : (
                <p>No chat requests</p>
            )}
        </div>
    );
};

// Styles
const styles = {
    container: { padding: "20px", textAlign: "center" },
    input: { margin: "10px", padding: "8px", width: "200px" },
    button: { padding: "8px 12px", background: "blue", color: "white", border: "none", cursor: "pointer" },
    requestBox: { border: "1px solid #ccc", padding: "10px", margin: "10px auto", width: "300px" },
};

export default Moments;
