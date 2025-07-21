import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../redux/slices/authSlice";
import { FaLock, FaEnvelope } from "react-icons/fa";
import { toast } from "react-toastify";

const illustration = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwoOybZyR8PaEZi9DSPbDYOd4HYLctFEvd2w&s";

export default function Login() {
  const isAuth = useSelector(state => state.auth.isAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-sky-100 to-blue-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl flex w-full max-w-5xl overflow-hidden">
        <div className="w-1/2 hidden md:flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
          <img src={illustration} alt="login" className="w-4/5" />
        </div>
        <form className="w-full md:w-1/2 p-10 flex flex-col gap-6" onSubmit={handleSubmit}>
          <h2 className="text-3xl font-bold text-center text-gray-800">Вход в систему</h2>

          <div className="flex items-center border border-gray-300 p-3 rounded-xl shadow-sm bg-gray-50">
            <FaEnvelope className="mr-3 text-gray-500" />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email"
              className="w-full outline-none bg-transparent text-base-100"
            />
          </div>

          <div className="flex items-center border border-gray-300 p-3 rounded-xl shadow-sm bg-gray-50">
            <FaLock className="mr-3 text-gray-500" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Пароль"
              className="w-full outline-none bg-transparent text-base-100"
            />
          </div>

          <button type="submit" className="btn bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-semibold">
            Войти
          </button>

          <p className="text-center text-sm text-gray-500">
            Нет аккаунта? <Link to="/register" className="text-indigo-600 hover:underline">Зарегистрируйтесь</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
