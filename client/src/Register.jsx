import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { UserContext } from "./UserContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emplId, setEmplId] = useState("");

  const { setUsername: setLoggedInUsername, setId: setUserId } =
    useContext(UserContext);
  const [loggedIn, setLoggedIn] = useState(false);

  async function register(ev) {
    ev.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:4040/register",
        {
          Name: name,
          Email: email,
          Username: username,
          Password: password,
          EmplId: emplId,
        },
        { withCredentials: true }
      );

      setLoggedInUsername(response.data.Username);
      setUserId(response.data.id);
      console.log("Registration successful:", response.data);
    } catch (error) {
      console.error("Registration error:", error);
    }
  }


  return (
    <form
      onSubmit={register}
      className="max-w-md mx-auto mt-10 p-4 border rounded-lg shadow-lg"
    >
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(ev) => setName(ev.target.value)}
        className="w-full p-2 mb-4 border rounded-md"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(ev) => setEmail(ev.target.value)}
        className="w-full p-2 mb-4 border rounded-md"
      />
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
      <input
        type="text"
        placeholder="Employee ID"
        value={emplId}
        onChange={(ev) => setEmplId(ev.target.value)}
        className="w-full p-2 mb-4 border rounded-md"
      />
      <button
        type="submit"
        className="w-full p-2 bg-blue-500 text-white rounded-md"
      >
        Register
      </button>
      <div className="text-center mt-2">
        Already a member <Link to="/login">Login here</Link>
      </div>
    </form>
  );
}
