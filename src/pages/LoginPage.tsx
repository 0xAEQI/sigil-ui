import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const [secret, setSecret] = useState("");
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(secret);
    if (ok) navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-avatar">S</div>
        <h1 className="login-title">Sigil</h1>
        <p className="login-subtitle">Your shadow awaits</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            className="login-input"
            type="password"
            placeholder="Access key"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            autoFocus
          />
          {error && <div className="login-error">{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
