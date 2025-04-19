import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader, ContentCard, DataTable, EmptyState, ActionButtons } from '../components/common';
import { producerService } from '../services';
import '../styles/global.css';

function AllProducers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

  useEffect(() => {
    const fetchProducers = async () => {
      setLoading(true);
      try {
        const producers = await producerService.getAllProducers();
        setProducers(producers);
        setError(null);
      } catch (error) {
        console.error('Error fetching producers:', error);
        setError(t('errorFetchingProducers'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducers();
  }, [t]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting to the producers
  const sortedProducers = useMemo(() => {
    const sortableItems = [...producers];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        // Handle null or undefined values
        if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
        if (!a[sortConfig.key]) return 1;
        if (!b[sortConfig.key]) return -1;
        
        // Compare values
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
  }, [producers, sortConfig]);

  // Define table columns
  const columns = [
    { 
      key: 'name', 
      label: t('name'), 
      sortable: true,
      render: (producer) => (
        <Link to={`/edit-producer/${producer.id}`} className="text-primary font-bold">
          {producer.name}
        </Link>
      )
    },
    { 
      key: 'country', 
      label: t('country'), 
      sortable: true,
      render: (producer) => {
        if (producer.country_tag) {
          return producer.country_tag.name;
        }
        return producer.country || '-';
      }
    },
    { 
      key: 'region', 
      label: t('region'), 
      sortable: true,
      render: (producer) => {
        if (producer.region_tag) {
          return producer.region_tag.name;
        }
        return producer.region || '-';
      }
    },
    { 
      key: 'website', 
      label: t('website'), 
      sortable: false,
      render: (producer) => {
        if (producer.website) {
          return (
            <a 
              href={producer.website.startsWith('http') ? producer.website : `https://${producer.website}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary"
            >
              {producer.website}
            </a>
          );
        }
        return '-';
      }
    },
    { 
      key: 'description', 
      label: t('description'), 
      sortable: false,
      render: (producer) => producer.description || '-'
    },
    {
      key: 'actions',
      label: t('actions'),
      sortable: false,
      render: (producer) => (
        <ActionButtons
          actions={[
            {
              label: t('edit'),
              onClick: () => navigate(`/edit-producer/${producer.id}`),
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
    <Link to="/add-producer" className="button button-primary">
      {t('addProducer')}
    </Link>
  );

  return (
    <div className="page">
      <PageHeader 
        title={t('allProducers')}
        actions={headerActions}
      />
      
      {error ? (
        <div className="error-message">{error}</div>
      ) : producers.length === 0 && !loading ? (
        <EmptyState
          message={t('noProducersFound')}
          actionText={t('addProducer')}
          actionLink="/add-producer"
        />
      ) : (
        <ContentCard>
          <DataTable
            columns={columns}
            data={sortedProducers}
            sortConfig={sortConfig}
            onSort={handleSort}
            isLoading={loading}
          />
        </ContentCard>
      )}
    </div>
  );
}

export default AllProducers;
