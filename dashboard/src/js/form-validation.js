// Form validation for PM workflow
window.PMWorkflowValidation = {
    // Initialize PM form with validation
    initPMForm: function(formSelector, formName, options) {
        const form = document.querySelector(formSelector);
        if (!form) return null;
        
        const defaultOptions = {
            autoSave: true,
            autoSaveInterval: 20000,
            resumeForm: true,
            onSubmit: function() {}
        };
        
        const settings = Object.assign({}, defaultOptions, options);
        
        const formHandler = {
            form: form,
            formName: formName,
            settings: settings,
            validator: {
                validateForm: function() {
                    // Simple validation - check all required fields
                    const requiredFields = form.querySelectorAll('[required]');
                    let isValid = true;
                    
                    requiredFields.forEach(field => {
                        if (!field.value.trim()) {
                            isValid = false;
                            field.classList.add('invalid');
                            field.classList.remove('valid');
                        } else {
                            field.classList.add('valid');
                            field.classList.remove('invalid');
                        }
                    });
                    
                    form.classList.add('was-validated');
                    return isValid;
                }
            },
            autoSave: {
                saveNow: function() {
                    formHandler.saveData();
                }
            },
            saveData: function() {
                const formData = new FormData(form);
                const data = {};
                for (let [key, value] of formData.entries()) {
                    data[key] = value;
                }
                
                // Save to localStorage
                const pmData = JSON.parse(localStorage.getItem('pmWorkflowData') || '{}');
                pmData[formName] = data;
                localStorage.setItem('pmWorkflowData', JSON.stringify(pmData));
                
                return data;
            }
        };
        
        // Set up auto-save if enabled
        if (settings.autoSave) {
            setInterval(() => {
                formHandler.saveData();
            }, settings.autoSaveInterval);
        }
        
        // Set up form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const isValid = formHandler.validator.validateForm();
            settings.onSubmit(e, form, { formIsValid: isValid });
        });
        
        // Resume form data if enabled
        if (settings.resumeForm) {
            const pmData = JSON.parse(localStorage.getItem('pmWorkflowData') || '{}');
            const savedData = pmData[formName];
            if (savedData) {
                Object.keys(savedData).forEach(key => {
                    const field = form.querySelector(`[name="${key}"], #${key}`);
                    if (field) {
                        field.value = savedData[key];
                    }
                });
            }
        }
        
        return formHandler;
    },
    
    // Save PM form data
    savePMFormData: function(formName, data) {
        const pmData = JSON.parse(localStorage.getItem('pmWorkflowData') || '{}');
        pmData[formName] = data;
        localStorage.setItem('pmWorkflowData', JSON.stringify(pmData));
    },
    
    // Get PM form data
    getPMFormData: function(formName) {
        const pmData = JSON.parse(localStorage.getItem('pmWorkflowData') || '{}');
        return pmData[formName] || null;
    },
    
    // Clear PM form data
    clearPMFormData: function(formName) {
        const pmData = JSON.parse(localStorage.getItem('pmWorkflowData') || '{}');
        if (formName) {
            delete pmData[formName];
        } else {
            pmData = {};
        }
        localStorage.setItem('pmWorkflowData', JSON.stringify(pmData));
    }
};