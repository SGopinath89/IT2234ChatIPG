import React, { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { setUsername: setLoggedInUsername, setId: setUserId, setLoggedIn } = useContext(UserContext);
  const navigate = useNavigate();

  async function handleLogin(ev) {
    ev.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:4040/login",
        {
          Username: username,
          Password: password,
        },
        { withCredentials: true }
      );

      setLoggedInUsername(response.data.Username);
      setUserId(response.data.id);
      setLoggedIn(true);
      console.log("Login successful:", response.data);
      navigate("/Chat");
    } catch (error) {
      setError("Invalid username or password");
      console.error("Login error:", error);
    }
  }
  return (
    <form
      onSubmit={handleLogin}
      className="max-w-md mx-auto mt-10 p-4 border rounded-lg shadow-lg"
    >
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
        className="w-full p-2 mb-4 border rounded-md"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
        className="w-full p-2 mb-4 border rounded-md"
      />
      <button
        type="submit"
        className="w-full p-2 bg-blue-500 text-white rounded-md"
      >
        Login
      </button>
      <div className="text-center mt-2">
        Don't have an account? <Link to="/register">Register</Link>
      </div>
    </form>
  );
}
