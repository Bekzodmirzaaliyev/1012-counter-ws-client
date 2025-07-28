import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../redux/slices/authSlice";
import { FaLock, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { toast } from "react-toastify";

const illustration = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwoOybZyR8PaEZi9DSPbDYOd4HYLctFEvd2w&s";

export default function Login() {
  const isAuth = useSelector(state => state.auth.isAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const request = await fetch("https://one012-counter-ws-server.onrender.com/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const response = await request.json();

      if (!request.ok) {
        if (request.status === 403) {
          toast.error("⛔ Siz ban qilingansiz!");
        } else if (request.status === 404) {
          toast.error("😕 Foydalanuvchi topilmadi");
        } else {
          toast.error(response.message || "❌ Loginda xatolik yuz berdi");
        }
        return;
      }

      // Muvaffaqiyatli login
      dispatch(login(response));
      navigate("/");
      toast.success("Xush kelibsiz!");
    } catch (e) {
      console.log("Error: ", e);
      toast.error("❌ Server bilan ulanishda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center p-4">
      <div className="card w-full max-w-6xl bg-base-100 shadow-2xl">
        <div className="card-body p-0">
          <div className="flex flex-col lg:flex-row">
            {/* Left side - Illustration */}
            <div className="lg:w-1/2 bg-gradient-to-br from-primary/20 to-secondary/20 p-12 flex flex-col items-center justify-center">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <img 
                    src={illustration} 
                    alt="login" 
                    className="w-72 h-72 object-contain" 
                  />
                  <div className="absolute -top-4 -right-4">
                    <HiSparkles className="text-2xl text-warning animate-pulse" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-primary">Welcome Back!</h3>
                  <p className="text-base-content/70 text-lg leading-relaxed max-w-md">
                    Connect with your friends and colleagues in our modern, secure chat platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Login form */}
            <div className="lg:w-1/2 p-12">
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="text-center space-y-2">
                  <h2 className="text-4xl font-bold text-primary">
                    Sign In
                  </h2>
                  <p className="text-base-content/60">Enter your credentials to access your account</p>
                </div>

                <div className="space-y-6">
                  {/* Email Input */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Email Address</span>
                    </label>
                    <div className="relative">
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                        className="input input-bordered w-full pl-12 focus:input-primary transition-all duration-300"
                      />
                      <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/40" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Enter your password"
                        className="input input-bordered w-full pl-12 pr-12 focus:input-primary transition-all duration-300"
                      />
                      <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/40" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="btn btn-ghost btn-sm absolute right-2 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`btn btn-primary w-full text-lg ${isLoading ? 'loading' : ''}`}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>

                {/* Register Link */}
                <div className="text-center">
                  <p className="text-base-content/60">
                    Don't have an account?{' '}
                    <Link 
                      to="/register" 
                      className="link link-primary font-medium"
                    >
                      Create one here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}