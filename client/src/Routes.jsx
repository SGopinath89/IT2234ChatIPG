import { useContext } from "react";
import { BrowserRouter as Router, Route, Routes as Switch } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import { UserContext } from "./UserContext.jsx";

export default function Routes() {
  const { username,loggedIn } = useContext(UserContext);

  return (
    <Router>
      {loggedIn ? (
        <div>logged in! {username}</div>
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
