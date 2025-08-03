import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import TodoItem from "./components/TodoItem";
import FilterTabs from "./components/FilterTabs";
import SearchBar from "./components/SearchBar";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Edit todo
  const editTodo = async (todoId, newTitle) => {
    try {
      const response = await axios.put(`${API}/todos/${todoId}`, {
        title: newTitle
      });
      setTodos(todos.map(todo => 
        todo.id === todoId ? response.data : todo
      ));
    } catch (error) {
      console.error("Error editing todo:", error);
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

  // Filter and search todos
  const getFilteredTodos = () => {
    let filtered = todos;
    
    // Apply status filter
    if (activeFilter === 'todo') {
      filtered = filtered.filter(todo => todo.status === 'to do');
    } else if (activeFilter === 'finished') {
      filtered = filtered.filter(todo => todo.status === 'finished');
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredTodos = getFilteredTodos();

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
            <div className="table-controls">
              <SearchBar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              <FilterTabs 
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                todos={todos}
              />
            </div>
          </div>
          
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="empty-text">
                {todos.length === 0 
                  ? "No tasks yet. Add your first task to get started!" 
                  : searchTerm 
                    ? `No tasks found matching "${searchTerm}"`
                    : `No ${activeFilter === 'todo' ? 'pending' : 'completed'} tasks`
                }
              </p>
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
                  {filteredTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={toggleTodoStatus}
                      onDelete={deleteTodo}
                      onEdit={editTodo}
                    />
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