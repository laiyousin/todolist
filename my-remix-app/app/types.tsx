export interface User {
    id: number;
    username: string;
    password: string;
    tasks: Task[];
}

export interface Task {
    title: string;
    description?: string;
    done: boolean;
    user_id: number;
    url: String;
}