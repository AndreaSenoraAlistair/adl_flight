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

        const chatRequestData = { fromSeat: seatNumber, toSeat: inputSeat };
        console.log("Sending Chat Request:", chatRequestData);  // ✅ Debug Log

        // Send chat request via WebSocket
        socket.emit("send_chat_request", chatRequestData);

        // Send chat request to backend for storage
        await fetch("http://localhost:5000/api/chat/send-request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(chatRequestData),
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
            <h2 style={styles.heading}>✈️ Moments - Seat-to-Seat Chat</h2>

            <div style={styles.inputContainer}>
                <input
                    type="text"
                    placeholder="Enter Seat Number"
                    onChange={(e) => setInputSeat(e.target.value)}
                    value={inputSeat}
                    style={styles.input}
                />
                <button onClick={handleSendRequest} style={styles.button}>
                    Send Request
                </button>
            </div>

            <h3 style={styles.subHeading}>Incoming Chat Requests</h3>
            {chatRequests.length > 0 ? (
                chatRequests.map((fromSeat, index) => (
                    <div key={index} style={styles.requestBox}>
                        <p>🛫 Chat request from <strong>Seat {fromSeat}</strong></p>
                        <button onClick={() => handleAcceptRequest(fromSeat)} style={styles.acceptButton}>
                            Accept
                        </button>
                    </div>
                ))
            ) : (
                <p style={styles.noRequests}>No chat requests yet.</p>
            )}
        </div>
    );
};

// Styles (Dark Theme)
const styles = {
    container: {
        backgroundColor: "#121212",
        color: "#E0E0E0",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
    },
    heading: {
        fontSize: "28px",
        fontWeight: "bold",
        marginBottom: "20px",
        color: "#00bcd4",
        textAlign: "center",
    },
    inputContainer: {
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
    },
    input: {
        padding: "12px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#1E1E1E",
        color: "#E0E0E0",
        outline: "none",
        width: "220px",
        textAlign: "center",
    },
    button: {
        backgroundColor: "#00bcd4",
        color: "#121212",
        padding: "12px 20px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        transition: "0.3s ease-in-out",
    },
    buttonHover: {
        backgroundColor: "#0097a7",
    },
    subHeading: {
        fontSize: "20px",
        fontWeight: "bold",
        marginBottom: "10px",
        color: "#f50057",
    },
    requestBox: {
        backgroundColor: "#1E1E1E",
        padding: "15px",
        borderRadius: "10px",
        margin: "10px 0",
        width: "280px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 10px rgba(0, 188, 212, 0.3)",
    },
    acceptButton: {
        backgroundColor: "#f50057",
        color: "#fff",
        border: "none",
        padding: "8px 15px",
        fontSize: "14px",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "0.3s ease-in-out",
    },
    acceptButtonHover: {
        backgroundColor: "#c51162",
    },
    noRequests: {
        color: "#757575",
        fontStyle: "italic",
    },
};

export default Moments;
