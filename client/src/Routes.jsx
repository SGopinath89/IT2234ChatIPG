import { useContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import { UserContext } from "./UserContext.jsx";
import Chat from "./Chat.jsx";

export default function AppRoutes() {
  const { loggedIn } = useContext(UserContext);

  return (
    <Router>
      <Routes>
        {loggedIn ? (
          <>
            <Route path="/chat" element={<Chat />} />
            <Route path="*" element={<Navigate to="/chat" />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
