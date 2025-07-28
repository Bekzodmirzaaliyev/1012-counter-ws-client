import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../redux/slices/authSlice";
import { FaUserAlt, FaLock, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";
import { HiSparkles, HiUserPlus } from "react-icons/hi2";
import { toast } from "react-toastify";

const illustration = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwoOybZyR8PaEZi9DSPbDYOd4HYLctFEvd2w&s";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
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
      const request = await fetch("https://one012-counter-ws-server.onrender.com/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const response = await request.json();
      
      if (!request.ok) {
        if (response.message === "Такой email уже существует") {
          toast.error("📧 Bu email allaqachon ro'yxatdan o'tgan");
        } else {
          toast.error(response.message || "❌ Ro'yxatdan o'tishda xatolik");
        }
        return;
      }

      console.log("Response: ", response);
      dispatch(register(response));
      navigate("/");
      toast.success("🎉 Muvaffaqiyatli ro'yxatdan o'tdingiz!");
    } catch (e) {
      console.log("Error: ", e);
      toast.error("❌ Server bilan ulanishda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-accent to-primary flex items-center justify-center p-4">
      <div className="card w-full max-w-6xl bg-base-100 shadow-2xl">
        <div className="card-body p-0">
          <div className="flex flex-col lg:flex-row">
            {/* Left side - Illustration */}
            <div className="lg:w-1/2 bg-gradient-to-br from-secondary/20 to-accent/20 p-12 flex flex-col items-center justify-center">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <img 
                    src={illustration} 
                    alt="register" 
                    className="w-72 h-72 object-contain" 
                  />
                  <div className="absolute -top-4 -right-4">
                    <HiSparkles className="text-2xl text-warning animate-pulse" />
                  </div>
                  <div className="absolute -bottom-2 -left-2">
                    <HiUserPlus className="text-xl text-success animate-bounce" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-secondary">Join Our Community!</h3>
                  <p className="text-base-content/70 text-lg leading-relaxed max-w-md">
                    Create your account and start connecting with people around the world in our secure platform.
                  </p>
                  <div className="flex justify-center space-x-2">
                    <div className="badge badge-primary">Secure</div>
                    <div className="badge badge-secondary">Fast</div>
                    <div className="badge badge-accent">Modern</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Register form */}
            <div className="lg:w-1/2 p-12">
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="text-center space-y-2">
                  <h2 className="text-4xl font-bold text-secondary">
                    Create Account
                  </h2>
                  <p className="text-base-content/60">Fill in your details to get started</p>
                </div>

                <div className="space-y-6">
                  {/* Username Input */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Username</span>
                    </label>
                    <div className="relative">
                      <input
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        placeholder="Enter your username"
                        className="input input-bordered w-full pl-12 focus:input-secondary transition-all duration-300"
                      />
                      <FaUserAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/40" />
                    </div>
                  </div>

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
                        className="input input-bordered w-full pl-12 focus:input-secondary transition-all duration-300"
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
                        placeholder="Create a strong password"
                        className="input input-bordered w-full pl-12 pr-12 focus:input-secondary transition-all duration-300"
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
                    <label className="label">
                      <span className="label-text-alt text-base-content/50">
                        Password should be at least 6 characters
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`btn btn-secondary w-full text-lg ${isLoading ? 'loading' : ''}`}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-base-content/60">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="link link-secondary font-medium"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>

                {/* Terms */}
                <div className="text-center">
                  <p className="text-xs text-base-content/50">
                    By creating an account, you agree to our{' '}
                    <span className="link link-secondary">Terms of Service</span> and{' '}
                    <span className="link link-secondary">Privacy Policy</span>
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