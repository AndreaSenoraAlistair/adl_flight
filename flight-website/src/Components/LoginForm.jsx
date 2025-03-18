import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginForm = ({ setIsLoggedIn }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        seatNumber: "",
        source: "",
        destination: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

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
                    "Accept": "application/json"
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(errorData.message || "Login failed. Try again.");
            } else {
                const responseData = await response.json();
                console.log("Success:", responseData);
                localStorage.setItem("seatNumber", formData.seatNumber);
                setIsLoggedIn(true);
                navigate("/");
            }
        } catch (error) {
            setErrorMessage("Network error. Please try again.");
            console.error("Network Error:", error);
        }
    };

    return (
        <div style={pageContainerStyle}>
            {/* Left side - decorative image */}
            <div style={imageContainerStyle}>
                <div style={overlayStyle}>
                    <h1 style={welcomeTextStyle}>Journey Together</h1>
                    <p style={taglineStyle}>Connect with fellow travelers on your flight</p>
                </div>
            </div>

            {/* Right side - login form */}
            <div style={formContainerStyle}>
                <div style={formWrapperStyle}>
                    <div style={logoContainerStyle}>
                        <div style={logoStyle}>✈️</div>
                        <h2 style={appNameStyle}>SkyConnect</h2>
                    </div>

                    <h2 style={headingStyle}>Welcome Aboard</h2>
                    <p style={subheadingStyle}>Please enter your flight details to continue</p>

                    {errorMessage && <div style={errorContainerStyle}>
                        <p style={errorStyle}>{errorMessage}</p>
                    </div>}

                    <form onSubmit={handleSubmit} style={formStyle}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Full Name</label>
                            <input 
                                type="text" 
                                name="fullName" 
                                value={formData.fullName} 
                                onChange={handleChange} 
                                required 
                                style={inputStyle} 
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Seat Number</label>
                            <input 
                                type="text" 
                                name="seatNumber" 
                                value={formData.seatNumber} 
                                onChange={handleChange} 
                                required 
                                style={inputStyle} 
                                placeholder="e.g. 24A"
                            />
                        </div>

                        <div style={rowContainerStyle}>
                            <div style={halfInputGroupStyle}>
                                <label style={labelStyle}>From</label>
                                <input 
                                    type="text" 
                                    name="source" 
                                    value={formData.source} 
                                    onChange={handleChange} 
                                    required 
                                    style={inputStyle} 
                                    placeholder="e.g. NYC"
                                />
                            </div>
                            <div style={halfInputGroupStyle}>
                                <label style={labelStyle}>To</label>
                                <input 
                                    type="text" 
                                    name="destination" 
                                    value={formData.destination} 
                                    onChange={handleChange} 
                                    required 
                                    style={inputStyle} 
                                    placeholder="e.g. SFO"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            style={buttonStyle}
                            onMouseOver={(e) => e.target.style.backgroundColor = "#4C1D95"}
                            onMouseOut={(e) => e.target.style.backgroundColor = "#6D28D9"}
                        >
                            Start Your Journey
                        </button>
                    </form>

                    <p style={termsStyle}>
                        By logging in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
};

// Enhanced styling
const pageContainerStyle = {
    display: "flex",
    flexDirection: "row",
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#F9FAFB",
};

const imageContainerStyle = {
    flex: "1",
    backgroundImage: "url('https://source.unsplash.com/random/1200x900/?airplane,travel')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(79, 61, 60, 0.7)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
};

const welcomeTextStyle = {
    color: "#FFFFFF",
    fontSize: "3rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    textAlign: "center",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
};

const taglineStyle = {
    color: "#F9FAFB",
    fontSize: "1.25rem",
    textAlign: "center",
    maxWidth: "80%",
    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
};

const formContainerStyle = {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
    backgroundColor: "#FFFFFF",
};

const formWrapperStyle = {
    width: "100%",
    maxWidth: "450px",
    padding: "2rem",
};

const logoContainerStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: "2rem",
};

const logoStyle = {
    fontSize: "2rem",
    marginRight: "0.5rem",
};

const appNameStyle = {
    fontSize: "1.5rem",
    color: "#4B5563",
    fontWeight: "bold",
    margin: 0,
};

const headingStyle = {
    color: "#1F2937",
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
};

const subheadingStyle = {
    color: "#6B7280",
    marginBottom: "2rem",
};

const formStyle = {
    width: "100%",
};

const inputGroupStyle = {
    marginBottom: "1.5rem",
};

const rowContainerStyle = {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
};

const halfInputGroupStyle = {
    flex: 1,
};

const labelStyle = {
    display: "block",
    color: "#4B5563",
    marginBottom: "0.5rem",
    fontWeight: "500",
};

const inputStyle = {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#F9FAFB",
    color: "#1F2937",
    border: "1px solid #D1D5DB",
    borderRadius: "0.375rem",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontSize: "1rem",
};

const buttonStyle = {
    width: "100%",
    padding: "0.875rem",
    backgroundColor: "#6D28D9",
    color: "white",
    fontWeight: "600",
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
    border: "none",
    fontSize: "1rem",
    marginTop: "0.5rem",
};

const errorContainerStyle = {
    backgroundColor: "#FEE2E2",
    borderRadius: "0.375rem",
    padding: "0.75rem",
    marginBottom: "1.5rem",
    borderLeft: "4px solid #EF4444",
};

const errorStyle = {
    color: "#B91C1C",
    margin: 0,
};

const termsStyle = {
    color: "#6B7280",
    fontSize: "0.875rem",
    textAlign: "center",
    marginTop: "2rem",
};

export default LoginForm;