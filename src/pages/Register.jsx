
// src/pages/Register.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../redux/slices/authSlice";
import { FaUserAlt, FaLock, FaEnvelope } from "react-icons/fa";
const illustration = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwoOybZyR8PaEZi9DSPbDYOd4HYLctFEvd2w&s"


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
      const request = await fetch("http://localhost:8000/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const response = await request.json()
      console.log("Response: ", response)
      dispatch()
    } catch (e) {
      console.log("Error: ", e)
    }
    // const res = await dispatch(registerUser(formData));
    // if (res.meta.requestStatus === "fulfilled") navigate("/login");
  };

  return (
    <div className="min-h-screen text-base-300 flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl flex p-6 w-full max-w-4xl">
        <div className="w-1/2 hidden md:flex items-center justify-center">
          <img src={illustration} alt="register" className="w-3/4" />
        </div>
        <form className="w-full md:w-1/2 flex flex-col gap-4" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-center mb-4 text-primary">Регистрация</h2>
          <div className="flex items-center border p-2 rounded">
            <FaUserAlt className="mr-2 text-gray-500" />
            <input name="username" value={formData.username} onChange={handleChange} required placeholder="Username" className="w-full outline-none" />
          </div>
          <div className="flex items-center border p-2 rounded">
            <FaEnvelope className="mr-2 text-gray-500" />
            <input name="email" value={formData.email} onChange={handleChange} required placeholder="Email" className="w-full outline-none" />
          </div>
          <div className="flex items-center border p-2 rounded">
            <FaLock className="mr-2 text-gray-500" />
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Password" className="w-full outline-none" />
          </div>
          <button type="submit" className="btn btn-primary btn-soft">Зарегистрироваться</button>
        </form>
      </div>
    </div>
  );
}