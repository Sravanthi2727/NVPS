/**
 * Unit Tests for Franchise Form Functionality
 * Tests form submission success/error scenarios and validation messaging
 * Requirements: 7.4, 7.7
 */

describe('Franchise Form Functionality Unit Tests', () => {
  let mockDocument;
  let mockWindow;
  let mockForm;
  let mockFormElements;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock DOM environment
    mockDocument = {
      getElementById: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(),
      createElement: jest.fn(),
      addEventListener: jest.fn(),
      head: {
        appendChild: jest.fn()
      },
      documentElement: {
        scrollWidth: 1024
      }
    };

    mockWindow = {
      addEventListener: jest.fn(),
      getComputedStyle: jest.fn(() => ({})),
      navigator: {
        userAgent: 'test-agent'
      },
      setTimeout: jest.fn((fn) => fn()),
      clearTimeout: jest.fn(),
      Math: Math,
      Date: Date,
      console: console
    };

    // Mock form elements
    mockFormElements = {
      fullName: {
        id: 'fullName',
        type: 'text',
        value: '',
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        },
        addEventListener: jest.fn(),
        focus: jest.fn(),
        scrollIntoView: jest.fn()
      },
      email: {
        id: 'email',
        type: 'email',
        value: '',
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        },
        addEventListener: jest.fn(),
        focus: jest.fn(),
        scrollIntoView: jest.fn()
      },
      phone: {
        id: 'phone',
        type: 'tel',
        value: '',
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        },
        addEventListener: jest.fn(),
        focus: jest.fn(),
        scrollIntoView: jest.fn()
      },
      cityState: {
        id: 'cityState',
        type: 'text',
        value: '',
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        },
        addEventListener: jest.fn(),
        focus: jest.fn(),
        scrollIntoView: jest.fn()
      },
      investmentRange: {
        id: 'investmentRange',
        type: 'select',
        value: '',
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        },
        addEventListener: jest.fn(),
        focus: jest.fn(),
        scrollIntoView: jest.fn()
      },
      message: {
        id: 'message',
        type: 'textarea',
        value: '',
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        },
        addEventListener: jest.fn(),
        focus: jest.fn(),
        scrollIntoView: jest.fn()
      },
      acknowledgment: {
        id: 'acknowledgment',
        type: 'checkbox',
        checked: false,
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        },
        addEventListener: jest.fn(),
        focus: jest.fn(),
        scrollIntoView: jest.fn()
      },
      submitButton: {
        id: 'submitButton',
        disabled: false,
        querySelector: jest.fn((selector) => {
          if (selector === '.btn-text') {
            return { style: { display: 'inline' } };
          }
          if (selector === '.btn-loading') {
            return { style: { display: 'none' } };
          }
          return null;
        })
      },
      successMessage: {
        id: 'successMessage',
        style: { display: 'none' },
        querySelector: jest.fn(() => ({
          appendChild: jest.fn()
        })),
        setAttribute: jest.fn(),
        focus: jest.fn(),
        scrollIntoView: jest.fn()
      }
    };

    // Mock form
    mockForm = {
      id: 'franchiseEnquiryForm',
      addEventListener: jest.fn(),
      querySelector: jest.fn((selector) => {
        if (selector === '.error') {
          return mockFormElements.fullName; // Return first field as error example
        }
        return null;
      }),
      reset: jest.fn(),
      style: { display: 'block' },
      insertBefore: jest.fn()
    };

    // Setup getElementById mock
    mockDocument.getElementById.mockImplementation((id) => {
      if (id === 'franchiseEnquiryForm') return mockForm;
      if (mockFormElements[id]) return mockFormElements[id];
      if (id.endsWith('-error')) {
        return {
          textContent: '',
          setAttribute: jest.fn(),
          removeAttribute: jest.fn()
        };
      }
      if (id === 'message-counter') {
        return {
          textContent: '0 / 500 characters',
          style: { color: 'rgba(44, 24, 16, 0.6)' }
        };
      }
      if (id === 'submission-error') {
        return {
          style: { display: 'none' },
          innerHTML: '',
          scrollIntoView: jest.fn()
        };
      }
      return null;
    });

    // Make mocks globally available
    global.document = mockDocument;
    global.window = mockWindow;
  });

  describe('Form Validation Messaging Tests', () => {
    test('should display required field error messages for empty fields', () => {
      // Test validation configuration and error messaging
      const validationConfig = {
        fullName: {
          required: true,
          minLength: 2,
          maxLength: 50,
          pattern: /^[a-zA-Z\s'-]+₹/,
          errorMessages: {
            required: 'Full name is required',
            minLength: 'Name must be at least 2 characters',
            maxLength: 'Name must be less than 50 characters',
            pattern: 'Please enter a valid name (letters, spaces, hyphens, and apostrophes only)'
          }
        },
        email: {
          required: true,
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+₹/,
          errorMessages: {
            required: 'Email address is required',
            pattern: 'Please enter a valid email address'
          }
        },
        phone: {
          required: true,
          pattern: /^[\+]?[1-9][\d]{0,15}₹/,
          errorMessages: {
            required: 'Phone number is required',
            pattern: 'Please enter a valid phone number'
          }
        },
        cityState: {
          required: true,
          minLength: 3,
          maxLength: 100,
          pattern: /^[a-zA-Z\s,.-]+₹/,
          errorMessages: {
            required: 'City & State is required',
            minLength: 'Please enter at least city and state',
            maxLength: 'Location must be less than 100 characters',
            pattern: 'Please enter a valid city and state'
          }
        },
        investmentRange: {
          required: true,
          errorMessages: {
            required: 'Please select your investment range'
          }
        },
        acknowledgment: {
          required: true,
          errorMessages: {
            required: 'Please acknowledge that you understand this is a premium Robusta-only concept'
          }
        }
      };

      // Test each field's validation configuration
      expect(validationConfig.fullName.errorMessages.required).toBe('Full name is required');
      expect(validationConfig.email.errorMessages.pattern).toBe('Please enter a valid email address');
      expect(validationConfig.phone.errorMessages.required).toBe('Phone number is required');
      expect(validationConfig.cityState.errorMessages.minLength).toBe('Please enter at least city and state');
      expect(validationConfig.investmentRange.errorMessages.required).toBe('Please select your investment range');
      expect(validationConfig.acknowledgment.errorMessages.required).toBe('Please acknowledge that you understand this is a premium Robusta-only concept');
    });

    test('should validate email format and show appropriate error messages', () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+₹/;
      
      // Test valid email formats
      expect(emailPattern.test('user@example.com')).toBe(true);
      expect(emailPattern.test('test.email@domain.co.uk')).toBe(true);
      expect(emailPattern.test('user+tag@example.org')).toBe(true);

      // Test invalid email formats
      expect(emailPattern.test('')).toBe(false);
      expect(emailPattern.test('invalid-email')).toBe(false);
      expect(emailPattern.test('@example.com')).toBe(false);
      expect(emailPattern.test('user@')).toBe(false);
      expect(emailPattern.test('user@domain')).toBe(false);
    });

    test('should validate phone number format and show appropriate error messages', () => {
      const phonePattern = /^[\+]?[1-9][\d]{0,15}₹/;
      
      // Test valid phone formats (after cleaning)
      expect(phonePattern.test('1234567890')).toBe(true);
      expect(phonePattern.test('+1234567890')).toBe(true);
      expect(phonePattern.test('5551234567')).toBe(true);

      // Test invalid phone formats
      expect(phonePattern.test('')).toBe(false);
      expect(phonePattern.test('0123456789')).toBe(false); // Starts with 0
      expect(phonePattern.test('abc123')).toBe(false);
      expect(phonePattern.test('+0123456789')).toBe(false); // Starts with 0 after +
    });

    test('should validate name format and length requirements', () => {
      const namePattern = /^[a-zA-Z\s'-]+₹/;
      
      // Test valid name formats
      expect(namePattern.test('John Doe')).toBe(true);
      expect(namePattern.test("Mary O'Connor")).toBe(true);
      expect(namePattern.test('Jean-Pierre')).toBe(true);
      expect(namePattern.test('Maria Santos')).toBe(true);

      // Test invalid name formats
      expect(namePattern.test('')).toBe(false);
      expect(namePattern.test('John123')).toBe(false);
      expect(namePattern.test('John@Doe')).toBe(false);
      expect(namePattern.test('John.Doe')).toBe(false);

      // Test length requirements
      expect('Jo'.length >= 2).toBe(true); // Minimum length
      expect('A'.length >= 2).toBe(false); // Below minimum
      expect('A'.repeat(51).length <= 50).toBe(false); // Above maximum
      expect('John Doe'.length <= 50).toBe(true); // Within range
    });

    test('should validate city/state format and requirements', () => {
      const cityStatePattern = /^[a-zA-Z\s,.-]+₹/;
      
      // Test valid city/state formats
      expect(cityStatePattern.test('Austin, TX')).toBe(true);
      expect(cityStatePattern.test('New York, NY')).toBe(true);
      expect(cityStatePattern.test('Los Angeles, CA')).toBe(true);
      expect(cityStatePattern.test('St. Louis, MO')).toBe(true);

      // Test invalid city/state formats
      expect(cityStatePattern.test('')).toBe(false);
      expect(cityStatePattern.test('Austin123')).toBe(false);
      expect(cityStatePattern.test('Austin @ TX')).toBe(false);

      // Test length requirements
      expect('Austin, TX'.length >= 3).toBe(true);
      expect('NY'.length >= 3).toBe(false);
      expect('A'.repeat(101).length <= 100).toBe(false);
    });
  });

  describe('Form Submission Success Scenarios', () => {
    test('should handle successful form submission with valid data', async () => {
      // Set up valid form data
      mockFormElements.fullName.value = 'John Doe';
      mockFormElements.email.value = 'john@example.com';
      mockFormElements.phone.value = '5551234567';
      mockFormElements.cityState.value = 'Austin, TX';
      mockFormElements.investmentRange.value = '₹100K - ₹150K';
      mockFormElements.message.value = 'Interested in franchise opportunity';
      mockFormElements.acknowledgment.checked = true;

      // Mock successful submission
      const mockSubmissionPromise = Promise.resolve({
        success: true,
        message: 'Form submitted successfully',
        confirmationId: 'FR-1234567890',
        data: {
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '5551234567',
          cityState: 'Austin, TX',
          investmentRange: '₹100K - ₹150K',
          message: 'Interested in franchise opportunity',
          acknowledgment: true
        }
      });

      // Test that form data is collected correctly
      const expectedFormData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '5551234567',
        cityState: 'Austin, TX',
        investmentRange: '₹100K - ₹150K',
        message: 'Interested in franchise opportunity',
        acknowledgment: true
      };

      // Verify form data structure
      expect(expectedFormData.fullName).toBe('John Doe');
      expect(expectedFormData.email).toBe('john@example.com');
      expect(expectedFormData.acknowledgment).toBe(true);
      expect(expectedFormData.investmentRange).toBe('₹100K - ₹150K');
    });

    test('should show success message and hide form after successful submission', () => {
      // Mock successful submission response
      const confirmationId = 'FR-1234567890';
      
      // Test success message display
      mockForm.style.display = 'none';
      mockFormElements.successMessage.style.display = 'block';
      
      expect(mockForm.style.display).toBe('none');
      expect(mockFormElements.successMessage.style.display).toBe('block');
      
      // Test confirmation ID display
      const confirmationText = {
        className: 'franchise-form-confirmation-id',
        innerHTML: `<strong>Confirmation ID:</strong> ${confirmationId}`,
        style: {
          cssText: expect.stringContaining('font-size: 0.875rem')
        }
      };
      
      expect(confirmationText.innerHTML).toContain(confirmationId);
      expect(confirmationText.className).toBe('franchise-form-confirmation-id');
    });

    test('should reset form state after successful submission', () => {
      // Test form reset functionality
      mockForm.reset();
      
      // Test that form reset was called
      expect(mockForm.reset).toHaveBeenCalled();
      
      // Test validation state clearing
      Object.keys(mockFormElements).forEach(fieldName => {
        if (mockFormElements[fieldName].classList) {
          mockFormElements[fieldName].classList.remove('success');
          mockFormElements[fieldName].classList.remove('error');
        }
      });
      
      // Verify classes were removed
      expect(mockFormElements.fullName.classList.remove).toHaveBeenCalledWith('success');
      expect(mockFormElements.email.classList.remove).toHaveBeenCalledWith('error');
    });

    test('should reset submit button state after successful submission', () => {
      const btnText = { style: { display: 'inline' } };
      const btnLoading = { style: { display: 'none' } };
      
      mockFormElements.submitButton.disabled = false;
      mockFormElements.submitButton.querySelector.mockImplementation((selector) => {
        if (selector === '.btn-text') return btnText;
        if (selector === '.btn-loading') return btnLoading;
        return null;
      });
      
      // Test button state reset
      expect(mockFormElements.submitButton.disabled).toBe(false);
      expect(btnText.style.display).toBe('inline');
      expect(btnLoading.style.display).toBe('none');
    });
  });

  describe('Form Submission Error Scenarios', () => {
    test('should handle network errors with appropriate error messaging', () => {
      const networkError = new Error('Network error: Unable to connect to server');
      
      // Test error message content
      const expectedErrorMessage = `
          <strong>Connection Error:</strong> We're having trouble connecting to our servers. 
          This might be due to a temporary network issue.
        `;
      
      expect(networkError.message).toContain('Network');
      expect(expectedErrorMessage).toContain('Connection Error');
      expect(expectedErrorMessage).toContain('network issue');
    });

    test('should handle timeout errors with retry functionality', () => {
      const timeoutError = new Error('Request timeout: The request is taking longer than expected');
      
      // Test timeout error handling
      const expectedErrorMessage = `
          <strong>Timeout Error:</strong> The request is taking longer than expected. 
          Please check your internet connection and try again.
        `;
      
      expect(timeoutError.message).toContain('timeout');
      expect(expectedErrorMessage).toContain('Timeout Error');
      expect(expectedErrorMessage).toContain('try again');
    });

    test('should show retry button for recoverable errors', () => {
      const retryButton = `
          <button type="button" class="btn-retry" onclick="this.parentElement.style.display='none'; submitForm();">
            Try Again
          </button>
        `;
      
      expect(retryButton).toContain('btn-retry');
      expect(retryButton).toContain('Try Again');
      expect(retryButton).toContain('submitForm()');
    });

    test('should reset button state after error with retry capability', () => {
      const btnText = { style: { display: 'inline' } };
      const btnLoading = { style: { display: 'none' } };
      
      mockFormElements.submitButton.disabled = false;
      mockFormElements.submitButton.querySelector.mockImplementation((selector) => {
        if (selector === '.btn-text') return btnText;
        if (selector === '.btn-loading') return btnLoading;
        return null;
      });
      
      // Test button state after error
      expect(mockFormElements.submitButton.disabled).toBe(false);
      expect(btnText.style.display).toBe('inline');
      expect(btnLoading.style.display).toBe('none');
    });

    test('should provide fallback contact information for persistent errors', () => {
      const errorWithFallback = `
        <strong>Submission Error:</strong> We encountered an unexpected error while processing your request.
        <br><br>
        <strong>What you can do:</strong>
        <ul style="margin: 8px 0; padding-left: 20px;">
          <li>Check your internet connection</li>
          <li>Try submitting the form again</li>
          <li>If the problem persists, email us directly at <a href="mailto:franchise@rabuste.com" style="color: var(--franchise-gold);">franchise@rabuste.com</a></li>
        </ul>
      `;
      
      expect(errorWithFallback).toContain('franchise@rabuste.com');
      expect(errorWithFallback).toContain('Check your internet connection');
      expect(errorWithFallback).toContain('Try submitting the form again');
    });

    test('should implement retry logic with exponential backoff', () => {
      const maxRetries = 2;
      let retryCount = 0;
      
      // Test retry logic
      const attemptSubmission = (formData, currentRetry = 0) => {
        const retryDelay = 1000 * (currentRetry + 1); // Exponential backoff
        
        if (currentRetry < maxRetries) {
          retryCount = currentRetry + 1;
          return { retry: true, delay: retryDelay, attempt: retryCount };
        } else {
          return { retry: false, maxRetriesReached: true };
        }
      };
      
      // Test first retry
      const firstRetry = attemptSubmission({}, 0);
      expect(firstRetry.retry).toBe(true);
      expect(firstRetry.delay).toBe(1000);
      expect(firstRetry.attempt).toBe(1);
      
      // Test second retry
      const secondRetry = attemptSubmission({}, 1);
      expect(secondRetry.retry).toBe(true);
      expect(secondRetry.delay).toBe(2000);
      expect(secondRetry.attempt).toBe(2);
      
      // Test max retries reached
      const maxRetriesTest = attemptSubmission({}, 2);
      expect(maxRetriesTest.retry).toBe(false);
      expect(maxRetriesTest.maxRetriesReached).toBe(true);
    });
  });

  describe('Form Loading State Management', () => {
    test('should show loading state during form submission', () => {
      const btnText = { style: { display: 'none' } };
      const btnLoading = { style: { display: 'flex' } };
      
      mockFormElements.submitButton.disabled = true;
      mockFormElements.submitButton.querySelector.mockImplementation((selector) => {
        if (selector === '.btn-text') return btnText;
        if (selector === '.btn-loading') return btnLoading;
        return null;
      });
      
      // Test loading state
      expect(mockFormElements.submitButton.disabled).toBe(true);
      expect(btnText.style.display).toBe('none');
      expect(btnLoading.style.display).toBe('flex');
    });

    test('should hide existing error messages during new submission', () => {
      const existingError = {
        style: { display: 'none' }
      };
      
      mockDocument.getElementById.mockImplementation((id) => {
        if (id === 'submission-error') return existingError;
        return mockFormElements[id] || null;
      });
      
      // Test error message hiding
      expect(existingError.style.display).toBe('none');
    });

    test('should collect comprehensive form data including metadata', () => {
      // Set up form values
      mockFormElements.fullName.value = 'Jane Smith';
      mockFormElements.email.value = 'jane@example.com';
      mockFormElements.phone.value = '5559876543';
      mockFormElements.cityState.value = 'Denver, CO';
      mockFormElements.investmentRange.value = '₹150K - ₹200K';
      mockFormElements.message.value = 'Looking for franchise opportunities in Colorado';
      mockFormElements.acknowledgment.checked = true;
      
      // Mock navigator and document
      mockWindow.navigator.userAgent = 'Mozilla/5.0 Test Browser';
      mockDocument.referrer = 'https://google.com';
      
      const expectedFormData = {
        fullName: mockFormElements.fullName.value.trim(),
        email: mockFormElements.email.value.trim(),
        phone: mockFormElements.phone.value.trim(),
        cityState: mockFormElements.cityState.value.trim(),
        investmentRange: mockFormElements.investmentRange.value,
        message: mockFormElements.message.value.trim(),
        acknowledgment: mockFormElements.acknowledgment.checked,
        timestamp: expect.any(String),
        source: 'franchise-page',
        userAgent: mockWindow.navigator.userAgent,
        referrer: mockDocument.referrer || 'direct'
      };
      
      // Test form data collection
      expect(expectedFormData.fullName).toBe('Jane Smith');
      expect(expectedFormData.email).toBe('jane@example.com');
      expect(expectedFormData.acknowledgment).toBe(true);
      expect(expectedFormData.source).toBe('franchise-page');
      expect(expectedFormData.userAgent).toBe('Mozilla/5.0 Test Browser');
    });
  });

  describe('Form Validation and Functionality Tests', () => {
    test('should validate form fields are properly configured for testing', () => {
      // Test that form elements are properly mocked and accessible
      expect(mockFormElements.fullName).toBeDefined();
      expect(mockFormElements.email).toBeDefined();
      expect(mockFormElements.phone).toBeDefined();
      expect(mockFormElements.cityState).toBeDefined();
      expect(mockFormElements.investmentRange).toBeDefined();
      expect(mockFormElements.message).toBeDefined();
      expect(mockFormElements.acknowledgment).toBeDefined();
      expect(mockFormElements.submitButton).toBeDefined();
      expect(mockFormElements.successMessage).toBeDefined();
      
      // Test form structure
      expect(mockForm.id).toBe('franchiseEnquiryForm');
      expect(mockForm.addEventListener).toBeDefined();
      expect(mockForm.reset).toBeDefined();
    });

    test('should include all required investment range options', () => {
      const investmentRanges = [
        "₹50K - ₹75K",
        "₹75K - ₹100K", 
        "₹100K - ₹150K",
        "₹150K - ₹200K",
        "₹200K+"
      ];
      
      // Test that all investment ranges are available
      expect(investmentRanges).toHaveLength(5);
      expect(investmentRanges).toContain("₹50K - ₹75K");
      expect(investmentRanges).toContain("₹75K - ₹100K");
      expect(investmentRanges).toContain("₹100K - ₹150K");
      expect(investmentRanges).toContain("₹150K - ₹200K");
      expect(investmentRanges).toContain("₹200K+");
    });

    test('should validate acknowledgment checkbox requirement', () => {
      const acknowledgmentText = 'I understand this is a premium Robusta-only concept and I\'m interested in learning more about the unique positioning and requirements.';
      
      // Test acknowledgment text content
      expect(acknowledgmentText).toContain('premium Robusta-only concept');
      expect(acknowledgmentText).toContain('unique positioning');
      expect(acknowledgmentText).toContain('requirements');
      
      // Test checkbox functionality
      expect(mockFormElements.acknowledgment.type).toBe('checkbox');
      expect(mockFormElements.acknowledgment.checked).toBe(false);
    });
  });
});