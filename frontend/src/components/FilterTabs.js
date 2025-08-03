import React from 'react';

const FilterTabs = ({ activeFilter, onFilterChange, todos }) => {
  const filters = [
    { key: 'all', label: 'All Tasks', count: todos.length },
    { key: 'todo', label: 'To Do', count: todos.filter(t => t.status === 'to do').length },
    { key: 'finished', label: 'Finished', count: todos.filter(t => t.status === 'finished').length }
  ];

  return (
    <div className="filter-tabs">
      {filters.map(filter => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`filter-tab ${activeFilter === filter.key ? 'active' : ''}`}
        >
          {filter.label}
          <span className="filter-count">{filter.count}</span>
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;