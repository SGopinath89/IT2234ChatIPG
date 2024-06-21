import axios from "axios";
import { createContext, useEffect, useState } from "react";

const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/profile", { withCredentials: true });
        const { id, username } = response.data;
        setUsername(username);
        setId(id);
        setLoggedIn(true);
      } catch (error) {
        console.error("Profile fetch error:", error);
        setLoggedIn(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <UserContext.Provider
      value={{ username, setUsername, id, setId, loggedIn, setLoggedIn }}
    >
      {children}
    </UserContext.Provider>
  );
}

export { UserContext };
