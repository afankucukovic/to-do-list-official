import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch todos from backend
  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API}/todos`);
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  // Add new todo
  const addTodo = async () => {
    if (!newTodoTitle.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API}/todos`, {
        title: newTodoTitle.trim()
      });
      setTodos([response.data, ...todos]);
      setNewTodoTitle("");
    } catch (error) {
      console.error("Error adding todo:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle todo status
  const toggleTodoStatus = async (todoId, currentStatus) => {
    const newStatus = currentStatus === "to do" ? "finished" : "to do";
    
    try {
      const response = await axios.put(`${API}/todos/${todoId}`, {
        status: newStatus
      });
      setTodos(todos.map(todo => 
        todo.id === todoId ? response.data : todo
      ));
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  // Delete todo
  const deleteTodo = async (todoId) => {
    try {
      await axios.delete(`${API}/todos/${todoId}`);
      setTodos(todos.filter(todo => todo.id !== todoId));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  // Load todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  // Handle enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div className="App">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1 className="title">My Tasks</h1>
          <p className="subtitle">Keep track of your work and stay organized</p>
        </div>

        {/* Add Todo Section */}
        <div className="add-todo-section">
          <div className="add-todo-container">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a new task..."
              className="todo-input"
            />
            <button 
              onClick={addTodo}
              disabled={loading || !newTodoTitle.trim()}
              className="add-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add Task
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stats-card stats-card-total">
            <div className="stats-number">{todos.length}</div>
            <div className="stats-label">Total Tasks</div>
          </div>
          <div className="stats-card stats-card-pending">
            <div className="stats-number">{todos.filter(t => t.status === "to do").length}</div>
            <div className="stats-label">To Do</div>
          </div>
          <div className="stats-card stats-card-completed">
            <div className="stats-number">{todos.filter(t => t.status === "finished").length}</div>
            <div className="stats-label">Completed</div>
          </div>
        </div>

        {/* Todo Table */}
        <div className="table-container">
          <div className="table-header">
            <h2 className="table-title">Tasks</h2>
          </div>
          
          {todos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="empty-text">No tasks yet. Add your first task to get started!</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="todo-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {todos.map((todo) => (
                    <tr key={todo.id} className={`table-row ${todo.status === "finished" ? "completed-row" : ""}`}>
                      <td className="task-title">
                        <span className={`task-text ${todo.status === "finished" ? "completed-text" : ""}`}>
                          {todo.title}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${todo.status === "finished" ? "status-completed" : "status-todo"}`}>
                          {todo.status === "finished" ? (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Finished
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              To Do
                            </>
                          )}
                        </span>
                      </td>
                      <td className="created-date">
                        {new Date(todo.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => toggleTodoStatus(todo.id, todo.status)}
                            className="action-button toggle-button"
                            title={todo.status === "finished" ? "Mark as To Do" : "Mark as Finished"}
                          >
                            {todo.status === "finished" ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 12L21 12M3 6L21 6M3 18L21 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="action-button delete-button"
                            title="Delete Task"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;