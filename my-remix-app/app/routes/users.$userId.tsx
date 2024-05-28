import React, { useState } from "react";
import { useParams, Link, useNavigate } from "@remix-run/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "../utils/axios";
import { User, Task } from "../types"

interface UserDetailsResponse {
    user: User;
    tasks: Task[];    
}

const fetchUserTasks = async (userId: number): Promise<UserDetailsResponse> => {
    const token = localStorage.getItem("token");
    const userResponse = await axios.get(`/users`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const userTaskResponse = await axios.get(`/users/${userId}/tasks`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const user = userResponse.data.users.find((user: User) => user.id === userId);
    const tasks = Array.isArray(userTaskResponse.data.tasks) ? userTaskResponse.data.tasks : [];
    return {
        "user": user,
        "tasks": tasks
    };
};

export default function UserDetails() {
    const { userId } = useParams<{ userId: string }>();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const navigate = useNavigate();

    if (!userId) {
        return <div>Error: User ID is missing</div>;
    }

    const numericUsed = parseInt(userId, 10);
    const {isPending, isError, data, error} = useQuery({queryKey: ['UserDetails', numericUsed], queryFn: () => fetchUserTasks(numericUsed)})

    if (isPending) return <div>Loading...</div>;
    if (error) return <div>Error fetching user details</div>;

    const handleNewTask = async () => {
        try {
            const response = await axios.post("/tasks", {title: title, description: description, user_id: userId});
            alert("There is one more task need to finish : (")
            navigate(0);
        }
        catch (error) {
            console.log(error)
            alert("Add new task failed!")
        }
    }
    return (
        <div className="container mx-auto">
            <h1 className="text-2xl">User Detials</h1>
            <div>
                <h3>Username: {data?.user.username}</h3>
                <h3>Tasks:</h3>
                <ul>
                    {data?.tasks.map((task: Task) => (
                        <li>
                            <Link to={`${task.url}`}>{task.title}</Link>
                        </li>
                    ))}
                </ul>
                <h3>You can add some new tasks...</h3>
                <p>Title:</p>
                <input
                    type="text"
                    placeholder="Write down your task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <p>Description:</p>
                <input 
                    type="text"
                    placeholder="Write down your task description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{width: "250px", height: "100px"}}
                /><br/><br/>
                <button onClick={handleNewTask}>Add a new task!</button>
            </div>
        </div>
    )
}