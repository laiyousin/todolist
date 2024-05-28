import { useQuery } from "@tanstack/react-query";
import axios from "../utils/axios";
import { Link, useNavigate } from "@remix-run/react";
import { User } from "../types";
import React from "react";

const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get("/users", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export default function UserList() {
    const navigate = useNavigate();
    const {isPending, isError, data, error} = useQuery({ queryKey: ['users'], queryFn: fetchUsers});
    
    if (isPending) return <div>Loading...</div>;
    if (error) return <div>Error fetching users</div>;

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl">User List</h1>
            <ul>
                {data.users.map((user: User) => (
                    <li key={user.id}>
                        <button onClick={() => navigate(`/users/${user.id}`)}>{user.username}</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
