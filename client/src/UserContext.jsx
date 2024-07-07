import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [Username, setUsername] = useState(null);
  const [id, setId] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    axios.get("/profile").then((response) => {
      setId(response.data.userId);
      setUsername(response.data.Username);
      setLoggedIn(true);
    }).catch(() => {
      setLoggedIn(false);
    });
  }, []);

  return (
    <UserContext.Provider value={{ Username, setUsername, id, setId, loggedIn, setLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
}
