import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch todos from backend
  const fetchTodos = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API}/todos`);
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
      setError("Failed to fetch todos");
    }
  };

  // Add new todo
  const addTodo = async (title) => {
    if (!title.trim()) return false;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API}/todos`, {
        title: title.trim()
      });
      setTodos(prevTodos => [response.data, ...prevTodos]);
      return true;
    } catch (error) {
      console.error("Error adding todo:", error);
      setError("Failed to add todo");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle todo status
  const toggleTodoStatus = async (todoId, currentStatus) => {
    const newStatus = currentStatus === "to do" ? "finished" : "to do";
    
    try {
      setError(null);
      const response = await axios.put(`${API}/todos/${todoId}`, {
        status: newStatus
      });
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.id === todoId ? response.data : todo
        )
      );
      return true;
    } catch (error) {
      console.error("Error updating todo:", error);
      setError("Failed to update todo");
      return false;
    }
  };

  // Edit todo
  const editTodo = async (todoId, newTitle) => {
    try {
      setError(null);
      const response = await axios.put(`${API}/todos/${todoId}`, {
        title: newTitle
      });
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.id === todoId ? response.data : todo
        )
      );
      return true;
    } catch (error) {
      console.error("Error editing todo:", error);
      setError("Failed to edit todo");
      return false;
    }
  };

  // Delete todo
  const deleteTodo = async (todoId) => {
    try {
      setError(null);
      await axios.delete(`${API}/todos/${todoId}`);
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoId));
      return true;
    } catch (error) {
      console.error("Error deleting todo:", error);
      setError("Failed to delete todo");
      return false;
    }
  };

  // Load todos on hook initialization
  useEffect(() => {
    fetchTodos();
  }, []);

  return {
    todos,
    loading,
    error,
    addTodo,
    toggleTodoStatus,
    editTodo,
    deleteTodo,
    refetch: fetchTodos
  };
};