import { useState } from "react";
import axios from "../utils/axios";
import { useNavigate } from "@remix-run/react";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async () => {
        console.log("You press a button to register");
        console.log("Username", username);
        console.log("Password", password);
        try {
            const response = await axios.post("/register", { username: username, password: password });
            alert(response.data.message);
            navigate(-1);
        }
        catch (error){
            console.log(error)
            alert("Register failed");
        }
    }

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl">Register</h1>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleRegister}>Register</button>
        </div>
    )
};

