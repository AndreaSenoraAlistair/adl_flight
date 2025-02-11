import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ React Router for navigation

const LoginForm = ({ setIsLoggedIn }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        seatNumber: "",
        source: "",
        destination: "",
    });
    const [errorMessage, setErrorMessage] = useState(""); // ✅ Handle login errors
    const navigate = useNavigate(); // ✅ React Router Navigation

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json" // Ensures the backend understands JSON
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(errorData.message || "Login failed. Try again.");
            } else {
                const responseData = await response.json();
                console.log("Success:", responseData);

                // ✅ Store seat number for chat system
                localStorage.setItem("seatNumber", formData.seatNumber);

                setIsLoggedIn(true); // ✅ Update login state
                navigate("/"); // ✅ Redirect to the Moments page
            }
        } catch (error) {
            setErrorMessage("Network error. Please try again.");
            console.error("Network Error:", error);
        }
    };

    return (
        <div style={containerStyle}>
            <form onSubmit={handleSubmit} style={formStyle}>
                <h2 style={headingStyle}>Login</h2>

                {errorMessage && <p style={errorStyle}>{errorMessage}</p>} {/* ✅ Display errors */}

                <label style={labelStyle}>Full Name:</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required style={inputStyle} />

                <label style={labelStyle}>Seat Number:</label>
                <input type="text" name="seatNumber" value={formData.seatNumber} onChange={handleChange} required style={inputStyle} />

                <label style={labelStyle}>Source:</label>
                <input type="text" name="source" value={formData.source} onChange={handleChange} required style={inputStyle} />

                <label style={labelStyle}>Destination:</label>
                <input type="text" name="destination" value={formData.destination} onChange={handleChange} required style={inputStyle} />

                <button type="submit" style={buttonStyle}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#6B46C1"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#805AD5"}>
                    Submit
                </button>
            </form>
        </div>
    );
};

// Styling objects
const containerStyle = { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#1A202C" };
const formStyle = { backgroundColor: "#2D3748", padding: "24px", borderRadius: "8px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", width: "24rem" };
const headingStyle = { color: "#fff", fontSize: "1.5rem", fontWeight: "bold", textAlign: "center", marginBottom: "16px" };
const labelStyle = { display: "block", color: "#A0AEC0" };
const inputStyle = { width: "100%", padding: "8px", marginTop: "4px", marginBottom: "12px", backgroundColor: "#4A5568", color: "white", border: "1px solid #718096", borderRadius: "6px", outline: "none" };
const buttonStyle = { width: "100%", marginTop: "16px", padding: "8px", backgroundColor: "#805AD5", color: "white", fontWeight: "600", borderRadius: "6px", cursor: "pointer", transition: "background-color 0.2s" };
const errorStyle = { color: "red", textAlign: "center", marginBottom: "10px" };

export default LoginForm;
