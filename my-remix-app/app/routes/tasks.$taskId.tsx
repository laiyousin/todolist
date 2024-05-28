import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "@remix-run/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../utils/axios";
import { Task } from "~/types";

// get the info of task
const fetchTask = async (taskId: number): Promise<{ task: Task }> => {
    const token = localStorage.getItem("token");
    const taskResponse = await axios.get(`/tasks/${taskId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return taskResponse.data;
}

// update the content of task
const updateTask = async (task: Task): Promise<{ task: Task }> => {
    const token = localStorage.getItem("token");
    const taskResponse = await axios.put(`${task.url}`, task, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return taskResponse.data;
};

export default function TaskDetail() {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    if (!taskId) {
        return <div>Error: Task ID is missing</div>;
    }

    const numericTaskId = parseInt(taskId, 10);
    const queryClient = useQueryClient();

    const { isPending, isError, data, error } = useQuery({ queryKey: ["task", numericTaskId], queryFn: () => fetchTask(numericTaskId)});
    const mutation = useMutation({
        mutationFn: updateTask,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["task", numericTaskId]});
            navigate(-1);
        }
    });

    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [done, setDone] = useState<boolean>(false);

    useEffect(() => {
        if (data) {
            setTitle(data.task.title);
            setDescription(data.task.description || "");
            setDone(data.task.done)
        }
    }, [data]);

    if (isPending) return <div>Loading...</div>
    if (error) return <div>Error fetcing task details</div>;

    const handleUpdate = () => {
        if (data) {
            mutation.mutate({
                ...data.task,
                title,
                description,
                done, 
            });
        }
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`/tasks/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }); 
            alert("Delete successfully!");
            navigate(-1);
        }
        catch (error) {
            console.log(error)
            alert("Delete failed!")
        }
    }
    return (
        <div className="container mx-auto">
            <h1 className="text-2xl">Task Details</h1>
            <div>
                <label>Title:</label><br/>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                /><br/><br/>
                <label>Description:</label><br/>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{width: "250px", height: "100px"}}
                /><br/><br/>
                <label>Done:</label>
                <input
                    type="checkbox"
                    checked={done}
                    onChange={(e) => setDone(e.target.checked)}
                /><br/><br/>
                <button onClick={handleUpdate}>Update Task</button>
                <button onClick={handleDelete}>Delete Task</button>
            </div>
        </div>
    )
}