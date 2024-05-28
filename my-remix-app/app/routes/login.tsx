import React, {useState} from "react";
import axios from "../utils/axios";
import { useNavigate } from "@remix-run/react";
import { User } from "~/types";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        console.log("You press a button to login");
        console.log("Username", username);
        console.log("Password", password);
        try {
            const response = await axios.post("/login", { username, password });
            localStorage.setItem("token", response.data["access data"]);
            alert("Login Successfully!")
            const userResponse = await axios.get(`/users`);
            const user = userResponse.data.users.find((user: User) => user.username === username);
            navigate(`/users/${user.id}`);
        }
        catch (error){
            alert("Login failed");
        }
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl">Login</h1>
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
            <button type="button" onClick={handleLogin}>Login</button>
        </div>
    )
}