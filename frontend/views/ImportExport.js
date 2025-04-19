import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { PageHeader, ContentCard } from '../components/common';
import { Button } from '../components/ui';
import '../styles/global.css';
import '../styles/importExport.css';

function ImportExport() {
  const { t } = useTranslation();
  const [exportType, setExportType] = useState('all');
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Handle export
  const handleExport = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/export/${exportType}/json`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `wine_inventory_${exportType}_export.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(t('exportFailed'));
      console.error('Export failed:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);
  
  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      processFile(file);
    }
  };
  
  // Process the selected file
  const processFile = (file) => {
    setImportFile(file);
    setImportResult(null);
    setError(null);
    
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        await importData(jsonData);
      } catch (err) {
        setError(t('invalidJsonFile'));
        console.error('Error parsing JSON:', err);
      }
    };
    
    reader.onerror = () => {
      setError(t('errorReadingFile'));
    };
    
    reader.readAsText(file);
  };
  
  // Import the data
  const importData = async (jsonData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/import/json', jsonData);
      setImportResult(response.data);
    } catch (err) {
      setError(t('importFailed'));
      console.error('Import failed:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.add('drag-over');
    }
  }, []);
  
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove('drag-over');
    }
  }, []);
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove('drag-over');
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        processFile(file);
      } else {
        setError(t('onlyJsonFilesAllowed'));
      }
    }
  }, [t]);
  
  return (
    <div className="page">
      <PageHeader title={t('importExport')} />
      
      <div className="import-export-container">
        <ContentCard title={t('exportData')}>
          <div className="export-options">
            <div className="form-group">
              <label>{t('exportType')}</label>
              <select 
                value={exportType} 
                onChange={(e) => setExportType(e.target.value)}
                className="form-control"
              >
                <option value="all">{t('allData')}</option>
                <option value="wines">{t('winesOnly')}</option>
                <option value="inventory">{t('inventoryOnly')}</option>
              </select>
            </div>
            
            <Button 
              onClick={handleExport} 
              disabled={isLoading}
              variant="primary"
            >
              {isLoading ? t('exporting') : t('exportAsJson')}
            </Button>
          </div>
        </ContentCard>
        
        <ContentCard title={t('importData')}>
          <div className="import-options">
            <div 
              ref={dropAreaRef}
              className="drop-area"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <div className="drop-message">
                <i className="icon-upload"></i>
                <p>{t('dragDropJsonFile')}</p>
                <p className="or-divider">{t('or')}</p>
                <Button 
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current && fileInputRef.current.click();
                  }}
                >
                  {t('browseFiles')}
                </Button>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".json" 
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
            
            {isLoading && (
              <div className="loading-indicator">
                <p>{t('importing')}</p>
              </div>
            )}
            
            {error && <div className="error-message">{error}</div>}
            
            {importResult && (
              <div className="import-result">
                <h3>{t('importResult')}</h3>
                <p>{importResult.success ? t('importSuccessful') : t('importPartiallySuccessful')}</p>
                
                <div className="import-stats">
                  <div>
                    <strong>{t('created')}:</strong>
                    <ul>
                      <li>{t('wines')}: {importResult.created.wines}</li>
                      <li>{t('producers')}: {importResult.created.producers}</li>
                      <li>{t('tags')}: {importResult.created.tags}</li>
                      <li>{t('inventory')}: {importResult.created.inventory}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <strong>{t('updated')}:</strong>
                    <ul>
                      <li>{t('wines')}: {importResult.updated.wines}</li>
                      <li>{t('producers')}: {importResult.updated.producers}</li>
                      <li>{t('tags')}: {importResult.updated.tags}</li>
                      <li>{t('inventory')}: {importResult.updated.inventory}</li>
                    </ul>
                  </div>
                </div>
                
                {importResult.errors.length > 0 && (
                  <div className="import-errors">
                    <strong>{t('errors')}:</strong>
                    <ul>
                      {importResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </ContentCard>
      </div>
    </div>
  );
}

export default ImportExport;
