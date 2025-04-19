import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader, ContentCard, ActionButtons } from '../components/common';
import { Input, LoadingSpinner } from '../components/ui';
import TagsInput from '../components/TagsInput';
import { producerService } from '../services';
import '../styles/global.css';

function AddProducer() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    country: '',
    region: '',
    website: '',
    geocoordinates: '',
    contact: ''
  });
  
  const [selectedCountryTags, setSelectedCountryTags] = useState([]);
  const [selectedRegionTags, setSelectedRegionTags] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  useEffect(() => {
    if (id) {
      const fetchProducer = async () => {
        setLoading(true);
        try {
          const producerData = await producerService.getProducerById(id);
          
          setFormData(producerData);
          
          // Set country tag if available
          if (producerData.country_tag) {
            setSelectedCountryTags([producerData.country_tag]);
          }
          
          // Set region tag if available
          if (producerData.region_tag) {
            setSelectedRegionTags([producerData.region_tag]);
          }
          
          setError(null);
        } catch (error) {
          console.error('Error fetching producer:', error);
          setError(t('errorFetchingProducer'));
        } finally {
          setLoading(false);
        }
      };

      fetchProducer();
    }
  }, [id, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Prepare data for submission
      const submissionData = {
        ...formData
      };
      
      // Add country tag ID if selected
      if (selectedCountryTags.length > 0) {
        submissionData.country_tag_id = selectedCountryTags[0].id;
      }
      
      // Add region tag ID if selected
      if (selectedRegionTags.length > 0) {
        submissionData.region_tag_id = selectedRegionTags[0].id;
      }
      
      await producerService.createOrUpdateProducer(submissionData);
      setSuccess(true);
      
      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate('/all-producers');
      }, 1500);
    } catch (error) {
      console.error('Error adding producer:', error);
      setError(error.message || t('failedToAddProducer'));
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const validationRules = {
    name: { required: t('nameRequired') },
    country: { required: t('countryRequired') }
  };

  // Create form action buttons
  const formActions = (
    <ActionButtons
      actions={[
        {
          label: t('cancel'),
          variant: 'secondary',
          onClick: () => navigate('/all-producers'),
          disabled: loading
        },
        {
          label: loading ? (
            <>
              <LoadingSpinner size="small" color="white" />
              <span style={{ marginLeft: '0.5rem' }}>{t('saving')}</span>
            </>
          ) : (
            isEditMode ? t('update') : t('add')
          ),
          variant: 'primary',
          type: 'submit',
          disabled: loading
        }
      ]}
    />
  );

  return (
    <div className="page">
      <PageHeader title={isEditMode ? t('editProducer') : t('addProducer')} />
      
      <ContentCard className="animate-fade-in">
        {error && (
          <div className="error-message mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message mb-4">
            {isEditMode ? t('producerUpdatedSuccessfully') : t('producerAddedSuccessfully')}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="form">
          <div className="form-content">
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('name')}<span className="input-required">*</span></div>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={t('enterProducerName')}
                  error={validationRules.name.required && !formData.name ? validationRules.name.required : null}
                  floatingLabel={false}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('country')}<span className="input-required">*</span></div>
                <TagsInput
                  selectedTags={selectedCountryTags}
                  setSelectedTags={setSelectedCountryTags}
                  apiEndpoint="country_tags"
                  placeholder={t('enterCountry')}
                  maxTags={1}
                />
                {validationRules.country.required && selectedCountryTags.length === 0 && (
                  <div className="error-message">{validationRules.country.required}</div>
                )}
              </div>
              
              <div className="form-col">
                <div className="input-label">{t('region')}</div>
                <TagsInput
                  selectedTags={selectedRegionTags}
                  setSelectedTags={setSelectedRegionTags}
                  apiEndpoint="region_tags"
                  placeholder={t('enterRegion')}
                  maxTags={1}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('description')}</div>
                <Input
                  id="description"
                  name="description"
                  type="textarea"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={t('enterDescription')}
                  maxLength={500}
                  showCounter
                  floatingLabel={false}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('website')}</div>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder={t('enterWebsite')}
                  floatingLabel={false}
                />
              </div>
              
              <div className="form-col">
                <div className="input-label">{t('geocoordinates')}</div>
                <Input
                  id="geocoordinates"
                  name="geocoordinates"
                  value={formData.geocoordinates}
                  onChange={handleChange}
                  placeholder={t('enterGeocoordinates')}
                  floatingLabel={false}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="input-label">{t('contact')}</div>
                <Input
                  id="contact"
                  name="contact"
                  type="textarea"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder={t('enterContact')}
                  maxLength={500}
                  showCounter
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

export default AddProducer;
