import { useState } from "react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const API_URL =
                import.meta.env.VITE_API_URL ||
                "https://techfest2026-api.onrender.com";

            const response = await fetch(`${API_URL}/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            // Store the token for this browser session.
            sessionStorage.setItem("techfestToken", data.token);

            setMessage(`Welcome, ${data.user.name}! Login successful.`);
        } catch (error) {
            setMessage(
                error.message === "Failed to fetch"
                    ? "Cannot connect to the server. Please try again."
                    : error.message
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="page">
            <h1>Welcome Back 🌸</h1>
            <p>Log in to your TechFest 2026 account.</p>

            <form onSubmit={handleLogin}>
                <label>Email address</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    placeholder="Enter your registered email"
                />

                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                />

                {message && <p role="status">{message}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </main>
    );
}

export default Login;