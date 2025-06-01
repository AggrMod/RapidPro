/**
 * Form Validation Library for Rapid Pro Maintenance Dashboard
 * Provides consistent validation and error handling for all PM workflow forms
 */

/**
 * Initialize form validation on a form element
 * @param {HTMLFormElement} formElement - The form element to validate
 * @param {Object} options - Options for customizing validation behavior
 * @param {Function} options.onSubmit - Custom submit handler function
 * @param {Object} options.customValidators - Custom validation functions
 * @param {Boolean} options.validateOnBlur - Whether to validate fields on blur
 * @param {Boolean} options.validateOnInput - Whether to validate fields on input
 * @param {String} options.errorClass - CSS class to apply to invalid fields
 * @param {String} options.validClass - CSS class to apply to valid fields
 * @returns {Object} - Validation controller with methods for managing validation
 */
function initFormValidation(formElement, options = {}) {
    // Default options
    const defaults = {
        onSubmit: null,
        customValidators: {},
        validateOnBlur: true,
        validateOnInput: true,
        errorClass: 'is-invalid',
        validClass: 'is-valid',
        scrollToError: true,
        errorMessages: {
            required: 'This field is required',
            email: 'Please enter a valid email address',
            number: 'Please enter a valid number',
            min: 'Value is too small',
            max: 'Value is too large',
            minlength: 'Input is too short',
            maxlength: 'Input is too long',
            pattern: 'Please match the requested format',
            customError: 'Please enter a valid value'
        }
    };

    // Merge provided options with defaults
    const settings = { ...defaults, ...options };

    // Store the validation state
    const validationState = {
        formIsValid: false,
        fields: {},
        errors: {}
    };

    // Helper function to validate a single field
    function validateField(field) {
        // Skip disabled or non-visible fields
        if (field.disabled || field.type === 'hidden' || field.style.display === 'none') {
            return true;
        }

        // Reset error state
        field.setCustomValidity('');
        removeErrorMessage(field);
        validationState.errors[field.name] = [];

        // Run HTML5 validation
        const isValid = field.checkValidity();

        // Get validation message
        let validationMessage = isValid ? '' : getValidationMessage(field);
        
        // Run custom validators if field is valid by HTML5 standards
        if (isValid && field.name in settings.customValidators) {
            const customResult = settings.customValidators[field.name](field.value, field);
            
            if (customResult !== true) {
                field.setCustomValidity(customResult || 'Invalid');
                validationMessage = customResult || settings.errorMessages.customError;
            }
        }

        // Update field state
        updateFieldState(field, field.checkValidity(), validationMessage);
        return field.checkValidity();
    }

    // Get appropriate validation message based on validation state
    function getValidationMessage(field) {
        // If field has a custom message, use it
        if (field.validationMessage) {
            return field.validationMessage;
        }

        // Check which constraint failed
        if (field.validity.valueMissing) {
            return settings.errorMessages.required;
        } else if (field.validity.typeMismatch) {
            if (field.type === 'email') {
                return settings.errorMessages.email;
            } else if (field.type === 'number') {
                return settings.errorMessages.number;
            }
        } else if (field.validity.rangeUnderflow) {
            return `${settings.errorMessages.min} (${field.min})`;
        } else if (field.validity.rangeOverflow) {
            return `${settings.errorMessages.max} (${field.max})`;
        } else if (field.validity.tooShort) {
            return `${settings.errorMessages.minlength} (${field.minLength})`;
        } else if (field.validity.tooLong) {
            return `${settings.errorMessages.maxlength} (${field.maxLength})`;
        } else if (field.validity.patternMismatch) {
            return field.title || settings.errorMessages.pattern;
        }

        return field.validationMessage || settings.errorMessages.customError;
    }

    // Update the field's validity state in the UI
    function updateFieldState(field, isValid, message) {
        validationState.fields[field.name] = isValid;
        
        // Toggle validity classes
        if (isValid) {
            field.classList.remove(settings.errorClass);
            field.classList.add(settings.validClass);
        } else {
            field.classList.add(settings.errorClass);
            field.classList.remove(settings.validClass);
            
            // Store error message
            if (message) {
                if (!validationState.errors[field.name]) {
                    validationState.errors[field.name] = [];
                }
                validationState.errors[field.name].push(message);
                
                // Show error message
                showErrorMessage(field, message);
            }
        }
    }

    // Show error message next to field
    function showErrorMessage(field, message) {
        const fieldParent = field.closest('.form-group');
        if (!fieldParent) return;
        
        // Remove any existing error message
        removeErrorMessage(field);
        
        // Create error message element
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerText = message;
        errorMessage.setAttribute('data-field', field.name);
        
        // Add error message after the field
        fieldParent.appendChild(errorMessage);
    }

    // Remove error message from a field
    function removeErrorMessage(field) {
        const fieldParent = field.closest('.form-group');
        if (!fieldParent) return;
        
        const existingError = fieldParent.querySelector(`.error-message[data-field="${field.name}"]`);
        if (existingError) {
            existingError.remove();
        }
    }

    // Validate entire form
    function validateForm() {
        const fields = Array.from(formElement.elements);
        let formIsValid = true;
        const invalidFields = [];
        
        fields.forEach(field => {
            if (field.name && !validateField(field)) {
                formIsValid = false;
                invalidFields.push(field);
            }
        });
        
        validationState.formIsValid = formIsValid;
        
        // Scroll to first invalid field if needed
        if (!formIsValid && settings.scrollToError && invalidFields.length > 0) {
            invalidFields[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            invalidFields[0].focus();
        }
        
        return formIsValid;
    }

    // Setup event handlers
    function setupEventHandlers() {
        // Submit event
        formElement.addEventListener('submit', (event) => {
            // Always validate on submit
            const isValid = validateForm();
            
            // If custom submit handler provided, use it
            if (settings.onSubmit) {
                event.preventDefault();
                if (isValid) {
                    settings.onSubmit(event, formElement, validationState);
                }
            } else if (!isValid) {
                // Prevent form submission for invalid forms
                event.preventDefault();
            }
        });
        
        // Blur (focus lost) event for each field
        if (settings.validateOnBlur) {
            formElement.addEventListener('blur', (event) => {
                const field = event.target;
                if (field.name && field.willValidate) {
                    validateField(field);
                }
            }, true);
        }
        
        // Input event for each field
        if (settings.validateOnInput) {
            formElement.addEventListener('input', (event) => {
                const field = event.target;
                if (field.name && field.willValidate) {
                    validateField(field);
                }
            });
        }
    }

    // Add required field indicators
    function addRequiredIndicators() {
        const labels = formElement.querySelectorAll('.form-label[for]');
        
        labels.forEach(label => {
            const inputId = label.getAttribute('for');
            const input = document.getElementById(inputId);
            
            if (input && input.hasAttribute('required') && !label.querySelector('.required-indicator')) {
                const indicator = document.createElement('span');
                indicator.className = 'required-indicator';
                indicator.textContent = '*';
                label.appendChild(indicator);
            }
        });
    }

    // Initialize validation
    function init() {
        setupEventHandlers();
        addRequiredIndicators();
        
        // Initial form state 
        formElement.classList.add('needs-validation');
        
        // Return API for external control
        return {
            validateField: (fieldName) => {
                const field = formElement.elements[fieldName];
                if (field) {
                    return validateField(field);
                }
                return false;
            },
            validateForm: validateForm,
            reset: () => {
                formElement.reset();
                formElement.classList.remove('was-validated');
                const fields = Array.from(formElement.elements);
                fields.forEach(field => {
                    if (field.name) {
                        field.classList.remove(settings.errorClass, settings.validClass);
                        removeErrorMessage(field);
                    }
                });
                validationState.formIsValid = false;
                validationState.fields = {};
                validationState.errors = {};
            },
            markAsValidated: () => {
                formElement.classList.add('was-validated');
            },
            getState: () => validationState
        };
    }

    return init();
}

/**
 * PM Workflow specific validation
 * Standardizes validation for the PM workflow forms
 */
function initPMWorkflowValidation() {
    // Cache common validator functions
    const validators = {
        requiredIfVisible: (value, field) => {
            // Check if field's container is visible
            const container = field.closest('.form-group');
            if (!container || container.style.display === 'none') {
                return true;
            }
            return value.trim() !== '' || 'This field is required';
        },
        temperatureRange: (value, field) => {
            // Temperature should generally be in a reasonable range
            if (value === '') return true;
            
            const temp = parseFloat(value);
            if (isNaN(temp)) return 'Please enter a valid temperature';
            
            // Standard refrigeration temp range is roughly between -10°F and 60°F
            // Adjust based on your specific requirements
            if (temp < -10 || temp > 60) {
                return 'Temperature appears to be outside normal range (-10°F to 60°F)';
            }
            return true;
        },
        positiveNumber: (value, field) => {
            if (value === '') return true;
            
            const num = parseFloat(value);
            if (isNaN(num)) return 'Please enter a valid number';
            if (num < 0) return 'Value must be a positive number';
            return true;
        }
    };

    /**
     * Save PM form data to session storage
     * @param {string} formId - Identifier for the form
     * @param {Object} data - Form data to save
     */
    function savePMFormData(formId, data) {
        // Get existing session data
        let sessionData = {};
        try {
            const existingData = sessionStorage.getItem('pmSessionData');
            if (existingData) {
                sessionData = JSON.parse(existingData);
            }
        } catch (e) {
            console.error('Error loading existing session data:', e);
        }
        
        // Add/update form data
        sessionData[formId] = {
            ...data,
            lastUpdated: new Date().toISOString()
        };
        
        // Save back to session storage
        try {
            sessionStorage.setItem('pmSessionData', JSON.stringify(sessionData));
            return true;
        } catch (e) {
            console.error('Error saving session data:', e);
            return false;
        }
    }

    /**
     * Load PM form data from session storage
     * @param {string} formId - Identifier for the form
     * @returns {Object} - Form data object or null if not found
     */
    function loadPMFormData(formId) {
        try {
            const existingData = sessionStorage.getItem('pmSessionData');
            if (existingData) {
                const sessionData = JSON.parse(existingData);
                return sessionData[formId] || null;
            }
        } catch (e) {
            console.error('Error loading session data:', e);
        }
        return null;
    }

    /**
     * Get all saved PM form data
     * @returns {Object} - All saved form data
     */
    function getAllPMFormData() {
        try {
            const existingData = sessionStorage.getItem('pmSessionData');
            if (existingData) {
                return JSON.parse(existingData);
            }
        } catch (e) {
            console.error('Error loading session data:', e);
        }
        return {};
    }

    /**
     * Initialize auto-save functionality for a form
     * @param {HTMLFormElement} form - Form element
     * @param {string} formId - Identifier for the form
     * @param {number} interval - Auto-save interval in milliseconds
     */
    function initAutoSave(form, formId, interval = 30000) {
        let autoSaveTimer = null;
        let lastSaved = Date.now();
        
        // Function to collect form data
        function collectFormData() {
            const formData = {};
            const elements = Array.from(form.elements);
            
            elements.forEach(element => {
                if (!element.name) return;
                
                if (element.type === 'checkbox') {
                    formData[element.name] = element.checked;
                } else if (element.type === 'radio') {
                    if (element.checked) {
                        formData[element.name] = element.value;
                    }
                } else if (element.type === 'file') {
                    // Skip file inputs - they can't be saved to sessionStorage
                } else {
                    formData[element.name] = element.value;
                }
            });
            
            return formData;
        }
        
        // Auto-save function
        function autoSave() {
            const formData = collectFormData();
            const saved = savePMFormData(formId, formData);
            
            if (saved) {
                lastSaved = Date.now();
                console.log(`Auto-saved form ${formId} at ${new Date().toLocaleTimeString()}`);
                
                // Display a subtle save indicator
                const saveIndicator = document.querySelector('.save-indicator');
                if (saveIndicator) {
                    saveIndicator.textContent = `Last saved: ${new Date().toLocaleTimeString()}`;
                    saveIndicator.style.opacity = '1';
                    setTimeout(() => {
                        saveIndicator.style.opacity = '0.5';
                    }, 2000);
                }
            }
        }
        
        // Setup auto-save timer
        function startAutoSave() {
            if (autoSaveTimer) clearInterval(autoSaveTimer);
            autoSaveTimer = setInterval(autoSave, interval);
            
            // Also save on form changes after a debounce period
            let changeTimeout = null;
            form.addEventListener('input', () => {
                if (changeTimeout) clearTimeout(changeTimeout);
                changeTimeout = setTimeout(() => {
                    // Only save if it's been more than 5 seconds since the last save
                    if (Date.now() - lastSaved > 5000) {
                        autoSave();
                    }
                }, 2000);
            });
            
            // Create save indicator if it doesn't exist
            if (!document.querySelector('.save-indicator')) {
                const indicator = document.createElement('div');
                indicator.className = 'save-indicator';
                indicator.textContent = 'Auto-save enabled';
                indicator.style.position = 'fixed';
                indicator.style.bottom = '10px';
                indicator.style.right = '10px';
                indicator.style.padding = '8px 12px';
                indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                indicator.style.color = 'white';
                indicator.style.borderRadius = '4px';
                indicator.style.fontSize = '12px';
                indicator.style.opacity = '0.5';
                indicator.style.transition = 'opacity 0.3s ease';
                indicator.style.zIndex = '9999';
                document.body.appendChild(indicator);
            }
        }
        
        // Initialize auto-save
        startAutoSave();
        
        // Also save when user navigates away
        window.addEventListener('beforeunload', autoSave);
        
        return {
            saveNow: autoSave,
            stopAutoSave: () => {
                if (autoSaveTimer) {
                    clearInterval(autoSaveTimer);
                    autoSaveTimer = null;
                }
            }
        };
    }

    /**
     * Initialize form resumption - load previously saved data
     * @param {HTMLFormElement} form - Form element to populate
     * @param {string} formId - Identifier for the form
     */
    function resumeForm(form, formId) {
        const savedData = loadPMFormData(formId);
        if (!savedData) return false;
        
        // Populate form with saved data
        Object.keys(savedData).forEach(key => {
            if (key === 'lastUpdated') return;
            
            const element = form.elements[key];
            if (!element) return;
            
            if (element.type === 'checkbox') {
                element.checked = savedData[key];
            } else if (element.type === 'radio') {
                const radioGroup = form.querySelectorAll(`input[name="${key}"]`);
                radioGroup.forEach(radio => {
                    radio.checked = radio.value === savedData[key];
                });
            } else if (element.tagName === 'SELECT') {
                element.value = savedData[key];
                // Trigger change event for dynamic form elements
                element.dispatchEvent(new Event('change'));
            } else if (element.type !== 'file') {
                element.value = savedData[key];
                // Trigger input event for fields that update UI based on input
                element.dispatchEvent(new Event('input'));
            }
        });
        
        return true;
    }

    /**
     * Initialize PM form validation and auto-save
     * @param {string} formSelector - CSS selector for the form
     * @param {string} formId - Identifier for the form
     * @param {Object} options - Additional options
     */
    function initPMForm(formSelector, formId, options = {}) {
        // Default options
        const defaults = {
            autoSave: true,
            autoSaveInterval: 30000, // 30 seconds
            resumeForm: true,
            customValidators: {},
            onSubmit: null
        };
        
        // Merge options
        const settings = { ...defaults, ...options };
        
        // Get form element
        const form = document.querySelector(formSelector);
        if (!form) {
            console.error(`Form not found: ${formSelector}`);
            return null;
        }
        
        // Resume form if enabled
        if (settings.resumeForm) {
            resumeForm(form, formId);
        }
        
        // Merge custom validators with standard PM validators
        const mergedValidators = { ...validators, ...settings.customValidators };
        
        // Initialize form validation
        const validator = initFormValidation(form, {
            customValidators: mergedValidators,
            validateOnBlur: true,
            validateOnInput: true,
            onSubmit: settings.onSubmit || null
        });
        
        // Setup auto-save if enabled
        let autoSave = null;
        if (settings.autoSave) {
            autoSave = initAutoSave(form, formId, settings.autoSaveInterval);
        }
        
        // Setup manual save button if it exists
        const saveBtn = document.querySelector('.save-btn, .btn-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                if (autoSave) {
                    autoSave.saveNow();
                    alert('Progress saved successfully!');
                }
            });
        }
        
        // Return API
        return {
            validator,
            autoSave,
            formId,
            saveData: (additionalData = {}) => {
                const formData = {};
                const elements = Array.from(form.elements);
                
                elements.forEach(element => {
                    if (!element.name) return;
                    
                    if (element.type === 'checkbox') {
                        formData[element.name] = element.checked;
                    } else if (element.type === 'radio') {
                        if (element.checked) {
                            formData[element.name] = element.value;
                        }
                    } else if (element.type !== 'file') {
                        formData[element.name] = element.value;
                    }
                });
                
                return savePMFormData(formId, { ...formData, ...additionalData });
            }
        };
    }

    // Return public API
    return {
        initPMForm,
        validators,
        savePMFormData,
        loadPMFormData,
        getAllPMFormData,
        resumeForm
    };
}

// Create the global validation object
window.PMWorkflowValidation = initPMWorkflowValidation();