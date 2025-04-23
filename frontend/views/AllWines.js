import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader, ContentCard, EmptyState, ActionButtons, FilterBar } from '../components/common';
import { inventoryService, wineService, producerService, tagService } from '../services';
import '../styles/global.css';
import '../styles/allWines.css';

function AllWines() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [wines, setWines] = useState([]);
  const [filteredWines, setFilteredWines] = useState([]);
  const [producers, setProducers] = useState({});
  const [winesByType, setWinesByType] = useState({});
  const [wineTypeTags, setWineTypeTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inventoryMap, setInventoryMap] = useState({});
  
  // Filter options state
  const [filterOptions, setFilterOptions] = useState({
    producers: [],
    countries: [],
    regions: [],
    types: [],
    grapes: [],
    years: { min: 1900, max: new Date().getFullYear() },
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
    occasions: [],
    foodPairings: [],
    wishlist: false,
    favorite: false
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch wines
        const winesData = await wineService.getAllWines();
        setWines(winesData);
        setFilteredWines(winesData);
        
        // Fetch producers
        const producersData = await producerService.getAllProducers();
        
        // Fetch inventory
        const inventoryData = await inventoryService.getCurrentInventory();
        // Create a map of wine_id -> true for wines in inventory
        const inventoryMapping = {};
        inventoryData.forEach(item => {
          inventoryMapping[item.wine_id] = true;
        });
        setInventoryMap(inventoryMapping);
        
        // Create a map of producer IDs to producer data for quick lookup
        const producersMap = {};
        producersData.forEach(producer => {
          producersMap[producer.id] = {
            name: producer.name,
            country: producer.country_tag ? producer.country_tag.name : producer.country,
            region: producer.region_tag ? producer.region_tag.name : producer.region
          };
        });
        setProducers(producersMap);

        // Fetch wine type tags
        const wineTypeTagsResponse = await tagService.getAllWineTypeTags();
        
        // Sort wine type tags by name for consistent ordering
        const sortedWineTypeTags = wineTypeTagsResponse.sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        setWineTypeTags(sortedWineTypeTags);
        
        // Extract filter options from data
        const producerNames = [...new Set(producersData.map(producer => producer.name))].sort();
        
        // Extract countries from producer data
        const countries = [...new Set(producersData.map(producer => {
          return producer.country_tag ? producer.country_tag.name : producer.country;
        }).filter(Boolean))].sort();
        
        // Extract regions from producer data
        const regions = [...new Set(producersData.map(producer => {
          return producer.region_tag ? producer.region_tag.name : producer.region;
        }).filter(Boolean))].sort();
        
        // Extract wine types from wine_type_tags
        const types = sortedWineTypeTags.map(tag => tag.name);
        
        // Extract all grape tags
        const allGrapeTags = winesData.flatMap(item => item.grape_tags || []);
        const uniqueGrapes = [...new Set(allGrapeTags.map(tag => tag.name))].sort();
        
        // Extract all occasion tags
        const allOccasionTags = winesData.flatMap(item => item.occasion_tags || []);
        const uniqueOccasions = [...new Set(allOccasionTags.map(tag => tag.name))].sort();
        
        // Extract all food pairing tags
        const allFoodPairingTags = winesData.flatMap(item => item.food_pairing_tags || []);
        const uniqueFoodPairings = [...new Set(allFoodPairingTags.map(tag => tag.name))].sort();
        
        // Find min and max years
        const years = winesData.map(item => parseInt(item.year)).filter(year => !isNaN(year));
        const minYear = years.length > 0 ? Math.min(...years) : 1900;
        const maxYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();
        
        setFilterOptions({
          producers: producerNames,
          countries,
          regions,
          types,
          grapes: uniqueGrapes,
          years: { min: minYear, max: maxYear },
          occasions: uniqueOccasions,
          foodPairings: uniqueFoodPairings
        });
        
        // Initialize year filters with actual min/max values
        setFilterValues(prev => ({
          ...prev,
          yearMin: minYear,
          yearMax: maxYear
        }));
        
        // Create sections for all wine types first
        const groupedWines = {};
        sortedWineTypeTags.forEach(tag => {
          groupedWines[tag.name] = [];
        });
        
        // Add uncategorized section at the end
        const uncategorizedKey = t('uncategorized');
        groupedWines[uncategorizedKey] = [];
        
        // Group wines by type tags
        winesData.forEach(wine => {
          if (!wine.wine_type_tags || wine.wine_type_tags.length === 0) {
            // Handle wines without type tags
            groupedWines[uncategorizedKey].push(wine);
          } else {
            // Add wine to each of its type tag sections
            wine.wine_type_tags.forEach(tag => {
              if (groupedWines[tag.name]) {
                groupedWines[tag.name].push(wine);
              }
            });
          }
        });
        
        // Remove empty sections
        Object.keys(groupedWines).forEach(key => {
          if (groupedWines[key].length === 0) {
            delete groupedWines[key];
          }
        });
        setWinesByType(groupedWines);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilterValues(newFilters);
    
    const filtered = wines.filter(item => {
      // Producer filter
      if (newFilters.producer && producers[item.producer_id]?.name !== newFilters.producer) {
        return false;
      }
      
      // Country filter
      if (newFilters.country) {
        const itemCountry = producers[item.producer_id]?.country;
        if (itemCountry !== newFilters.country) {
          return false;
        }
      }
      
      // Region filter
      if (newFilters.region) {
        const itemRegion = producers[item.producer_id]?.region;
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
    
    setFilteredWines(filtered);
    
    // Update winesByType based on filtered wines
    const groupedWines = {};
    wineTypeTags.forEach(tag => {
      groupedWines[tag.name] = [];
    });
    
    // Add uncategorized section at the end
    const uncategorizedKey = t('uncategorized');
    groupedWines[uncategorizedKey] = [];
    
    // Group filtered wines by type tags
    filtered.forEach(wine => {
      if (!wine.wine_type_tags || wine.wine_type_tags.length === 0) {
        // Handle wines without type tags
        groupedWines[uncategorizedKey].push(wine);
      } else {
        // Add wine to each of its type tag sections
        wine.wine_type_tags.forEach(tag => {
          if (groupedWines[tag.name]) {
            groupedWines[tag.name].push(wine);
          }
        });
      }
    });
    
    // Remove empty sections
    Object.keys(groupedWines).forEach(key => {
      if (groupedWines[key].length === 0) {
        delete groupedWines[key];
      }
    });
    
    setWinesByType(groupedWines);
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
      occasions: [],
      foodPairings: [],
      wishlist: false,
      favorite: false
    });
    
    setFilteredWines(wines);
    
    // Reset winesByType to original grouping
    const groupedWines = {};
    wineTypeTags.forEach(tag => {
      groupedWines[tag.name] = [];
    });
    
    // Add uncategorized section at the end
    const uncategorizedKey = t('uncategorized');
    groupedWines[uncategorizedKey] = [];
    
    // Group all wines by type tags
    wines.forEach(wine => {
      if (!wine.wine_type_tags || wine.wine_type_tags.length === 0) {
        // Handle wines without type tags
        groupedWines[uncategorizedKey].push(wine);
      } else {
        // Add wine to each of its type tag sections
        wine.wine_type_tags.forEach(tag => {
          if (groupedWines[tag.name]) {
            groupedWines[tag.name].push(wine);
          }
        });
      }
    });
    
    // Remove empty sections
    Object.keys(groupedWines).forEach(key => {
      if (groupedWines[key].length === 0) {
        delete groupedWines[key];
      }
    });
    
    setWinesByType(groupedWines);
  };

  // Format grape tags as a comma-separated string
  const formatGrapeTags = (grapeTags) => {
    if (!grapeTags || !grapeTags.length) return '';
    return grapeTags.map(tag => tag.name).join(', ');
  };

  // Create action buttons for the header
  const headerActions = (
    <Link to="/add-wine" className="button button-primary">
      {t('addWine')}
    </Link>
  );

  // Handle assessment button click
  const handleAssessmentClick = (wine) => {
    // Get the wine type from the wine's type tags
    const wineType = wine.wine_type_tags && wine.wine_type_tags.length > 0
      ? wine.wine_type_tags[0].name  // Use the first type tag
      : '';
    navigate(`/add-assessment?wine_id=${wine.id}&wine_type=${encodeURIComponent(wineType)}`);
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

  return (
    <div className="page">
      <PageHeader 
        title={t('allWines')} 
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
        {loading ? t('loading') : `${filteredWines.length} ${t('winesFound')}`}
      </div>
      
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {Object.keys(winesByType).length === 0 ? (
        <EmptyState
          message={t('noWinesFound')}
          actionText={t('addYourFirstWine')}
          actionLink="/add-wine"
        />
      ) : (
        Object.entries(winesByType).map(([type, typeWines]) => (
          <ContentCard 
            key={type} 
            title={type}
            className="wine-type-section"
          >
            <ul className="wine-list">
              {typeWines.map((wine) => (
                <li key={wine.id} className="wine-item">
                  <div className="wine-info">
                    <div className="wine-name-year-producer">
                      <Link to={`/edit-wine/${wine.id}`} className="wine-name">
                        <strong>{wine.name}</strong>
                      </Link>
                      {wine.year && <span className="wine-year">{wine.year}</span>}
                      {producers[wine.producer_id]?.name && (
                        <span className="wine-producer">, {producers[wine.producer_id]?.name}</span>
                      )}
                    </div>
                    <div className="wine-grapes-container">
                      {wine.grape_tags && wine.grape_tags.length > 0 && (
                        <span className="wine-grapes">{formatGrapeTags(wine.grape_tags)}</span>
                      )}
                    </div>
                    {wine.wine_description && (
                      <div className="wine-description">
                        {wine.wine_description}
                      </div>
                    )}
                  </div>
                  <div className="wine-actions">
                    {inventoryMap[wine.id] && <span className="wine-inventory-icon" title={t('inInventory')}>🍾</span>}
                    {wine.favorite === 1 && <span className="wine-favorite-icon" title={t('favorite')}>★</span>}
                    {wine.wishlist === 1 && <span className="wine-wishlist-icon" title={t('wishlist')}>🛒</span>}
                    <ActionButtons
                      actions={[
                        {
                          label: t('WSET'),
                          onClick: () => handleAssessmentClick(wine),
                          variant: 'primary',
                          size: 'small',
                          title: t('addWSET')
                        }
                      ]}
                      size="small"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </ContentCard>
        ))
      )}
    </div>
  );
}

export default AllWines;
