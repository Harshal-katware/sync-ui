import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import bg from "../assets/restro4.jpg";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("All fields are required!"); return; }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/api/super-admin/auth/login", {
        email, password,
      });

      const { token, name, email: userEmail, role, contactNumber } = res.data;

      // ✅ Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userName", name);
      localStorage.setItem("userEmail", userEmail);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userContact", contactNumber ?? "");
      localStorage.setItem("subscriptionStatus", "ACTIVE");
      localStorage.setItem("subscriptionEnd", "");

      navigate("/super-admin");
    } catch (err: any) {
      setError("Invalid email or password!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
         style={{ backgroundImage: `url(${bg})` }}>
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 w-full max-w-sm p-8 text-white text-center">

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">👑</span>
        </div>

        <h1 className="text-2xl font-bold mb-1">Super Admin</h1>
        <p className="text-white/60 text-sm mb-8">Restricted Access Only</p>

        <div className="space-y-4 text-left">
          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 transition pr-10"
            />
            <span onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-3 cursor-pointer text-white/60 hover:text-white">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm mt-3 text-left">⚠ {error}</p>
        )}

        <button onClick={handleLogin} disabled={loading}
          className="w-full mt-6 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2.5 rounded-lg transition disabled:opacity-60 active:scale-95">
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-white/40 text-xs mt-6">
          This page is for authorized personnel only.
        </p>
      </div>
    </div>
  );
}