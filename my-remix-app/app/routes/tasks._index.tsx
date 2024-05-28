import React from 'react'
import { useQuery } from 'react-query'
import axios from "../utils/axios"
import { Link } from '@remix-run/react'
import { Task } from '~/types'

// get all tasks
const fetchTasks = async (): Promise<{ tasks: Task[] }> => {
    const token = localStorage.getItem("token");
    const response = await axios.get("/tasks", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export default function TaskList() {
    const { data, error, isLoading } = useQuery("task", fetchTasks);
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error fetching tasks</div>;

    return (
        <div className='container mx-auto'>
            <h1 className='text-2xl'>All Tasks</h1>
            <ul>
                {data?.tasks.map((task: Task) => (
                    <li>
                        <Link to={`${task.url}`}>{task.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}