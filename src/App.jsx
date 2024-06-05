import axios from "axios";
import {UserContextProvider } from "./UserContext";
import Routes from "./Routes";

function App() {
  axios.default.baseURL = 'http://localhost:4040' ;
  axios.default.withCredentials = true;
 
  return (
    <UserContextProvider>
   <Routes/>
   </UserContextProvider>
  )
}

export default App 
 