import { createContext, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({children}) {
    const[Username,setUsername] = useState(null);
    const[id,setId] = useState(null);
    useEffect(() => {
        axios.get('/profile').then(response => {
           setId(response.dsta.userId);
           setUsername(response.data.Username);
        });
    }, []);

    return(
        <UserContext.Provider value={{Username,setUsername,id,setId}}>
            {children}
            </UserContext.Provider>
    );
}