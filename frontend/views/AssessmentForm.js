import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { wineService, assessmentService } from '../services';
import { PageHeader, FormSection, ActionButtons, ContentCard } from '../components/common';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TagsInput from '../components/TagsInput';
import '../styles/global.css';
import '../styles/forms.css';
import '../styles/assessments.css';

function WSETForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = !!id;

  // Get parameters from query parameters if available
  const queryParams = new URLSearchParams(location.search);
  const prefilledWineId = queryParams.get('wine_id');
  const prefilledWineType = queryParams.get('wine_type');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [wines, setWines] = useState([]);

  // Form data state
  const [formData, setFormData] = useState({
    wine_id: prefilledWineId || '',
    SAT_date: new Date().toISOString().split('T')[0],
    
    // Appearance
    appearance_clarity: '',
    appearance_intensity: '',
    appearance_color: '',
    appearance_observations: '',
    
    // Nose
    nose_condition: '',
    nose_intensity: '',
    nose_development: '',
    nose_aromas_primary: '',
    nose_aromas_secondary: '',
    nose_aromas_tertiary: '',
    
    // Palate
    palate_sweetness: '',
    palate_acidity: '',
    palate_tannin: '',
    palate_mousse: '',
    palate_alcohol: '',
    palate_body: '',
    palate_flavor_intensity: '',
    palate_flavor_characteristics: '',
    palate_aromas_primary: '',
    palate_aromas_secondary: '',
    palate_aromas_tertiary: '',
    palate_finish: '',
    
    // Conclusions
    conclusions_quality: '',
    conclusions_readiness: '',
    conclusions_aging_potential: '',
    conclusions_notes: ''
  });

  // Wine type state for conditional rendering
  const [wineType, setWineType] = useState(prefilledWineType || '');

  // Fetch wines and SAT data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch wines
        const winesData = await wineService.getAllWines();
        setWines(winesData);
        
        // If in edit mode, fetch SAT data
        if (isEditMode) {
          const SATData = await assessmentService.getSATById(id);
          setFormData(SATData);
          
          // Get wine type for conditional rendering
          const wine = winesData.find(w => w.id === SATData.wine_id);
          if (wine) {
            setWineType(wine.type || '');
          }
        } 
        // If prefilled wine ID is provided but no wine type, try to get it from the wine data
        else if (prefilledWineId && !prefilledWineType) {
          const wine = winesData.find(w => w.id === parseInt(prefilledWineId));
          if (wine && wine.wine_type_tags && wine.wine_type_tags.length > 0) {
            setWineType(wine.wine_type_tags[0].name);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditMode, prefilledWineId]);

  // Handle wine selection change
  const handleWineChange = (e) => {
    const wineId = e.target.value;
    setFormData({ ...formData, wine_id: wineId });
    
    // Update wine type for conditional rendering
    const selectedWine = wines.find(w => w.id === parseInt(wineId));
    if (selectedWine) {
      setWineType(selectedWine.type || '');
    } else {
      setWineType('');
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle tags input changes
  const handleTagsChange = (field, tags) => {
    setFormData({ ...formData, [field]: tags.join(', ') });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    // Log the form data being submitted
    console.log('Submitting assessment form data:', formData);
    
    try {
      // Make sure wine_id is a number
      const dataToSubmit = {
        ...formData,
        wine_id: parseInt(formData.wine_id, 10)
      };
      
      console.log('Processed data to submit:', dataToSubmit);
      
      if (isEditMode) {
        await assessmentService.updateSAT(id, dataToSubmit);
      } else {
        await assessmentService.createSAT(dataToSubmit);
      }
      
      setSuccess(true);
      
      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate('/all-assessments');
      }, 1500);
    } catch (err) {
      console.error('Error saving SAT:', err);
      console.error('Error details:', err.response?.data || err);
      setError(err.message);
      setSuccess(false);
    } finally {
      setSaving(false);
    }
  };

  // Group wines by producer and convert to format expected by Select component
  const wineOptions = wines.reduce((acc, wine) => {
    const producerName = wine.producer_name || t('unknownProducer');
    const wineOption = {
      value: wine.id,
      label: `${wine.name} ${wine.year || ''} (${wine.type || t('uncategorized')})`
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

  // Helper function to convert comma-separated string to array
  const stringToArray = (str) => {
    if (!str) return [];
    return str.split(',').map(item => item.trim()).filter(Boolean);
  };

  // Options for dropdowns
  const clarityOptions = [
    { value: 'clear', label: t('clear') },
    { value: 'hazy', label: t('hazy') },
  ];
  
  const intensityOptions = [
    { value: 'pale', label: t('pale') },
    { value: 'medium-', label: t('medium-') },
    { value: 'medium', label: t('medium') },
    { value: 'medium+', label: t('medium+') },
    { value: 'deep', label: t('deep') }
  ];
  
  const colorOptionsWhite = [
    { value: 'lemonGreen', label: t('lemonGreen') },
    { value: 'lemon', label: t('lemon') },
    { value: 'gold', label: t('gold') },
    { value: 'amber', label: t('amber') },
    { value: 'brown', label: t('brown') }
  ];
  
  const colorOptionsRose = [
    { value: 'pink', label: t('pink') },
    { value: 'salmon', label: t('salmon') },
    { value: 'orange', label: t('orange') }
  ];
  
  const colorOptionsRed = [
    { value: 'purple', label: t('purple') },
    { value: 'ruby', label: t('ruby') },
    { value: 'garnet', label: t('garnet') },
    { value: 'tawny', label: t('tawny') },
    { value: 'brown', label: t('brown') }
  ];
  
  // Combine all color options for the TagsInput
  const allColorOptions = [
    ...colorOptionsWhite,
    ...colorOptionsRose,
    ...colorOptionsRed
  ].map(option => option.label);
  
  const conditionOptions = [
    { value: 'clean', label: t('clean') },
    { value: 'unclean', label: t('unclean') }
  ];
  
  const noseIntensityOptions = [
    { value: 'light', label: t('light') },
    { value: 'medium-', label: t('medium-') },
    { value: 'medium', label: t('medium') },
    { value: 'medium+', label: t('medium+') },
    { value: 'pronounced', label: t('pronounced') }
  ];
  
  const developmentOptions = [
    { value: 'youthful', label: t('youthful') },
    { value: 'developing', label: t('developing') },
    { value: 'fullyDeveloped', label: t('fullyDeveloped') },
    { value: 'tired', label: t('tired') }
  ];
  
  const sweetnessOptions = [
    { value: 'dry', label: t('dry') },
    { value: 'offDry', label: t('offDry') },
    { value: 'mediumDry', label: t('mediumDry') },
    { value: 'mediumSweet', label: t('mediumSweet') },
    { value: 'sweet', label: t('sweet') }
  ];
  
  const acidityOptions = [
    { value: 'low', label: t('low') },
    { value: 'medium-', label: t('medium-') },
    { value: 'medium', label: t('medium') },
    { value: 'medium+', label: t('medium+') },
    { value: 'high', label: t('high') }
  ];
  
  const tanninOptions = [
    { value: 'low', label: t('low') },
    { value: 'medium-', label: t('medium-') },
    { value: 'medium', label: t('medium') },
    { value: 'medium+', label: t('medium+') },
    { value: 'high', label: t('high') }
  ];
  
  const alcoholOptions = [
    { value: 'low', label: t('low') },
    { value: 'medium', label: t('medium') },
    { value: 'high', label: t('high') }
  ];
  
  const bodyOptions = [
    { value: 'light', label: t('light') },
    { value: 'medium-', label: t('medium-') },
    { value: 'medium', label: t('medium') },
    { value: 'medium+', label: t('medium+') },
    { value: 'full', label: t('full') }
  ];
  
  const flavorIntensityOptions = [
    { value: 'light', label: t('light') },
    { value: 'medium-', label: t('medium-') },
    { value: 'medium', label: t('medium') },
    { value: 'medium+', label: t('medium+') },
    { value: 'pronounced', label: t('pronounced') }
  ];
  
  const finishOptions = [
    { value: 'short', label: t('short') },
    { value: 'medium-', label: t('medium-') },
    { value: 'medium', label: t('medium') },
    { value: 'medium+', label: t('medium+') },
    { value: 'long', label: t('long') }
  ];
  
  const qualityOptions = [
    { value: 'faulty', label: t('faulty') },
    { value: 'poor', label: t('poor') },
    { value: 'acceptable', label: t('acceptable') },
    { value: 'good', label: t('good') },
    { value: 'veryGood', label: t('veryGood') },
    { value: 'outstanding', label: t('outstanding') }
  ];
  
  const readinessOptions = [
    { value: 'drinkNow', label: t('drinkNow') },
    { value: 'canKeep', label: t('canKeep') },
    { value: 'notReady', label: t('notReady') },
    { value: 'tooOld', label: t('tooOld') }
  ];
  
  const agingPotentialOptions = [
    { value: 'noPotential', label: t('noPotential') },
    { value: '1to3Years', label: t('1to3Years') },
    { value: '3to5Years', label: t('3to5Years') },
    { value: '5to10Years', label: t('5to10Years') },
    { value: '10PlusYears', label: t('10PlusYears') }
  ];

  // Create form action buttons
  const formActions = (
    <ActionButtons
      actions={[
        {
          label: t('cancel'),
          variant: 'secondary',
          onClick: () => navigate('/all-assessments'),
          disabled: saving
        },
        {
          label: saving ? t('saving') : isEditMode ? t('update') : t('add'),
          variant: 'primary',
          type: 'submit',
          disabled: saving || !formData.wine_id
        }
      ]}
    />
  );

  return (
    <div className="page">
      <PageHeader 
        title={isEditMode ? t('editWSET') : t('addWSET')}
      />
      
      <ContentCard className="animate-fade-in">
        {error && (
          <div className="error-message mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message mb-4">
            {t('SATSaved')}
          </div>
        )}
        
        {loading ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>{t('loading')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="WSET-form">
            {/* Wine Selection Section */}
            <FormSection>
              <div className="form-row">
                <div className="form-col">
                  <div className="input-label">{t('wine')}<span className="input-required">*</span></div>
                  <Select
                    id="wine_id"
                    name="wine_id"
                    value={formData.wine_id}
                    onChange={handleWineChange}
                    options={wineOptions}
                    placeholder={t('selectWine')}
                    required
                    searchable={true}
                    error={!formData.wine_id ? t('wineRequired') : null}
                    disabled={saving || wineOptions.length === 0 || isEditMode}
                  />
                </div>
                
                <div className="form-col">
                  <div className="input-label">{t('SATDate')}</div>
                  <Input
                    id="SAT_date"
                    name="SAT_date"
                    type="date"
                    value={formData.SAT_date}
                    onChange={handleChange}
                    disabled={saving}
                    floatingLabel={false}
                  />
                </div>
              </div>
            </FormSection>
            
            {/* Appearance Section */}
            <FormSection title={t('appearance')} showTitle={true}>
              <div className="form-row">
                <div className="form-col">
                  <div className="input-label">{t('appearanceColor')}</div>
                  <TagsInput
                    id="appearance_color"
                    value={stringToArray(formData.appearance_color)}
                    onChange={(tags) => handleTagsChange('appearance_color', tags)}
                    placeholder={t('enterColors')}
                    disabled={saving}
                    predefinedOptions={allColorOptions}
                  />
                </div>
                
                <div className="form-col">
                  <div className="input-label">{t('appearanceIntensity')}</div>
                  <Select
                    id="appearance_intensity"
                    name="appearance_intensity"
                    value={formData.appearance_intensity}
                    onChange={handleChange}
                    options={intensityOptions}
                    placeholder={t('select')}
                    disabled={saving}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <div className="input-label">{t('appearanceClarity')}</div>
                  <Select
                    id="appearance_clarity"
                    name="appearance_clarity"
                    value={formData.appearance_clarity}
                    onChange={handleChange}
                    options={clarityOptions}
                    placeholder={t('select')}
                    disabled={saving}
                  />
                </div>
                
                <div className="form-col">
                  <div className="input-label">{t('appearanceObservations')}</div>
                  <Input
                    id="appearance_observations"
                    name="appearance_observations"
                    type="text"
                    value={formData.appearance_observations}
                    onChange={handleChange}
                    disabled={saving}
                    floatingLabel={false}
                  />
                </div>
              </div>
            </FormSection>
            
            {/* Nose Section */}
            <FormSection title={t('nose')} showTitle={true}>
              <div className="form-row">
                <div className="form-col">
                  <div className="input-label">{t('noseIntensity')}</div>
                  <Select
                    id="nose_intensity"
                    name="nose_intensity"
                    value={formData.nose_intensity}
                    onChange={handleChange}
                    options={noseIntensityOptions}
                    placeholder={t('select')}
                    disabled={saving}
                  />
                </div>
                
                <div className="form-col">
                  <div className="input-label">{t('noseCondition')}</div>
                  <Select
                    id="nose_condition"
                    name="nose_condition"
                    value={formData.nose_condition}
                    onChange={handleChange}
                    options={conditionOptions}
                    placeholder={t('select')}
                    disabled={saving}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <div className="input-label">{t('noseAromasPrimary')}</div>
                  <TagsInput
                    id="nose_aromas_primary"
                    value={stringToArray(formData.nose_aromas_primary)}
                    onChange={(tags) => handleTagsChange('nose_aromas_primary', tags)}
                    placeholder={t('enterTags')}
                    disabled={saving}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <div className="input-label">{t('noseAromasSecondary')}</div>
                  <TagsInput
                    id="nose_aromas_secondary"
                    value={stringToArray(formData.nose_aromas_secondary)}
                    onChange={(tags) => handleTagsChange('nose_aromas_secondary', tags)}
                    placeholder={t('enterTags')}
                    disabled={saving}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <div className="input-label">{t('noseAromasTertiary')}</div>
                  <TagsInput
                    id="nose_aromas_tertiary"
                    value={stringToArray(formData.nose_aromas_tertiary)}
                    onChange={(tags) => handleTagsChange('nose_aromas_tertiary', tags)}
                    placeholder={t('enterTags')}
                    disabled={saving}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <div className="input-label">{t('noseDevelopment')}</div>
                  <Select
                    id="nose_development"
                    name="nose_development"
                    value={formData.nose_development}
                    onChange={handleChange}
                    options={developmentOptions}
                    placeholder={t('select')}
                    disabled={saving}
                  />
                </div>
              </div>
            </FormSection>
            
            {/* Palate Section */}
            <FormSection title={t('palate')} showTitle={true}>
              <div className="form-row">
                <div className="form-col">
                  <div className="input-label">{t('palateSweetness')}</div>
                  <Select
                    id="palate_sweetness"
                    name="palate_sweetness"
                    value={formData.palate_sweetness}
                    onChange={handleChange}
                    options={sweetnessOptions}
                    placeholder={t('select')}
                    disabled={saving}
                  />
                </div>
                
                <div className="form-col">
                  <div className="input-label">{t('palateAcidity')}</div>
                  <Select
                    id="palate_acidity"
                    name="palate_acidity"
                    value={formData.palate_acidity}
                    onChange={handleChange}
                    options={acidityOptions}
                    placeholder={t('select')}
                    disabled={saving}
                  />
                </div>
                
                <div className="form-col">
                  <div className="input-label">{t('palateTannin')}</div>
                  <Select
                    id="palate_tannin"
                    name="palate_tannin"
                    value={formData.palate_tannin}
                    onChange={handleChange}
                    options={tanninOptions}
                    placeholder={t('select')}
                    disabled={saving}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <div className="input-label">{t('palateMousse')}</div>
                  <Select
                    id="palate_mousse"
                    name="palate_mousse"
                    value={formData.palate_mousse}
                    onChange={handleChange}
                    options={intensityOptions} /* Reusing intensity options for mousse */
                    placeholder={t('select')}
                    disabled={saving}
                  />
                </div>
                
                <div className="form-col">
                  <div className="input-label">{t('palateAlcohol')}</div>
                  <Select
                    id="palate_alcohol"
                    name="palate_alcohol"
                    value={formData.palate_alcohol}
                    onChange={handleChange}
                    options={alcoholOptions}
                    placeholder={t('select')}
                    disabled={saving}
                  />
                </div>
                
                <div className="form-col">
                  <div className="input-label">{t('palateBody')}</div>
                  <Select
                    id="palate_body"
                    name="palate_body"
                    value={formData.palate_body}
                    onChange={handleChange}
                    options={bodyOptions}
                    placeholder={t('select')}
                    disabled={saving}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <div className="input-label">{t('palateFlavorIntensity')}</div>
                  <Select
                    id="palate_flavor_intensity"
                    name="palate_flavor_intensity"
                    value={formData.palate_flavor_intensity}
                    onChange={handleChange}
                    options={flavorIntensityOptions}
                    placeholder={t('select')}
                    disabled={saving}
                  />
                </div>
                
                <div className="form-col">
                  <div className="input-label">{t('palateFinish')}</div>
                  <Select
                    id="palate_finish"
                    name="palate_finish"
                    value={formData.palate_finish}
                    onChange={handleChange}
                    options={finishOptions}
                    placeholder={t('select')}
                    disabled={saving}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <div className="input-label">{t('palateAromasPrimary')}</div>
                  <TagsInput
                    id="palate_aromas_primary"
                    value={stringToArray(formData.palate_aromas_primary)}
                    onChange={(tags) => handleTagsChange('palate_aromas_primary', tags)}
                    placeholder={t('enterTags')}
                    disabled={saving}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <div className="input-label">{t('palateAromasSecondary')}</div>
                  <TagsInput
                    id="palate_aromas_secondary"
                    value={stringToArray(formData.palate_aromas_secondary)}
                    onChange={(tags) => handleTagsChange('palate_aromas_secondary', tags)}
                    placeholder={t('enterTags')}
                    disabled={saving}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <div className="input-label">{t('palateAromasTertiary')}</div>
                  <TagsInput
                    id="palate_aromas_tertiary"
                    value={stringToArray(formData.palate_aromas_tertiary)}
                    onChange={(tags) => handleTagsChange('palate_aromas_tertiary', tags)}
                    placeholder={t('enterTags')}
                    disabled={saving}
                  />
                </div>
              </div>
            </FormSection>
            
            {/* Conclusions Section */}
            <FormSection title={t('conclusions')} showTitle={true}>
              <div className="form-row">
                <div className="form-col">
                  <div className="input-label">{t('conclusionsQuality')}</div>
                  <Select
                    id="conclusions_quality"
                    name="conclusions_quality"
                    value={formData.conclusions_quality}
                    onChange={handleChange}
                    options={qualityOptions}
                    placeholder={t('select')}
                    disabled={saving}
                  />
                </div>
                
                <div className="form-col">
                  <div className="input-label">{t('conclusionsReadiness')}</div>
                  <Select
                    id="conclusions_readiness"
                    name="conclusions_readiness"
                    value={formData.conclusions_readiness}
                    onChange={handleChange}
                    options={readinessOptions}
                    placeholder={t('select')}
                    disabled={saving}
                  />
                </div>
                
                <div className="form-col">
                  <div className="input-label">{t('conclusionsAgingPotential')}</div>
                  <Select
                    id="conclusions_aging_potential"
                    name="conclusions_aging_potential"
                    value={formData.conclusions_aging_potential}
                    onChange={handleChange}
                    options={agingPotentialOptions}
                    placeholder={t('select')}
                    disabled={saving}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <div className="input-label">{t('conclusionsNotes')}</div>
                  <Input
                    id="conclusions_notes"
                    name="conclusions_notes"
                    type="textarea"
                    value={formData.conclusions_notes}
                    onChange={handleChange}
                    disabled={saving}
                    floatingLabel={false}
                    rows={4}
                  />
                </div>
              </div>
            </FormSection>
            
            <div className="form-actions">
              {formActions}
            </div>
          </form>
        )}
      </ContentCard>
    </div>
  );
}

export default WSETForm;
