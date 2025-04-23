import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { wineService, producerService, tagService } from '../services';
import { useForm, Controller } from 'react-hook-form';
import { PageHeader, ActionButtons, ContentCard } from '../components/common';
import '../styles/global.css';
import '../styles/forms.css';
import TagsInput from '../components/TagsInput';
import { Input, Select, LoadingSpinner } from '../components/ui';

function AddWine() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [producers, setProducers] = useState([]);
  const [selectedGrapeTags, setSelectedGrapeTags] = useState([]);
  const [selectedWineTypeTags, setSelectedWineTypeTags] = useState([]);
  const [selectedOccasionTags, setSelectedOccasionTags] = useState([]);
  const [selectedFoodPairingTags, setSelectedFoodPairingTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    setValue,
    control
  } = useForm({
    defaultValues: {
      name: '',
      type: '',
      year: new Date().getFullYear(),
      producer_id: '',
      terroir: '',
      wine_description: '',
      grape: '',
      grape_description: '',
      bottle_top: '',
      bottle_format: 'standard', // Default to standard bottle (0.75l)
      maturity: '',
      wishlist: false,
      favorite: false
    }
  });

  // Fetch producers on component mount
  useEffect(() => {
    const fetchProducers = async () => {
      setLoading(true);
      setError(null);
      try {
        const producersData = await producerService.getAllProducers();
        setProducers(producersData);
      } catch (err) {
        console.error('Error fetching producers:', err);
        setError('Failed to load producers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducers();
  }, []);

  // Fetch wine data if editing an existing wine
  useEffect(() => {
    if (id) {
      const fetchWine = async () => {
        setLoading(true);
        setError(null);
        try {
          const wineData = await wineService.getWineById(id);
          
          // Set form values
          Object.keys(wineData).forEach(key => {
            if (key !== 'grape_tags' && key !== 'wine_type_tags' && key !== 'occasion_tags' && key !== 'food_pairing_tags') {
              setValue(key, wineData[key]);
            }
          });
          
          // Set grape tags if available
          if (wineData.grape_tags) {
            setSelectedGrapeTags(wineData.grape_tags);
          }
          
          // Set wine type tags if available
          if (wineData.wine_type_tags) {
            setSelectedWineTypeTags(wineData.wine_type_tags);
          }
          
          // Set occasion tags if available
          if (wineData.occasion_tags) {
            setSelectedOccasionTags(wineData.occasion_tags);
          }
          
          // Set food pairing tags if available
          if (wineData.food_pairing_tags) {
            setSelectedFoodPairingTags(wineData.food_pairing_tags);
          }
        } catch (err) {
          console.error('Error fetching wine:', err);
          setError('Failed to load wine data. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      fetchWine();
    }
  }, [id, setValue]);

  // Form submission handler
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Add grape tags to the request
      const wineResponse = await wineService.createOrUpdateWine({
        ...data,
        id: id || undefined
      });
      
      const wineId = wineResponse.id;
      
      // Link grape tags to the wine if any are selected
      if (selectedGrapeTags.length > 0) {
        await tagService.updateGrapeTags(wineId, selectedGrapeTags.map(tag => tag.id));
      }
      
      // Link wine type tags to the wine if any are selected
      if (selectedWineTypeTags.length > 0) {
        await tagService.updateWineTypeTags(wineId, selectedWineTypeTags.map(tag => tag.id));
      }
      
      // Link occasion tags to the wine if any are selected
      if (selectedOccasionTags.length > 0) {
        await tagService.updateOccasionTags(wineId, selectedOccasionTags.map(tag => tag.id));
      }
      
      // Link food pairing tags to the wine if any are selected
      if (selectedFoodPairingTags.length > 0) {
        await tagService.updateFoodPairingTags(wineId, selectedFoodPairingTags.map(tag => tag.id));
      }
      
      // Navigate back to the wines list
      navigate('/all-wines');
    } catch (err) {
      console.error('Error saving wine:', err);
      setError('Failed to save wine. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert producers to options format for Select component
  const producerOptions = producers.map(producer => ({
    value: producer.id,
    label: producer.name
  }));
  
  // Bottle format options
  const bottleFormatOptions = [
    { value: 'piccolo', label: `${t('piccolo')} (0.2l)` },
    { value: 'half', label: `${t('halfBottle')} (0.375l)` },
    { value: 'standard', label: `${t('standardBottle')} (0.75l)` },
    { value: 'magnum', label: `${t('magnum')} (1.5l)` },
    { value: 'double_magnum', label: `${t('doubleMagnum')} (3l)` },
    { value: 'jeroboam', label: `${t('jeroboam')} (4.5l)` },
    { value: 'imperial', label: `${t('imperial')} (6l)` }
  ];
  
  // Bottle top options
  const bottleTopOptions = [
    { value: 'cork', label: t('cork') },
    { value: 'synthetic_cork', label: t('syntheticCork') },
    { value: 'screw_cap', label: t('screwCap') },
    { value: 'glass_stopper', label: t('glassStopper') },
    { value: 'crown_cap', label: t('crownCap') }
  ];
  
  // Maturity options
  const maturityOptions = [
    { value: 'drink_now', label: t('drinkNow') },
    { value: 'within_1_year', label: t('within1Year') },
    { value: 'within_3_years', label: t('within3Years') },
    { value: 'within_5_years', label: t('within5Years') },
    { value: 'within_10_years', label: t('within10Years') },
    { value: 'after_5_years', label: t('after5Years') },
    { value: 'after_10_years', label: t('after10Years') }
  ];

  // Create form action buttons
  const formActions = (
    <ActionButtons
      actions={[
        {
          label: t('cancel'),
          variant: 'secondary',
          onClick: () => navigate('/all-wines'),
          disabled: isSubmitting
        },
        {
          label: isSubmitting ? (
            <>
              <LoadingSpinner size="small" color="white" />
              <span style={{ marginLeft: '0.5rem' }}>{t('saving')}</span>
            </>
          ) : (
            id ? t('update') : t('add')
          ),
          variant: 'primary',
          type: 'submit',
          disabled: isSubmitting
        }
      ]}
    />
  );

  if (loading && !isSubmitting) {
    return (
      <div className="page">
        <PageHeader title={id ? t('editWine') : t('addWine')} />
        <div className="loading-container">
          <LoadingSpinner size="large" />
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title={id ? t('editWine') : t('addWine')} />
      
      <ContentCard>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="form-content">
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('name')}<span className="input-required">*</span></div>
                <Input
                  id="name"
                  name="name"
                  required
                  floatingLabel={false}
                  {...register('name', { 
                    required: t('nameRequired') 
                  })}
                  error={errors.name?.message}
                />
              </div>
              
              <div className="form-col">
                <div className="input-label">{t('year')}<span className="input-required">*</span></div>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  required
                  floatingLabel={false}
                  {...register('year', { 
                    required: t('yearRequired'),
                    min: {
                      value: 1800,
                      message: t('yearMinimum')
                    },
                    max: {
                      value: new Date().getFullYear(),
                      message: t('yearMaximum')
                    }
                  })}
                  error={errors.year?.message}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('producer')}<span className="input-required">*</span></div>
                <Controller
                  name="producer_id"
                  control={control}
                  rules={{ required: t('producerRequired') }}
                  render={({ field }) => (
                    <Select
                      id="producer_id"
                      name="producer_id"
                      required
                      options={producerOptions}
                      placeholder={t('selectProducer')}
                      searchable={true}
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        setValue('producer_id', e.target.value);
                      }}
                      error={errors.producer_id?.message}
                    />
                  )}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('wineType')}<span className="input-required">*</span></div>
                <TagsInput
                  selectedTags={selectedWineTypeTags}
                  setSelectedTags={setSelectedWineTypeTags}
                  apiEndpoint="wine_type_tags"
                  placeholder={t('addNewWineTypeTag')}
                />
                <Input
                  id="type"
                  name="type"
                  type="hidden"
                  {...register('type')}
                />
                {errors.type && <p className="error-message">{errors.type.message}</p>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('wineDescription')}</div>
                <Input
                  id="wine_description"
                  name="wine_description"
                  type="textarea"
                  floatingLabel={false}
                  {...register('wine_description')}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('terroir')}</div>
                <Input
                  id="terroir"
                  name="terroir"
                  floatingLabel={false}
                  {...register('terroir')}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('grapes')}</div>
                <TagsInput
                  selectedTags={selectedGrapeTags}
                  setSelectedTags={setSelectedGrapeTags}
                  apiEndpoint="grape_tags"
                  placeholder={t('addNewTag')}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('grapeDescription')}</div>
                <Input
                  id="grape_description"
                  name="grape_description"
                  type="textarea"
                  floatingLabel={false}
                  {...register('grape_description')}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('bottleFormat')}</div>
                <Controller
                  name="bottle_format"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="bottle_format"
                      name="bottle_format"
                      options={bottleFormatOptions}
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        setValue('bottle_format', e.target.value);
                      }}
                    />
                  )}
                />
              </div>
              
              <div className="form-col">
                <div className="input-label">{t('bottleTop')}</div>
                <Controller
                  name="bottle_top"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="bottle_top"
                      name="bottle_top"
                      options={bottleTopOptions}
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        setValue('bottle_top', e.target.value);
                      }}
                    />
                  )}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('maturity')}</div>
                <Controller
                  name="maturity"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="maturity"
                      name="maturity"
                      options={maturityOptions}
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        setValue('maturity', e.target.value);
                      }}
                    />
                  )}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('occasion')}</div>
                <TagsInput
                  selectedTags={selectedOccasionTags}
                  setSelectedTags={setSelectedOccasionTags}
                  apiEndpoint="occasion_tags"
                  placeholder={t('addOccasion')}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('foodPairing')}</div>
                <TagsInput
                  selectedTags={selectedFoodPairingTags}
                  setSelectedTags={setSelectedFoodPairingTags}
                  apiEndpoint="food_pairing_tags"
                  placeholder={t('addFoodPairing')}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="wishlist"
                    {...register('wishlist')}
                  />
                  <label htmlFor="wishlist">{t('wishlist')}</label>
                </div>
              </div>
              
              <div className="form-col">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="favorite"
                    {...register('favorite')}
                  />
                  <label htmlFor="favorite">{t('favorite')}</label>
                </div>
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

export default AddWine;
