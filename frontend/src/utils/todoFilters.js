export const filterTodos = (todos, filter, searchTerm) => {
  let filtered = todos;
  
  // Apply status filter
  switch (filter) {
    case 'todo':
      filtered = filtered.filter(todo => todo.status === 'to do');
      break;
    case 'finished':
      filtered = filtered.filter(todo => todo.status === 'finished');
      break;
    default:
      // 'all' - no filtering needed
      break;
  }
  
  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter(todo => 
      todo.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  return filtered;
};

export const getTodoStats = (todos) => {
  return {
    total: todos.length,
    todo: todos.filter(t => t.status === 'to do').length,
    finished: todos.filter(t => t.status === 'finished').length,
    completionRate: todos.length > 0 ? Math.round((todos.filter(t => t.status === 'finished').length / todos.length) * 100) : 0
  };
};