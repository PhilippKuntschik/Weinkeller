import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { wineService, inventoryService } from '../services';
import { PageHeader, ContentCard, ActionButtons } from '../components/common';
import { Input, Select, Button, LoadingSpinner } from '../components/ui';
import '../styles/global.css';

function AddToInventory() {
  const { t } = useTranslation();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const prefilledWineId = queryParams.get('wine_id');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [wines, setWines] = useState([]);

  const [formData, setFormData] = useState({
    wine_id: prefilledWineId || '',
    event_type: 'online',
    quantity: '',
    price: '',
    bought_at: '',
    event_date: new Date().toISOString().split('T')[0] // Default to today
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWines = async () => {
      setLoading(true);
      try {
        const wines = await wineService.getAllWines();
        setWines(wines);
        setError(null);
      } catch (error) {
        console.error('Error fetching wines:', error);
        setError(t('errorFetchingWines'));
      } finally {
        setLoading(false);
      }
    };

    fetchWines();
  }, [t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await inventoryService.addToInventory(formData);
      setSuccess(true);
      
      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate('/inventory-overview');
      }, 1500);
    } catch (error) {
      console.error('Error adding to inventory:', error);
      setError(error.message || t('failedToAddToInventory'));
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Group wines by producer and convert to format expected by Select component
  const wineOptions = wines.reduce((acc, wine) => {
    // Get readable bottle format
    let bottleFormat = '';
    switch(wine.bottle_format) {
      case 'piccolo': bottleFormat = '0.2l'; break;
      case 'half': bottleFormat = '0.375l'; break;
      case 'standard': bottleFormat = '0.75l'; break;
      case 'magnum': bottleFormat = '1.5l'; break;
      case 'double_magnum': bottleFormat = '3l'; break;
      case 'jeroboam': bottleFormat = '4.5l'; break;
      case 'imperial': bottleFormat = '6l'; break;
      default: bottleFormat = '0.75l'; // Default to standard
    }

    const producerName = wine.producer_name || t('unknownProducer');
    const wineOption = {
      value: wine.id,
      label: `${wine.name} (${wine.year}, ${bottleFormat})`
    };

    // Find existing producer group or create new one
    const producerGroup = acc.find(group => group.label === producerName);
    if (producerGroup) {
      producerGroup.options.push(wineOption);
    } else {
      acc.push({
        label: producerName,
        options: [wineOption]
      });
    }

    return acc;
  }, []);

  // Sort producer groups alphabetically
  wineOptions.sort((a, b) => a.label.localeCompare(b.label));
  // Sort wines within each producer group
  wineOptions.forEach(group => {
    group.options.sort((a, b) => a.label.localeCompare(b.label));
  });

  // Acquisition type options
  const acquisitionTypeOptions = [
    { value: 'gifted', label: t('gifted') },
    { value: 'producer', label: t('producer') },
    { value: 'fair', label: t('fair') },
    { value: 'event', label: t('event') },
    { value: 'online', label: t('online') }
  ];

  // Create form action buttons
  const formActions = (
    <ActionButtons
      actions={[
        {
          label: t('cancel'),
          variant: 'secondary',
          onClick: () => navigate('/inventory-overview'),
          disabled: loading
        },
        {
          label: loading ? (
            <>
              <LoadingSpinner size="small" color="white" />
              <span style={{ marginLeft: '0.5rem' }}>{t('saving')}</span>
            </>
          ) : t('add'),
          variant: 'primary',
          type: 'submit',
          disabled: loading || wineOptions.length === 0
        }
      ]}
    />
  );

  return (
    <div className="page">
      <PageHeader title={t('addToInventory')} />
      
      <ContentCard className="animate-fade-in">
        {error && (
          <div className="error-message mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message mb-4">
            {t('inventoryAddedSuccessfully')}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="form">
          <div className="form-content">
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('wine')}<span className="input-required">*</span></div>
                <Select
                  id="wine_id"
                  name="wine_id"
                  value={formData.wine_id}
                  onChange={handleChange}
                  options={wineOptions}
                  placeholder={t('selectWine')}
                  required
                  searchable={true}
                  error={!formData.wine_id ? t('wineRequired') : null}
                  disabled={loading || wineOptions.length === 0}
                />
                
                {wineOptions.length === 0 && !loading && !error && (
                  <p className="info-message mt-2">
                    {t('noWinesAvailable')} 
                    <Button 
                      type="button" 
                      variant="text" 
                      onClick={() => navigate('/add-wine')}
                      className="ml-1"
                    >
                      {t('addWine')}
                    </Button>
                  </p>
                )}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('quantity')}<span className="input-required">*</span></div>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="1"
                  error={!formData.quantity ? t('quantityRequired') : null}
                  floatingLabel={false}
                />
              </div>
              
              <div className="form-col">
                <div className="input-label">{t('price')}</div>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  floatingLabel={false}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('acquisitionType')}<span className="input-required">*</span></div>
                <Select
                  id="event_type"
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleChange}
                  options={acquisitionTypeOptions}
                  required
                />
              </div>
              
              <div className="form-col">
                <div className="input-label">{t('acquisition')}</div>
                <Input
                  id="bought_at"
                  name="bought_at"
                  value={formData.bought_at}
                  onChange={handleChange}
                  placeholder={t('enterAcquisitionDetails')}
                  floatingLabel={false}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('eventDate')}</div>
                <Input
                  id="event_date"
                  name="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={handleChange}
                  floatingLabel={false}
                />
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            {formActions}
          </div>
        </form>
      </ContentCard>
    </div>
  );
}

export default AddToInventory;
