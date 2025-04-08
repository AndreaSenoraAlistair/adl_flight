import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const Moments = () => {
    const navigate = useNavigate();
    const [seatNumber, setSeatNumber] = useState("");
    const [chatRequests, setChatRequests] = useState([]);
    const [inputSeat, setInputSeat] = useState("");
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });
    const [activeTab, setActiveTab] = useState("connect");

    useEffect(() => {
        // Retrieve seat number from localStorage
        const storedSeatNumber = localStorage.getItem("seatNumber");
        if (storedSeatNumber) {
            setSeatNumber(storedSeatNumber);
            socket.emit("join", storedSeatNumber);
        }

        // Listen for incoming chat requests
        socket.on("chat_request", ({ fromSeat }) => {
            setChatRequests((prev) => [...prev, fromSeat]);
            showNotification(`New chat request from Seat ${fromSeat}`, "info");
        });

        // Listen for chat request accepted event
        socket.on("chat_request_accepted", ({ fromSeat, toSeat }) => {
            navigate(`/ChatRoom?seat1=${toSeat}&seat2=${fromSeat}`);
        });

        return () => {
            socket.off("chat_request");
            socket.off("chat_request_accepted");
        };
    }, [navigate]);

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    };

    // Function to check if seat number exists in DB
    const checkSeatNumber = async (seat) => {
        try {
            const response = await fetch(`http://localhost:5000/api/passengers/check-seat/${seat}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error("Error checking seat:", error);
            return false;
        }
    };

    // Function to send chat request
    const handleSendRequest = async () => {
        if (!inputSeat.trim()) {
            showNotification("Please enter a valid seat number", "error");
            return;
        }

        if (inputSeat === seatNumber) {
            showNotification("You cannot send a request to yourself", "error");
            return;
        }

        setLoading(true);
        const isValidSeat = await checkSeatNumber(inputSeat);

        if (!isValidSeat) {
            showNotification("Invalid seat number. The user may not be logged in", "error");
            setLoading(false);
            return;
        }

        const chatRequestData = { fromSeat: seatNumber, toSeat: inputSeat };
        console.log("Sending Chat Request:", chatRequestData);

        // Send chat request via WebSocket
        socket.emit("send_chat_request", chatRequestData);

        // Send chat request to backend for storage
        try {
            await fetch("http://localhost:5000/api/chat/send-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(chatRequestData),
            });

            showNotification(`Chat request sent to seat ${inputSeat}`, "success");
            setInputSeat("");
        } catch (error) {
            showNotification("Failed to send request. Please try again", "error");
            console.error("Error sending request:", error);
        }

        setLoading(false);
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
        <div style={styles.pageContainer}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.logo}>✈️ SkyConnect</div>
                <div style={styles.userInfo}>
                    <div style={styles.seatBadge}>Seat {seatNumber}</div>
                </div>
            </div>

            {/* Main Content */}
            <div style={styles.contentContainer}>
                {/* Left Sidebar - Hidden on mobile, shown as bottom nav on mobile */}
                <div style={styles.sidebar}>
                    <div
                        style={{ ...styles.sidebarItem, ...(activeTab === "connect" ? styles.activeSidebarItem : {}) }}
                        onClick={() => setActiveTab("connect")}
                    >
                        <span style={styles.sidebarIcon}>🔗</span>
                        <span style={styles.sidebarText}>Connect</span>
                    </div>
                    <div
                        style={{ ...styles.sidebarItem, ...(activeTab === "requests" ? styles.activeSidebarItem : {}) }}
                        onClick={() => setActiveTab("requests")}
                    >
                        <span style={styles.sidebarIcon}>📩</span>
                        <span style={styles.sidebarText}>Requests</span>
                        {chatRequests.length > 0 && (
                            <span style={styles.badgeCounter}>{chatRequests.length}</span>
                        )}
                    </div>
                    {/* <div style={styles.sidebarItem}>
                        <span style={styles.sidebarIcon}>👥</span>
                        <span style={styles.sidebarText}>Activities</span>
                    </div>
                    <div style={styles.sidebarItem}>
                        <span style={styles.sidebarIcon}>⚙️</span>
                        <span style={styles.sidebarText}>Settings</span>
                    </div> */}
                </div>

                {/* Mobile Bottom Navigation */}
                <div style={styles.mobileNav}>
                    <div
                        style={{ ...styles.mobileNavItem, ...(activeTab === "connect" ? styles.activeMobileNavItem : {}) }}
                        onClick={() => setActiveTab("connect")}
                    >
                        <span style={styles.mobileNavIcon}>🔗</span>
                        <span style={styles.mobileNavText}>Connect</span>
                    </div>
                    <div
                        style={{ ...styles.mobileNavItem, ...(activeTab === "requests" ? styles.activeMobileNavItem : {}) }}
                        onClick={() => setActiveTab("requests")}
                    >
                        <span style={styles.mobileNavIcon}>📩</span>
                        {chatRequests.length > 0 && (
                            <span style={styles.mobileBadgeCounter}>{chatRequests.length}</span>
                        )}
                        <span style={styles.mobileNavText}>Requests</span>
                    </div>
                    {/* <div style={styles.mobileNavItem}>
                        <span style={styles.mobileNavIcon}>👥</span>
                        <span style={styles.mobileNavText}>Activities</span>
                    </div>
                    <div style={styles.mobileNavItem}>
                        <span style={styles.mobileNavIcon}>⚙️</span>
                        <span style={styles.mobileNavText}>Settings</span>
                    </div> */}
                </div>

                {/* Main Area */}
                <div style={styles.mainContent}>
                    {activeTab === "connect" && (
                        <div style={styles.connectTab}>
                            <h2 style={styles.heading}>Connect with a Fellow Traveler</h2>
                            <p style={styles.subtext}>
                                Enter the seat number of the passenger you'd like to chat with.
                            </p>

                            <div style={styles.inputCardContainer}>
                                <div style={styles.inputCard}>
                                    <div style={styles.cardIcon}>🪑</div>
                                    <div style={styles.cardContent}>
                                        <label style={styles.inputLabel}>Seat Number</label>
                                        <div style={styles.inputRow}>
                                            <input
                                                type="text"
                                                placeholder="e.g. 24A"
                                                value={inputSeat}
                                                onChange={(e) => setInputSeat(e.target.value)}
                                                style={styles.input}
                                            />
                                            <button
                                                onClick={handleSendRequest}
                                                disabled={loading}
                                                style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                                            >
                                                {loading ? "Sending..." : "Send Request"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.infoSection}>
                                <h3 style={styles.infoTitle}>Tips for a great connection</h3>
                                <ul style={styles.tipsList}>
                                    <li>Introduce yourself and share your travel purpose</li>
                                    <li>Ask about their destination and recommendations</li>
                                    <li>Share travel experiences or tips</li>
                                    <li>Be respectful of privacy and boundaries</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === "requests" && (
                        <div style={styles.requestsTab}>
                            <h2 style={styles.heading}>Incoming Chat Requests</h2>
                            <p style={styles.subtext}>
                                Passengers who would like to connect with you during the flight.
                            </p>

                            <div style={styles.requestsList}>
                                {chatRequests.length > 0 ? (
                                    chatRequests.map((fromSeat, index) => (
                                        <div key={index} style={styles.requestCard}>
                                            <div style={styles.requestInfo}>
                                                <div style={styles.requestSeatIcon}>🪑</div>
                                                <div>
                                                    <h4 style={styles.requestSeatNumber}>Seat {fromSeat}</h4>
                                                    <p style={styles.requestText}>would like to chat with you</p>
                                                </div>
                                            </div>
                                            <div style={styles.requestActions}>
                                                <button
                                                    onClick={() => handleAcceptRequest(fromSeat)}
                                                    style={styles.acceptButton}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    style={styles.declineButton}
                                                    onClick={() => {
                                                        setChatRequests(prev => prev.filter(seat => seat !== fromSeat));
                                                        showNotification("Request declined", "info");
                                                    }}
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={styles.emptyState}>
                                        <div style={styles.emptyIcon}>📭</div>
                                        <p style={styles.emptyText}>No chat requests yet</p>
                                        <p style={styles.emptySubtext}>
                                            When fellow passengers send you a request, it will appear here
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Notification */}
            {notification.show && (
                <div style={{
                    ...styles.notification,
                    backgroundColor: notification.type === "error" ? "#FEE2E2" :
                        notification.type === "success" ? "#ECFDF5" : "#E0F2FE"
                }}>
                    <span style={{
                        ...styles.notificationIcon,
                        color: notification.type === "error" ? "#EF4444" :
                            notification.type === "success" ? "#10B981" : "#3B82F6"
                    }}>
                        {notification.type === "error" ? "❌" :
                            notification.type === "success" ? "✅" : "ℹ️"}
                    </span>
                    <span style={styles.notificationText}>{notification.message}</span>
                </div>
            )}
        </div>
    );
}
// Enhanced Styles
const styles = {
    pageContainer: {
        backgroundColor: "#F9FAFB",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
    },
    header: {
        backgroundColor: "#FFFFFF",
        padding: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #E5E7EB",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        '@media (min-width: 768px)': {
            padding: "1rem 2rem",
        },
    },
    logo: {
        fontSize: "1.25rem",
        fontWeight: "bold",
        color: "#1F2937",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        '@media (min-width: 768px)': {
            fontSize: "1.5rem",
        },
    },
    userInfo: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        '@media (min-width: 768px)': {
            gap: "1rem",
        },
    },
    seatBadge: {
        backgroundColor: "#6D28D9",
        color: "white",
        padding: "0.25rem 0.75rem",
        borderRadius: "9999px",
        fontWeight: "medium",
        fontSize: "0.75rem",
        '@media (min-width: 768px)': {
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
        },
    },
    contentContainer: {
        display: "flex",
        flex: "1",
        flexDirection: "column",
        '@media (min-width: 768px)': {
            flexDirection: "row",
        },
    },
    sidebar: {
        display: "none",
        '@media (min-width: 768px)': {
            display: "block",
            width: "240px",
            backgroundColor: "#FFFFFF",
            padding: "2rem 0",
            borderRight: "1px solid #E5E7EB",
        },
    },
    sidebarItem: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.75rem 1.5rem",
        color: "#4B5563",
        cursor: "pointer",
        position: "relative",
        fontSize: "1rem",
        transition: "background-color 0.2s, color 0.2s",
    },
    sidebarText: {
        display: "inline",
        '@media (min-width: 768px)': {
            display: "inline",
        },
    },
    activeSidebarItem: {
        backgroundColor: "#F3E8FF",
        color: "#6D28D9",
        borderRight: "3px solid #6D28D9",
    },
    sidebarIcon: {
        fontSize: "1.25rem",
    },
    badgeCounter: {
        position: "absolute",
        right: "1.5rem",
        backgroundColor: "#EF4444",
        color: "white",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: "bold",
        minWidth: "1.25rem",
        height: "1.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 0.25rem",
    },
    mobileNav: {
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid #E5E7EB",
        padding: "0.5rem 0",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        '@media (min-width: 768px)': {
            display: "none",
        },
    },
    mobileNavItem: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.5rem",
        color: "#4B5563",
        cursor: "pointer",
        fontSize: "0.75rem",
        position: "relative",
        flex: 1,
    },
    activeMobileNavItem: {
        color: "#6D28D9",
    },
    mobileNavIcon: {
        fontSize: "1.25rem",
        marginBottom: "0.25rem",
    },
    mobileNavText: {
        fontSize: "0.75rem",
    },
    mobileBadgeCounter: {
        position: "absolute",
        top: "0.25rem",
        right: "25%",
        backgroundColor: "#EF4444",
        color: "white",
        borderRadius: "9999px",
        fontSize: "0.625rem",
        fontWeight: "bold",
        minWidth: "1rem",
        height: "1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 0.125rem",
    },
    mainContent: {
        flex: "1",
        padding: "1rem",
        backgroundColor: "#F9FAFB",
        overflowY: "auto",
        marginBottom: "60px", // Space for mobile nav
        '@media (min-width: 768px)': {
            padding: "2rem",
            marginBottom: 0,
        },
    },
    heading: {
        fontSize: "1.25rem",
        fontWeight: "bold",
        color: "#1F2937",
        marginBottom: "0.5rem",
        '@media (min-width: 768px)': {
            fontSize: "1.5rem",
        },
    },
    subtext: {
        color: "#6B7280",
        marginBottom: "1.5rem",
        fontSize: "0.875rem",
        '@media (min-width: 768px)': {
            marginBottom: "2rem",
            fontSize: "1rem",
        },
    },
    inputCardContainer: {
        marginBottom: "1.5rem",
        '@media (min-width: 768px)': {
            marginBottom: "2rem",
        },
    },
    inputCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: "0.5rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        padding: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        '@media (min-width: 768px)': {
            padding: "1.5rem",
            gap: "1.5rem",
        },
    },
    cardIcon: {
        fontSize: "1.5rem",
        '@media (min-width: 768px)': {
            fontSize: "2rem",
        },
    },
    cardContent: {
        flex: "1",
    },
    inputLabel: {
        display: "block",
        fontSize: "0.875rem",
        fontWeight: "500",
        color: "#4B5563",
        marginBottom: "0.5rem",
    },
    inputRow: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        '@media (min-width: 768px)': {
            flexDirection: "row",
        },
    },
    input: {
        flex: "1",
        padding: "0.75rem 1rem",
        borderRadius: "0.375rem",
        border: "1px solid #D1D5DB",
        fontSize: "1rem",
        color: "#1F2937",
        outline: "none",
        transition: "border-color 0.2s",
    },
    button: {
        backgroundColor: "#6D28D9",
        color: "white",
        border: "none",
        borderRadius: "0.375rem",
        padding: "0.75rem 1rem",
        fontSize: "1rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background-color 0.2s",
        width: "100%",
        '@media (min-width: 768px)': {
            width: "auto",
            padding: "0.75rem 1.5rem",
        },
    },
    buttonDisabled: {
        backgroundColor: "#9CA3AF",
        cursor: "not-allowed",
    },
    infoSection: {
        backgroundColor: "#FFFFFF",
        borderRadius: "0.5rem",
        padding: "1rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        '@media (min-width: 768px)': {
            padding: "1.5rem",
        },
    },
    infoTitle: {
        fontSize: "1rem",
        fontWeight: "medium",
        color: "#1F2937",
        marginBottom: "1rem",
        '@media (min-width: 768px)': {
            fontSize: "1.125rem",
        },
    },
    tipsList: {
        paddingLeft: "1rem",
        color: "#4B5563",
        fontSize: "0.875rem",
        '@media (min-width: 768px)': {
            paddingLeft: "1.5rem",
            fontSize: "1rem",
        },
    },
    requestsList: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    requestCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: "0.5rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        '@media (min-width: 768px)': {
            padding: "1.5rem",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
    },
    requestInfo: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
    },
    requestSeatIcon: {
        fontSize: "1.25rem",
        backgroundColor: "#F3E8FF",
        color: "#6D28D9",
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        '@media (min-width: 768px)': {
            fontSize: "1.5rem",
            width: "3rem",
            height: "3rem",
        },
    },
    requestSeatNumber: {
        fontSize: "1rem",
        fontWeight: "medium",
        color: "#1F2937",
        margin: "0 0 0.25rem 0",
        '@media (min-width: 768px)': {
            fontSize: "1.125rem",
        },
    },
    requestText: {
        color: "#6B7280",
        margin: 0,
        fontSize: "0.875rem",
        '@media (min-width: 768px)': {
            fontSize: "1rem",
        },
    },
    requestActions: {
        display: "flex",
        gap: "0.75rem",
        justifyContent: "flex-end",
    },
    acceptButton: {
        backgroundColor: "#6D28D9",
        color: "white",
        border: "none",
        borderRadius: "0.375rem",
        padding: "0.5rem 1rem",
        fontSize: "0.875rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background-color 0.2s",
    },
    declineButton: {
        backgroundColor: "transparent",
        color: "#6B7280",
        border: "1px solid #D1D5DB",
        borderRadius: "0.375rem",
        padding: "0.5rem 1rem",
        fontSize: "0.875rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background-color 0.2s, color 0.2s",
    },
    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem 0",
        color: "#6B7280",
        '@media (min-width: 768px)': {
            padding: "3rem 0",
        },
    },
    emptyIcon: {
        fontSize: "2.5rem",
        marginBottom: "1rem",
        '@media (min-width: 768px)': {
            fontSize: "3rem",
        },
    },
    emptyText: {
        fontSize: "1rem",
        fontWeight: "medium",
        margin: "0 0 0.5rem 0",
        '@media (min-width: 768px)': {
            fontSize: "1.125rem",
        },
    },
    emptySubtext: {
        color: "#9CA3AF",
        textAlign: "center",
        maxWidth: "300px",
        fontSize: "0.875rem",
        '@media (min-width: 768px)': {
            fontSize: "1rem",
        },
    },
    notification: {
        position: "fixed",
        bottom: "5rem",
        left: "1rem",
        right: "1rem",
        padding: "1rem",
        borderRadius: "0.5rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        zIndex: 100,
        '@media (min-width: 768px)': {
            bottom: "2rem",
            left: "auto",
            right: "2rem",
            maxWidth: "400px",
            padding: "1rem 1.5rem",
        },
    },
    notificationIcon: {
        fontSize: "1.25rem",
    },
    notificationText: {
        color: "#1F2937",
    },
};

export default Moments;