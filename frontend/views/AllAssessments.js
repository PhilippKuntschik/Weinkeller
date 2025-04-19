import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { assessmentService } from '../services';
import { PageHeader, DataTable, ActionButtons } from '../components/common';
import '../styles/global.css';
import '../styles/assessments.css';

function AllAssessments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [SATs, setSATs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'SAT_date', direction: 'descending' });

  useEffect(() => {
    const fetchSATs = async () => {
      try {
        setLoading(true);
        const data = await assessmentService.getAllSATs();
        console.log('assessments data received:', data);
        
        // Filter out invalid entries
        const validData = Array.isArray(data) ? data.filter(item => {
          const hasValidWine = item && item.wine_id && item.wine_name;
          const hasValidDate = item && item.SAT_date && !isNaN(new Date(item.SAT_date).getTime());
          
          if (!hasValidWine || !hasValidDate) {
            console.log('Filtering out invalid entry:', item);
          }
          
          return hasValidWine && hasValidDate;
        }) : [];
        
        console.log('Filtered assessments data:', validData);
        setSATs(validData);
        setError(null);
      } catch (err) {
        console.error('Error fetching assessments:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSATs();
  }, []);
  
  // Handle sorting
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '-';
      }
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };
  
  // Sort the SATs based on the current sort configuration
  const sortedSATs = React.useMemo(() => {
    if (!SATs || SATs.length === 0) return [];
    
    const sortableItems = [...SATs];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        // Handle null or undefined values
        if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
        if (!a[sortConfig.key]) return 1;
        if (!b[sortConfig.key]) return -1;
        
        // Special handling for dates
        if (sortConfig.key === 'SAT_date') {
          const dateA = new Date(a[sortConfig.key]);
          const dateB = new Date(b[sortConfig.key]);
          return sortConfig.direction === 'ascending' 
            ? dateA - dateB 
            : dateB - dateA;
        }
        
        // Default string comparison
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [SATs, sortConfig]);
  
  // Define table columns
  const columns = [
    { 
      key: 'SAT_date', 
      label: t('SATDate'), 
      sortable: true,
      render: (item) => formatDate(item.SAT_date)
    },
    { 
      key: 'wine_name', 
      label: t('wine'), 
      sortable: true,
      render: (item) => {
        if (!item.wine_name) return '-';
        return `${item.wine_name} ${item.wine_year || ''}`;
      }
    },
    { 
      key: 'producer_name', 
      label: t('producer'), 
      sortable: true,
      className: 'hide-on-mobile'
    },
    { 
      key: 'conclusions_quality', 
      label: t('conclusionsQuality'), 
      sortable: true,
      className: 'hide-on-mobile',
      render: (item) => item.conclusions_quality ? t(item.conclusions_quality) : '-'
    },
    {
      key: 'actions',
      label: t('actions'),
      sortable: false,
      render: (item) => (
        <ActionButtons
          actions={[
            {
              label: t('edit'),
              to: `/edit-assessment/${item.id}`,
              variant: 'primary',
              size: 'small'
            }
          ]}
          size="small"
        />
      )
    }
  ];
  
  // Create header actions
  const headerActions = (
    <Link to="/add-assessment" className="button button-primary">
      {t('addWSET')}
    </Link>
  );

  return (
    <div className="page">
      <PageHeader 
        title={t('assessments')}
        actions={headerActions}
      />
      
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <DataTable
          columns={columns}
          data={sortedSATs}
          sortConfig={sortConfig}
          onSort={handleSort}
          isLoading={loading}
          emptyMessage={t('noassessmentsFound')}
          emptyActionText={t('addYourFirstWSET')}
          emptyActionLink="/add-assessment"
        />
      )}
    </div>
  );
}

export default AllAssessments;
