import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentInventory } from '../services/inventoryService';
import { createOrUpdateWine } from '../services/wineService';
import { PageHeader, DataTable, EmptyState, ActionButtons, FilterBar } from '../components/common';
import '../styles/global.css';
import '../styles/inventoryOverview.css';

function InventoryOverview() {
  const { t } = useTranslation();
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'wine_name', direction: 'ascending' });
  const navigate = useNavigate();
  
  // Filter options state
  const [filterOptions, setFilterOptions] = useState({
    producers: [],
    countries: [],
    regions: [],
    types: [],
    grapes: [],
    years: { min: 1900, max: new Date().getFullYear() },
    maturities: [],
    occasions: [],
    foodPairings: []
  });
  
  // Filter values state
  const [filterValues, setFilterValues] = useState({
    producer: '',
    country: '',
    region: '',
    type: '',
    grapes: [],
    yearMin: '',
    yearMax: '',
    maturity: '',
    occasions: [],
    foodPairings: [],
    wishlist: false,
    favorite: false
  });

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const data = await getCurrentInventory();
        setInventory(data);
        setFilteredInventory(data);
        
        // Extract filter options from data
        const producers = [...new Set(data.map(item => item.producer_name))].sort();
        
        // Extract countries from both country field and country_tag
        const countries = [...new Set(data.map(item => {
          return item.country_tag ? item.country_tag.name : item.country;
        }).filter(Boolean))].sort();
        
        // Extract regions from both region field and region_tag
        const regions = [...new Set(data.map(item => {
          return item.region_tag ? item.region_tag.name : item.region;
        }).filter(Boolean))].sort();
        
        // Extract wine types from wine_type_tags
        const allWineTypeTags = data.flatMap(item => item.wine_type_tags || []);
        const types = [...new Set(allWineTypeTags.map(tag => tag.name))].sort();
        
        const maturities = [...new Set(data.map(item => item.maturity).filter(Boolean))].sort();
        
        // Extract all grape tags
        const allGrapeTags = data.flatMap(item => item.grape_tags || []);
        const uniqueGrapes = [...new Set(allGrapeTags.map(tag => tag.name))].sort();
        
        // Extract all occasion tags
        const allOccasionTags = data.flatMap(item => item.occasion_tags || []);
        const uniqueOccasions = [...new Set(allOccasionTags.map(tag => tag.name))].sort();
        
        // Extract all food pairing tags
        const allFoodPairingTags = data.flatMap(item => item.food_pairing_tags || []);
        const uniqueFoodPairings = [...new Set(allFoodPairingTags.map(tag => tag.name))].sort();
        
        // Find min and max years
        const years = data.map(item => parseInt(item.year)).filter(year => !isNaN(year));
        const minYear = years.length > 0 ? Math.min(...years) : 1900;
        const maxYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();
        
        setFilterOptions({
          producers,
          countries,
          regions,
          types,
          grapes: uniqueGrapes,
          years: { min: minYear, max: maxYear },
          maturities,
          occasions: uniqueOccasions,
          foodPairings: uniqueFoodPairings
        });
        
        // Initialize year filters with actual min/max values
        setFilterValues(prev => ({
          ...prev,
          yearMin: minYear,
          yearMax: maxYear
        }));
        
        setError(null);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setError('Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting to the filtered inventory
  const sortedInventory = useMemo(() => {
    const sortableItems = [...filteredInventory];
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
  }, [filteredInventory, sortConfig]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilterValues(newFilters);
    
    const filtered = inventory.filter(item => {
      // Producer filter
      if (newFilters.producer && item.producer_name !== newFilters.producer) {
        return false;
      }
      
      // Country filter
      if (newFilters.country) {
        const itemCountry = item.country_tag ? item.country_tag.name : item.country;
        if (itemCountry !== newFilters.country) {
          return false;
        }
      }
      
      // Region filter
      if (newFilters.region) {
        const itemRegion = item.region_tag ? item.region_tag.name : item.region;
        if (itemRegion !== newFilters.region) {
          return false;
        }
      }
      
      // Type filter
      if (newFilters.type) {
        // Check if any of the wine type tags match the selected type
        const wineTypes = item.wine_type_tags?.map(tag => tag.name) || [];
        if (!wineTypes.includes(newFilters.type)) {
          return false;
        }
      }
      
      // Year range filter
      const year = parseInt(item.year);
      if (!isNaN(year)) {
        if (newFilters.yearMin && year < newFilters.yearMin) {
          return false;
        }
        if (newFilters.yearMax && year > newFilters.yearMax) {
          return false;
        }
      }
      
      // Maturity filter
      if (newFilters.maturity && item.maturity !== newFilters.maturity) {
        return false;
      }
      
      // Grape tags filter
      if (newFilters.grapes && newFilters.grapes.length > 0) {
        const itemGrapes = item.grape_tags?.map(tag => tag.name) || [];
        const hasMatchingGrape = newFilters.grapes.some(grape => itemGrapes.includes(grape));
        if (!hasMatchingGrape) {
          return false;
        }
      }
      
      // Occasion tags filter
      if (newFilters.occasions && newFilters.occasions.length > 0) {
        const itemOccasions = item.occasion_tags?.map(tag => tag.name) || [];
        const hasMatchingOccasion = newFilters.occasions.some(occasion => itemOccasions.includes(occasion));
        if (!hasMatchingOccasion) {
          return false;
        }
      }
      
      // Food pairing tags filter
      if (newFilters.foodPairings && newFilters.foodPairings.length > 0) {
        const itemFoodPairings = item.food_pairing_tags?.map(tag => tag.name) || [];
        const hasMatchingFoodPairing = newFilters.foodPairings.some(foodPairing => itemFoodPairings.includes(foodPairing));
        if (!hasMatchingFoodPairing) {
          return false;
        }
      }
      
      // Wishlist filter
      if (newFilters.wishlist && !item.wishlist) {
        return false;
      }
      
      // Favorite filter
      if (newFilters.favorite && !item.favorite) {
        return false;
      }
      
      return true;
    });
    
    setFilteredInventory(filtered);
  };
  
  // Clear filters
  const handleClearFilters = () => {
    setFilterValues({
      producer: '',
      country: '',
      region: '',
      type: '',
      grapes: [],
      yearMin: filterOptions.years.min,
      yearMax: filterOptions.years.max,
      maturity: '',
      occasions: [],
      foodPairings: [],
      wishlist: false,
      favorite: false
    });
    
    setFilteredInventory(inventory);
  };


  // Handle add bottle
  const handleAddBottle = (wineId) => {
    navigate(`/add-to-inventory?wine_id=${wineId}`);
  };

  // Handle consume bottle
  const handleConsumeBottle = (wineId) => {
    navigate(`/consume-wine?wine_id=${wineId}`);
  };
  
  // Handle toggle wishlist
  const handleToggleWishlist = async (wineId, currentValue) => {
    try {
      await createOrUpdateWine({
        id: wineId,
        wishlist: currentValue ? 0 : 1
      });
      
      // Update the inventory data
      setInventory(prevInventory => 
        prevInventory.map(item => 
          item.wine_id === wineId 
            ? { ...item, wishlist: !currentValue } 
            : item
        )
      );
      
      // Update filtered inventory as well
      setFilteredInventory(prevFiltered => 
        prevFiltered.map(item => 
          item.wine_id === wineId 
            ? { ...item, wishlist: !currentValue } 
            : item
        )
      );
    } catch (error) {
      console.error('Error updating wishlist status:', error);
      // Show error message
      setError('Failed to update wishlist status');
    }
  };
  
  // Handle toggle favorite
  const handleToggleFavorite = async (wineId, currentValue) => {
    try {
      await createOrUpdateWine({
        id: wineId,
        favorite: currentValue ? 0 : 1
      });
      
      // Update the inventory data
      setInventory(prevInventory => 
        prevInventory.map(item => 
          item.wine_id === wineId 
            ? { ...item, favorite: !currentValue } 
            : item
        )
      );
      
      // Update filtered inventory as well
      setFilteredInventory(prevFiltered => 
        prevFiltered.map(item => 
          item.wine_id === wineId 
            ? { ...item, favorite: !currentValue } 
            : item
        )
      );
    } catch (error) {
      console.error('Error updating favorite status:', error);
      // Show error message
      setError('Failed to update favorite status');
    }
  };

  // Create filter definitions for FilterBar
  const filterDefinitions = [
    {
      id: 'producer',
      label: t('producer'),
      type: 'select',
      options: filterOptions.producers.map(producer => ({ value: producer, label: producer })),
      defaultValue: '',
      placeholder: t('all')
    },
    {
      id: 'country',
      label: t('country'),
      type: 'select',
      options: filterOptions.countries.map(country => ({ value: country, label: country })),
      defaultValue: '',
      placeholder: t('all')
    },
    {
      id: 'region',
      label: t('region'),
      type: 'select',
      options: filterOptions.regions.map(region => ({ value: region, label: region })),
      defaultValue: '',
      placeholder: t('all')
    },
    {
      id: 'type',
      label: t('type'),
      type: 'select',
      options: filterOptions.types.map(type => ({ value: type, label: type })),
      defaultValue: '',
      placeholder: t('all')
    },
    {
      id: 'yearRange',
      label: t('year'),
      type: 'range',
      min: filterOptions.years.min,
      max: filterOptions.years.max,
      defaultValue: { min: filterOptions.years.min, max: filterOptions.years.max }
    },
    {
      id: 'grapes',
      label: t('grapes'),
      type: 'multi-select',
      options: filterOptions.grapes.map(grape => ({ value: grape, label: grape })),
      defaultValue: []
    },
    {
      id: 'maturity',
      label: t('maturity'),
      type: 'select',
      options: filterOptions.maturities.map(maturity => ({ value: maturity, label: maturity })),
      defaultValue: '',
      placeholder: t('all')
    },
    {
      id: 'occasions',
      label: t('occasion'),
      type: 'multi-select',
      options: filterOptions.occasions.map(occasion => ({ value: occasion, label: occasion })),
      defaultValue: []
    },
    {
      id: 'foodPairings',
      label: t('foodPairing'),
      type: 'multi-select',
      options: filterOptions.foodPairings.map(foodPairing => ({ value: foodPairing, label: foodPairing })),
      defaultValue: []
    },
    {
      id: 'wishlist',
      label: t('wishlist') || 'Wishlist',
      type: 'checkbox',
      defaultValue: false
    },
    {
      id: 'favorite',
      label: t('favorite') || 'Favorite',
      type: 'checkbox',
      defaultValue: false
    }
  ];
  
  // Define table columns
  const columns = [
    { 
      key: 'wine_name', 
      label: t('wine'), 
      sortable: true,
      className: 'wine-name'
    },
    { 
      key: 'year', 
      label: t('year'), 
      sortable: true,
      render: (item) => item.year || '-'
    },
    { 
      key: 'producer_name', 
      label: t('producer'), 
      sortable: true,
      render: (item) => item.producer_name || '-'
    },
    {
      key: 'wishlist',
      label: t('wishlist') || 'Wishlist',
      sortable: true,
      render: (item) => item.wishlist ? '✔️' : '-'
    },
    {
      key: 'favorite',
      label: t('favorite') || 'Favorite',
      sortable: true,
      render: (item) => item.favorite ? '✔️' : '-'
    },
    { 
      key: 'country', 
      label: t('country'), 
      sortable: true,
      className: 'hide-on-mobile',
      render: (item) => item.country_tag ? item.country_tag.name : (item.country || '-')
    },
    { 
      key: 'region', 
      label: t('region'), 
      sortable: true,
      className: 'hide-on-mobile',
      render: (item) => item.region_tag ? item.region_tag.name : (item.region || '-')
    },
    { 
      key: 'wine_type_tags', 
      label: t('type'), 
      sortable: false,
      render: (item) => {
        if (item.wine_type_tags && item.wine_type_tags.length > 0) {
          return item.wine_type_tags.map(tag => tag.name).join(', ');
        }
        return '-';
      }
    },
    { 
      key: 'grape_tags', 
      label: t('grapes'), 
      sortable: false,
      className: 'hide-on-mobile',
      render: (item) => (
        <div className="grape-tags">
          {item.grape_tags && item.grape_tags.length > 0 ? (
            item.grape_tags.map(tag => (
              <span key={tag.id} className="grape-tag">{tag.name}</span>
            ))
          ) : (
            '-'
          )}
        </div>
      )
    },
    { 
      key: 'maturity', 
      label: t('maturity'), 
      sortable: true,
      className: 'hide-on-mobile',
      render: (item) => item.maturity || '-'
    },
    { 
      key: 'occasion_tags', 
      label: t('occasion'), 
      sortable: false,
      className: 'hide-on-mobile',
      render: (item) => (
        <div className="tag-list">
          {item.occasion_tags && item.occasion_tags.length > 0 ? (
            item.occasion_tags.map(tag => (
              <span key={tag.id} className="tag" data-tag-type="occasion">{tag.name}</span>
            ))
          ) : (
            '-'
          )}
        </div>
      )
    },
    { 
      key: 'food_pairing_tags', 
      label: t('foodPairing'), 
      sortable: false,
      className: 'hide-on-mobile',
      render: (item) => (
        <div className="tag-list">
          {item.food_pairing_tags && item.food_pairing_tags.length > 0 ? (
            item.food_pairing_tags.map(tag => (
              <span key={tag.id} className="tag" data-tag-type="food-pairing">{tag.name}</span>
            ))
          ) : (
            '-'
          )}
        </div>
      )
    },
    { 
      key: 'inventory', 
      label: t('quantity'), 
      sortable: true,
      className: 'quantity-cell'
    },
    {
      key: 'actions',
      label: t('actions'),
      sortable: false,
      render: (item) => (
        <ActionButtons
          actions={[
            {
              label: '+',
              onClick: () => handleAddBottle(item.wine_id),
              variant: 'success',
              size: 'small',
              title: t('addBottle')
            },
            {
              label: '-',
              onClick: () => handleConsumeBottle(item.wine_id),
              variant: 'danger',
              size: 'small',
              title: t('consumeBottle')
            }
          ]}
          size="small"
        />
      )
    }
  ];
  
  // Create header actions
  const headerActions = (
    <Link to="/add-to-inventory" className="button button-primary">
      {t('addToInventory')}
    </Link>
  );

  return (
    <div className="page">
      <PageHeader 
        title={t('inventoryOverview')}
        actions={headerActions}
      />
      
      <FilterBar
        filters={filterDefinitions}
        filterValues={filterValues}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        collapsible
      />
      
      {/* Results count */}
      <div className="results-count">
        {filteredInventory.length} {t('winesFound')}
      </div>
      
      {error ? (
        <div className="error-message">{error}</div>
      ) : inventory.length === 0 ? (
        <EmptyState
          message={t('noInventoryFound')}
          actionText={t('addToYourInventory')}
          actionLink="/add-to-inventory"
        />
      ) : filteredInventory.length === 0 ? (
        <EmptyState
          message={t('noMatchingWinesFound')}
        />
      ) : (
        <DataTable
          columns={columns}
          data={sortedInventory}
          sortConfig={sortConfig}
          onSort={handleSort}
          isLoading={loading}
          className="inventory-table"
        />
      )}
    </div>
  );
}

export default InventoryOverview;
