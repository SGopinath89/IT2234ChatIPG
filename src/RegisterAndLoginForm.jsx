import { useContext, useState } from "react";
import { UserContext } from "./UserContext";

export default function RegisterAndLoginForm(){
    const[Name,setName]=useState('');
    const[Email,setEmail]=useState('');
    const[Username,setUsername]=useState('');
    const[Password,setPassword]=useState('');
    const[EmployeeID,setEmployeeID]=useState('');
    const[isLoginOrRegister,setIsLoginOrRegister] =useState('register');
    const {setUsername:setLoggedInUsername,setId} = useContext(UserContext);

    async function handleSubmit(ev) {
        ev.preventDefault();
        const url = isLoginOrRegister === 'register'? 'register' :'login';
      const{data}= await axios.post(url,{Name,Email,Username,Password,EmployeeID});
       setLoggedInUsername(Username);
       setId(data.id);
    }

    return(
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
            <input value={Name} onChange={ev => setName(ev.target.value)}
             type="text" placeholder="Name" 
             className="block w-full rounded-sm p-2 mb-2 border"/>

            <input value={Email} onChange={ev => setEmail(ev.target.value)} 
            type="text" placeholder="Email" 
            className="block w-full rounded-sm p-2 mb-2 border"/>

                <input value={Username} onChange={ev => setUsername(ev.target.value)} 
                type="text" placeholder="Username" 
                className="block w-full rounded-sm p-2 mb-2 border"/>

                <input value={Password} onChange={ev => setPassword(ev.target.value)} 
                type="password" placeholder="Password" 
                className="block w-full rounded-sm p-2 mb-2 border"/>

                <input value={EmployeeID} onChange={ev => setEmployeeID(ev.target.value)} 
                type="text" placeholder="EmployeeID" 
                className="block w-full rounded-sm p-2 mb-2 border"/>

                <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
                    {isLoginOrRegister === 'register'? 'Register' : 'Login'}
                    </button>
                <div className="text-center mt-2">
                    
                    {isLoginOrRegister === 'register' && (
                        <div>
                            Already a member? 
                            <button onClick={() =>setIsLoginOrRegister('login')}>
                        Login here
                        </button>   
                        </div>
                    )}
                    {isLoginOrRegister === 'login' && (
                        <div>
                        Don't have an Account? 
                        <button onClick={() =>setIsLoginOrRegister('Register')}>
                    Register
                    </button>
                    </div>
                    )}
                    </div>
            </form>
        </div>
    );
}

