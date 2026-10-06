import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username || undefined,
          email: email || undefined,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);

      navigate("/dashboard");
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">DRELLO</div>

        <div className="auth-message">
          <p className="section-label">WELCOME BACK</p>

          <h1>
            KEEP
            <br />
            MOVING.
          </h1>

          <p>Your plans are waiting. Pick up where you left off.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <p className="auth-label">LOGIN</p>

          <h2>Welcome back.</h2>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Username</label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="piyush"
              />
            </div>

            <div className="input-or">OR</div>

            <div className="input-group">
              <label>Email</label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="input-group">
              <label>Password</label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button className="auth-button" type="submit">
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;
