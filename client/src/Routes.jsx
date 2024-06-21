import { useContext } from "react";
import { BrowserRouter as Router, Route, Routes as Switch } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import { UserContext } from "./UserContext.jsx";
import Chat from "./Chat.jsx";

export default function Routes() {
  const { loggedIn } = useContext(UserContext);

  return (
    <Router>
      {loggedIn ? (
        <Switch>
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<Chat/>}/>
        </Switch>
      ) : (
        <Switch>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Register />} />
        </Switch>
      )}
    </Router>
  );
}
