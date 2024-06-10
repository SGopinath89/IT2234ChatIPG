import axios from 'axios';
import { createContext, useEffect, useState } from 'react';

const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/profile', { withCredentials: true });
        const { id, username } = response.data;
        setUsername(username);
        setId(id);
        setLoggedIn(true); // Set loggedIn state to true after successful profile fetch
      } catch (error) {
        console.error('Profile fetch error:', error);
        setLoggedIn(false); // Set loggedIn state to false if profile fetch fails
      }
    };

    fetchProfile();
  }, []); // Empty dependency array to run the effect only once on mount

  return (
    <UserContext.Provider value={{ username, setUsername, id, setId, loggedIn, setLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
}

export { UserContext };