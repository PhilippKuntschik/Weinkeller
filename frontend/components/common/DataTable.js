import React from 'react';
import PropTypes from 'prop-types';
import './DataTable.css';
import EmptyState from './EmptyState';

/**
 * DataTable component for displaying tabular data with sorting and filtering
 * @param {Object} props - Component props
 * @param {Array} props.columns - Array of column definitions
 * @param {Array} props.data - Array of data objects
 * @param {Object} props.sortConfig - Sort configuration (key and direction)
 * @param {Function} props.onSort - Sort handler function
 * @param {Function} props.onRowClick - Row click handler
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.emptyMessage - Message to display when there's no data
 * @param {string} props.emptyActionText - Text for the empty state action button
 * @param {string} props.emptyActionLink - Link for the empty state action button
 * @param {Function} props.emptyActionOnClick - Click handler for the empty state action button
 * @param {boolean} props.isLoading - Whether the data is loading
 * @param {React.ReactNode} props.loadingComponent - Custom loading component
 */
const DataTable = ({ 
  columns = [], 
  data = [], 
  sortConfig = { key: '', direction: 'ascending' },
  onSort,
  onRowClick,
  className = '',
  emptyMessage = 'No data found',
  emptyActionText,
  emptyActionLink,
  emptyActionOnClick,
  isLoading = false,
  loadingComponent
}) => {
  // Get sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  // Handle sort
  const handleSort = (key) => {
    if (onSort) {
      onSort(key);
    }
  };

  // Handle row click
  const handleRowClick = (item, index) => {
    if (onRowClick) {
      onRowClick(item, index);
    }
  };

  // Render loading state
  if (isLoading) {
    return loadingComponent || (
      <div className="data-table-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Render empty state
  if (data.length === 0) {
    return (
      <EmptyState
        message={emptyMessage}
        actionText={emptyActionText}
        actionLink={emptyActionLink}
        actionOnClick={emptyActionOnClick}
      />
    );
  }

  return (
    <div className={`data-table-container ${className}`}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key} 
                className={`${column.sortable !== false ? 'sortable' : ''} ${column.className || ''}`}
                onClick={() => column.sortable !== false && handleSort(column.key)}
                style={column.width ? { width: column.width } : {}}
              >
                {column.label}
                {column.sortable !== false && getSortIndicator(column.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={item.id || index} 
              onClick={() => handleRowClick(item, index)}
              className={onRowClick ? 'clickable' : ''}
            >
              {columns.map((column) => (
                <td 
                  key={`${item.id || index}-${column.key}`}
                  className={column.className || ''}
                >
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      width: PropTypes.string,
      className: PropTypes.string,
      render: PropTypes.func
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  sortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(['ascending', 'descending'])
  }),
  onSort: PropTypes.func,
  onRowClick: PropTypes.func,
  className: PropTypes.string,
  emptyMessage: PropTypes.string,
  emptyActionText: PropTypes.string,
  emptyActionLink: PropTypes.string,
  emptyActionOnClick: PropTypes.func,
  isLoading: PropTypes.bool,
  loadingComponent: PropTypes.node
};

export default DataTable;
