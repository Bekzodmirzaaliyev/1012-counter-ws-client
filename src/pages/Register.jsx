import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../redux/slices/authSlice";
import { FaUserAlt, FaLock, FaEnvelope } from "react-icons/fa";

const illustration = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwoOybZyR8PaEZi9DSPbDYOd4HYLctFEvd2w&s";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    try {
      const request = await fetch("https://one012-counter-ws-server.onrender.com/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const response = await request.json();
      if (response.message === "Такой email уже существует") throw new Error(response.message);

      console.log("Response: ", response);
      dispatch(register(response));
      navigate("/");
    } catch (e) {
      console.log("Error: ", e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-100 to-indigo-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl flex w-full max-w-5xl overflow-hidden">
        <div className="w-1/2 hidden md:flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
          <img src={illustration} alt="register" className="w-4/5" />
        </div>
        <form className="w-full md:w-1/2 p-10 flex flex-col gap-6" onSubmit={handleSubmit}>
          <h2 className="text-3xl font-bold text-center text-gray-800">Регистрация</h2>

          <div className="flex items-center border border-gray-300 p-3 rounded-xl shadow-sm bg-gray-50">
            <FaUserAlt className="mr-3 text-gray-500" />
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Имя пользователя"
              className="w-full outline-none bg-transparent text-base-300"
            />
          </div>

          <div className="flex items-center border border-gray-300 p-3 rounded-xl shadow-sm bg-gray-50">
            <FaEnvelope className="mr-3 text-gray-500" />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email"
              className="w-full outline-none bg-transparent text-base-300"
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
              className="w-full outline-none bg-transparent text-base-300"
            />
          </div>

          <button type="submit" className="btn bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-semibold">
            Зарегистрироваться
          </button>

          <p className="text-center text-sm text-gray-500">
            Уже есть аккаунт? <Link to="/login" className="text-indigo-600 hover:underline">Войдите</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
