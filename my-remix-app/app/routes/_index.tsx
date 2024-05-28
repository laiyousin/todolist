import type { MetaFunction } from "@remix-run/node";
import { Link, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "This is a TODO List" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-bold mb-8">This is a TODO List</h1>
      <nav className="flex flex-col space-y-4">
        <button onClick={() => navigate("/register")} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          REGISTER</button><br/>
        <button onClick={() => navigate("/login")} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          LOGIN</button><br/>
        <button onClick={() => navigate("/users")} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          USERS</button>
      </nav>
    </div>
  );
}
