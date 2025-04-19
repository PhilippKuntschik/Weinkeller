import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { tagService } from '../services';
import './TagsInput.css';

/**
 * Generic component for inputting and managing tags
 * @param {Object} props - Component props
 * @param {Array} props.selectedTags - Array of selected tag objects (for managed mode)
 * @param {Function} props.setSelectedTags - Function to update selected tags (for managed mode)
 * @param {Array} props.value - Array of strings (for unmanaged mode)
 * @param {Function} props.onChange - Function to update value (for unmanaged mode)
 * @param {string} props.apiEndpoint - API endpoint for fetching and creating tags (optional)
 * @param {Array} props.predefinedOptions - Array of predefined options to suggest (optional)
 * @param {string} props.placeholder - Placeholder text for the input
 * @param {string} props.label - Optional label for the input
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {number} props.maxTags - Maximum number of tags allowed (optional)
 */
function TagsInput({ 
  selectedTags, 
  setSelectedTags, 
  value,
  onChange,
  apiEndpoint, 
  predefinedOptions = [],
  placeholder,
  label,
  disabled = false,
  maxTags = null
}) {
  const { t } = useTranslation();
  const [allTags, setAllTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [filteredTags, setFilteredTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Initialize allTags with predefined options if provided
  useEffect(() => {
    if (predefinedOptions && predefinedOptions.length > 0) {
      // Convert predefined options to the format expected by the component
      const formattedOptions = predefinedOptions.map((option, index) => ({
        id: `predefined-${index}`,
        name: option
      }));
      setAllTags(formattedOptions);
    }
  }, [predefinedOptions]);

  // Fetch all available tags on component mount if apiEndpoint is provided
  useEffect(() => {
    if (apiEndpoint) {
      const fetchTags = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Extract tag type from endpoint (e.g., 'grape' from '/grape_tags')
          const tagType = tagService.getTagTypeFromEndpoint(apiEndpoint);
          const tags = await tagService.getAllTags(tagType);
          setAllTags(Array.isArray(tags) ? tags : []);
        } catch (error) {
          console.error(`Error fetching tags from ${apiEndpoint}:`, error);
          setError('Failed to load tags');
          setAllTags([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchTags();
    }
  }, [apiEndpoint]);

  // Filter tags based on input value
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredTags([]);
      return;
    }
    
    if (apiEndpoint) {
      // Managed mode with API endpoint
      setFilteredTags(
        allTags.filter(
          (tag) => 
            tag.name.toLowerCase().includes(inputValue.toLowerCase()) && 
            !selectedTags.some((t) => t.id === tag.id)
        )
      );
    } else {
      // Unmanaged mode with simple string array
      setFilteredTags(
        allTags.filter(
          (tag) => 
            tag.name.toLowerCase().includes(inputValue.toLowerCase()) && 
            !(value || []).includes(tag.name)
        )
      );
    }
  }, [inputValue, allTags, selectedTags, value, apiEndpoint]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setFilteredTags([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add a tag
  const addTag = async (tagName) => {
    if (!tagName.trim()) return;
    
    // Check if max tags limit is reached
    if (maxTags !== null) {
      if (apiEndpoint && selectedTags.length >= maxTags) {
        setError(`Maximum of ${maxTags} tag(s) allowed`);
        setInputValue('');
        return;
      } else if (!apiEndpoint && value && value.length >= maxTags) {
        setError(`Maximum of ${maxTags} tag(s) allowed`);
        setInputValue('');
        return;
      }
    }
    
    if (apiEndpoint) {
      // Managed mode with API endpoint
      console.log(`Adding tag: ${tagName} to endpoint: ${apiEndpoint}`);
      
      // Check if tag already exists
      const existingTag = allTags.find(
        (tag) => tag.name.toLowerCase() === tagName.toLowerCase()
      );
      
      if (existingTag) {
        console.log('Found existing tag:', existingTag);
        // Don't add if already selected
        if (selectedTags.some((t) => t.id === existingTag.id)) {
          setInputValue('');
          return;
        }
        
        setSelectedTags([...selectedTags, existingTag]);
      } else {
        // Create new tag
        try {
          console.log(`Creating new tag: ${tagName} at endpoint: ${apiEndpoint}`);
          // Extract tag type from endpoint (e.g., 'grape' from '/grape_tags')
          const tagType = tagService.getTagTypeFromEndpoint(apiEndpoint);
          const newTag = await tagService.createTag(tagType, tagName);
          console.log('New tag created:', newTag);
          
          setAllTags([...allTags, newTag]);
          setSelectedTags([...selectedTags, newTag]);
        } catch (error) {
          console.error('Error adding new tag:', error);
          setError('Failed to create new tag');
        }
      }
    } else {
      // Unmanaged mode with simple string array
      const currentTags = value || [];
      if (!currentTags.includes(tagName)) {
        onChange([...currentTags, tagName]);
      }
    }
    
    setInputValue('');
    setFilteredTags([]);
    inputRef.current.focus();
  };

  // Remove a tag from selection
  const removeTag = (tagIdOrValue) => {
    if (apiEndpoint) {
      // Managed mode
      setSelectedTags(selectedTags.filter((tag) => tag.id !== tagIdOrValue));
    } else {
      // Unmanaged mode
      onChange(value.filter((tag) => tag !== tagIdOrValue));
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && inputValue === '') {
      // Remove the last tag when pressing backspace with empty input
      if (apiEndpoint && selectedTags.length > 0) {
        removeTag(selectedTags[selectedTags.length - 1].id);
      } else if (!apiEndpoint && value && value.length > 0) {
        removeTag(value[value.length - 1]);
      }
    }
  };

  return (
    <div className="tags-input">
      {label && <label className="tag-input-label">{label}</label>}
      
      <div className="selected-tags">
        {apiEndpoint ? (
          // Managed mode with API endpoint
          selectedTags.map((tag) => (
            <div key={tag.id} className="tag-chip">
              {tag.name}
              <button 
                type="button" 
                onClick={() => removeTag(tag.id)} 
                className="remove-tag"
                aria-label={`Remove ${tag.name}`}
                disabled={disabled}
              >
                &times;
              </button>
            </div>
          ))
        ) : (
          // Unmanaged mode with simple string array
          (value || []).map((tag) => (
            <div key={tag} className="tag-chip">
              {tag}
              <button 
                type="button" 
                onClick={() => removeTag(tag)} 
                className="remove-tag"
                aria-label={`Remove ${tag}`}
                disabled={disabled}
              >
                &times;
              </button>
            </div>
          ))
        )}
      </div>
      
      <div className="tag-input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t('addNewTag')}
          className="tag-input"
          disabled={isLoading || disabled}
        />
        
        {filteredTags.length > 0 && (
          <ul className="tag-suggestions" ref={suggestionsRef}>
            {filteredTags.map((tag) => (
              <li 
                key={tag.id} 
                onClick={() => addTag(tag.name)}
              >
                {tag.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default TagsInput;
