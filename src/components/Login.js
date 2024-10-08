import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase";
import { useNavigate } from "react-router-dom";
import './style.css';  // Import your custom CSS

const auth = getAuth(app);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      navigate("/todolist");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6"> {/* Changed to bg-white */}
      <div className="max-w-md w-full bg-gray-50 shadow-lg rounded-lg p-8 transform transition hover:scale-105 duration-300 ease-in-out">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6"> {/* Updated text color */}
          Log In
        </h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-300" // Added transition
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-300" // Added transition
            />
          </div>
          <button
            type="submit"
            className="w-full bg-pink-600 text-white p-3 rounded-lg shadow-md transition duration-300 hover:bg-pink-700" // Changed button color and added hover effect
          >
            Log In
          </button>
        </form>
        <div className="text-center mt-4">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <a
              href="/"
              className="text-pink-600 hover:underline" // Updated link color
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
