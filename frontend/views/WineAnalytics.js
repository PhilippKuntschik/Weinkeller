import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { PageHeader, ContentCard } from '../components/common';
import { getCurrentInventory, calculateInventoryStats } from '../services/inventoryService';
import '../styles/wineAnalytics.css';

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function WineAnalytics() {
  const { t } = useTranslation();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalBottles: 0,
    totalWines: 0,
    averageBottlesPerWine: 0
  });
  
  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const data = await getCurrentInventory();
        setInventory(data);
        setStats(calculateInventoryStats(data));
        setError(null);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setError('Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventory();
  }, []);
  
  // Process data for wine types pie chart
  const wineTypeData = React.useMemo(() => {
    if (!inventory.length) return null;
    
    // Count bottles by wine type
    const typeCounts = {};
    inventory.forEach(item => {
      if (item.wine_type_tags && item.wine_type_tags.length > 0) {
        item.wine_type_tags.forEach(tag => {
          typeCounts[tag.name] = (typeCounts[tag.name] || 0) + item.inventory;
        });
      } else {
        typeCounts['Unspecified'] = (typeCounts['Unspecified'] || 0) + item.inventory;
      }
    });
    
    // Prepare data for chart.js
    const labels = Object.keys(typeCounts);
    const data = Object.values(typeCounts);
    
    // Generate colors
    const backgroundColors = labels.map((_, i) => 
      `hsl(${(i * 360) / labels.length}, 70%, 60%)`
    );
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    };
  }, [inventory]);
  
  // Process data for country distribution pie chart
  const countryData = React.useMemo(() => {
    if (!inventory.length) return null;
    
    // Count bottles by country
    const countryCounts = {};
    inventory.forEach(item => {
      const countryName = item.country_tag ? item.country_tag.name : 
                         (item.country ? item.country : t('unknownProducer'));
      
      countryCounts[countryName] = (countryCounts[countryName] || 0) + item.inventory;
    });
    
    // Prepare data for chart.js
    const labels = Object.keys(countryCounts);
    const data = Object.values(countryCounts);
    
    // Generate colors with a different hue range than wine types
    const backgroundColors = labels.map((_, i) => 
      `hsl(${120 + (i * 360) / labels.length}, 70%, 60%)`
    );
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    };
  }, [inventory, t]);
  
  // Process data for grape varieties pie chart
  const grapeData = React.useMemo(() => {
    if (!inventory.length) return null;
    
    // Count bottles by grape variety
    const grapeCounts = {};
    inventory.forEach(item => {
      if (item.grape_tags && item.grape_tags.length > 0) {
        item.grape_tags.forEach(tag => {
          grapeCounts[tag.name] = (grapeCounts[tag.name] || 0) + item.inventory;
        });
      } else if (item.grape) {
        // If there are no grape tags but there is a grape field
        grapeCounts[item.grape] = (grapeCounts[item.grape] || 0) + item.inventory;
      } else {
        grapeCounts['Unspecified'] = (grapeCounts['Unspecified'] || 0) + item.inventory;
      }
    });
    
    // Prepare data for chart.js
    const labels = Object.keys(grapeCounts);
    const data = Object.values(grapeCounts);
    
    // Generate colors with a different hue range than the other charts
    const backgroundColors = labels.map((_, i) => 
      `hsl(${240 + (i * 360) / labels.length}, 70%, 60%)`
    );
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    };
  }, [inventory]);
  
  // Chart options factory function to create options with different titles
  const createChartOptions = (titleKey) => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: t(titleKey),
        },
      },
    };
  };
  
  return (
    <div className="page">
      <PageHeader title={t('wineAnalytics')} />
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="analytics-summary">
        <div className="stat-card">
          <div className="stat-value">{stats.totalBottles}</div>
          <div className="stat-label">{t('totalBottles')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalWines}</div>
          <div className="stat-label">{t('uniqueWines')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.averageBottlesPerWine}</div>
          <div className="stat-label">{t('avgBottlesPerWine')}</div>
        </div>
      </div>
      
      <div className="analytics-grid">
        <ContentCard 
          title={t('wineTypeDistribution')}
          className="chart-card"
        >
          {loading ? (
            <div className="loading-indicator">{t('loading')}</div>
          ) : !wineTypeData ? (
            <div className="no-data-message">{t('noWineData')}</div>
          ) : (
            <div className="chart-container">
              <Pie data={wineTypeData} options={createChartOptions('wineTypeDistribution')} />
            </div>
          )}
        </ContentCard>
        
        <ContentCard 
          title={t('countryDistribution')}
          className="chart-card"
        >
          {loading ? (
            <div className="loading-indicator">{t('loading')}</div>
          ) : !countryData ? (
            <div className="no-data-message">{t('noWineData')}</div>
          ) : (
            <div className="chart-container">
              <Pie data={countryData} options={createChartOptions('countryDistribution')} />
            </div>
          )}
        </ContentCard>
        
        <ContentCard 
          title={t('grapeDistribution')}
          className="chart-card"
        >
          {loading ? (
            <div className="loading-indicator">{t('loading')}</div>
          ) : !grapeData ? (
            <div className="no-data-message">{t('noWineData')}</div>
          ) : (
            <div className="chart-container">
              <Pie data={grapeData} options={createChartOptions('grapeDistribution')} />
            </div>
          )}
        </ContentCard>
      </div>
    </div>
  );
}

export default WineAnalytics;
