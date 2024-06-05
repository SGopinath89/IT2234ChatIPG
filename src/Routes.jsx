import { useContext } from "react";
import RegisterAndLoginForm from "./RegisterAndLoginForm.jsx";
import { UserContext } from "./UserContext.jsx";
import Chat from "./Chat.jsx";

export default function Routes(){
    const {Username,id} = useContext(UserContext);

    if(Username){
        return <Chat/>
    } 

    return(
        <RegisterAndLoginForm/>
    );
}