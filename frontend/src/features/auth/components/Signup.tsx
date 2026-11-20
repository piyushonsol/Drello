import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/authApi";
import "../../../styles/Auth.css";

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await authApi.signup(username, email, password);

      navigate("/login");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">DRELLO</div>

        <div className="auth-message">
          <p className="section-label">BUILT FOR PLANS</p>

          <h1>
            YOUR PLAN
            <br />
            CAN CHANGE.
          </h1>

          <p>
            Create an account and start building plans that can actually evolve.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <p className="auth-label">CREATE ACCOUNT</p>

          <h2>Start building.</h2>

          <form onSubmit={handleSignup}>
            <div className="input-group">
              <label>Username</label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="piyush"
                required
              />
            </div>

            <div className="input-group">
              <label>Email</label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
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
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Signup;
