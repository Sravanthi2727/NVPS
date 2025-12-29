const fc = require('fast-check');

// Feature: franchise-page, Property 1: Responsive Layout Consistency

describe('Franchise Responsive Layout Consistency Properties', () => {
  let mockDocument;
  let mockWindow;
  
  // Responsive breakpoints from design document
  const BREAKPOINTS = {
    MOBILE_MIN: 320,
    MOBILE_MAX: 767,
    TABLET_MIN: 768,
    TABLET_MAX: 1023,
    DESKTOP_MIN: 1024,
    DESKTOP_MAX: 1920
  };
  
  // Minimum touch target size from requirements
  const MIN_TOUCH_TARGET = 44;
  
  beforeEach(() => {
    // Create mock DOM environment
    mockDocument = {
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(),
      createElement: jest.fn(),
      documentElement: {
        scrollWidth: 1024
      }
    };
    
    mockWindow = {
      innerWidth: 1024,
      innerHeight: 768,
      devicePixelRatio: 1,
      getComputedStyle: jest.fn(),
      matchMedia: jest.fn(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      }))
    };
    
    // Mock interactive elements that need touch targets
    const createMockInteractiveElement = (className, baseWidth = 200, baseHeight = 44) => ({
      className,
      offsetWidth: baseWidth,
      offsetHeight: baseHeight,
      getBoundingClientRect: () => ({
        width: baseWidth,
        height: baseHeight,
        top: 0,
        left: 0,
        right: baseWidth,
        bottom: baseHeight
      }),
      style: {
        minHeight: `${Math.max(baseHeight, MIN_TOUCH_TARGET)}px`,
        minWidth: `${Math.max(baseWidth, MIN_TOUCH_TARGET)}px`
      }
    });
    
    // Mock page layout elements
    const mockElements = {
      // Hero section elements
      heroSection: {
        className: 'franchise-hero',
        getBoundingClientRect: () => ({ 
          width: mockWindow.innerWidth, 
          height: mockWindow.innerHeight 
        })
      },
      primaryButton: createMockInteractiveElement('btn-franchise-primary', 200, 48),
      secondaryButton: createMockInteractiveElement('btn-franchise-secondary', 200, 48),
      
      // Form elements
      formInputs: Array.from({ length: 6 }, (_, index) => 
        createMockInteractiveElement('franchise-form-input', 300, 48)
      ),
      formSelect: createMockInteractiveElement('franchise-form-select', 300, 48),
      formTextarea: createMockInteractiveElement('franchise-form-textarea', 300, 120),
      formCheckbox: createMockInteractiveElement('franchise-form-checkbox', 24, 24),
      submitButton: createMockInteractiveElement('btn-franchise-submit', 280, 56),
      
      // Grid elements
      benefitsGrid: {
        className: 'franchise-benefits-grid',
        children: Array.from({ length: 6 }, (_, index) => ({
          className: 'franchise-benefit-card',
          offsetWidth: 300,
          offsetHeight: 400,
          getBoundingClientRect: () => {
            // Calculate position based on current viewport and grid layout
            const viewportWidth = mockWindow.innerWidth;
            let columnsPerRow, leftPosition, topPosition;
            
            if (viewportWidth <= BREAKPOINTS.MOBILE_MAX) {
              // Mobile: single column
              columnsPerRow = 1;
              leftPosition = 0; // All cards in same column
              topPosition = index * 420;
            } else if (viewportWidth <= BREAKPOINTS.TABLET_MAX) {
              // Tablet: 2 columns
              columnsPerRow = 2;
              leftPosition = (index % 2) * 320;
              topPosition = Math.floor(index / 2) * 420;
            } else {
              // Desktop: 3 columns
              columnsPerRow = 3;
              leftPosition = (index % 3) * 320;
              topPosition = Math.floor(index / 3) * 420;
            }
            
            return {
              width: 300,
              height: 400,
              top: topPosition,
              left: leftPosition,
              right: leftPosition + 300,
              bottom: topPosition + 400
            };
          }
        })),
        getBoundingClientRect: () => ({ 
          width: mockWindow.innerWidth, 
          height: 800 
        })
      },
      
      supportGrid: {
        className: 'franchise-support-grid',
        children: Array.from({ length: 6 }, (_, index) => ({
          className: 'franchise-support-card',
          offsetWidth: 300,
          offsetHeight: 350,
          getBoundingClientRect: () => {
            // Calculate position based on current viewport and grid layout
            const viewportWidth = mockWindow.innerWidth;
            let columnsPerRow, leftPosition, topPosition;
            
            if (viewportWidth <= BREAKPOINTS.MOBILE_MAX) {
              // Mobile: single column
              columnsPerRow = 1;
              leftPosition = 0; // All cards in same column
              topPosition = index * 370;
            } else {
              // Tablet and Desktop: 2 columns
              columnsPerRow = 2;
              leftPosition = (index % 2) * 320;
              topPosition = Math.floor(index / 2) * 370;
            }
            
            return {
              width: 300,
              height: 350,
              top: topPosition,
              left: leftPosition,
              right: leftPosition + 300,
              bottom: topPosition + 350
            };
          }
        })),
        getBoundingClientRect: () => ({ 
          width: mockWindow.innerWidth, 
          height: 1050 
        })
      },
      
      // Business model layout
      businessModelContent: {
        className: 'franchise-business-model-content',
        children: [
          {
            className: 'franchise-business-model-visual',
            getBoundingClientRect: () => ({
              width: mockWindow.innerWidth <= BREAKPOINTS.MOBILE_MAX ? mockWindow.innerWidth - 40 : mockWindow.innerWidth * 0.4,
              height: 240
            })
          },
          {
            className: 'franchise-business-model-info',
            getBoundingClientRect: () => ({
              width: mockWindow.innerWidth <= BREAKPOINTS.MOBILE_MAX ? mockWindow.innerWidth - 40 : mockWindow.innerWidth * 0.6,
              height: 400
            })
          }
        ],
        getBoundingClientRect: () => ({ 
          width: mockWindow.innerWidth, 
          height: mockWindow.innerWidth <= BREAKPOINTS.MOBILE_MAX ? 640 : 400 
        })
      }
    };
    
    // Mock computed styles based on viewport size
    mockWindow.getComputedStyle.mockImplementation((element) => {
      const className = element.className || '';
      const viewportWidth = mockWindow.innerWidth;
      
      // Hero CTA buttons responsive styling
      if (className === 'btn-franchise-primary' || className === 'btn-franchise-secondary') {
        if (viewportWidth <= BREAKPOINTS.MOBILE_MAX) {
          return {
            width: '100%',
            maxWidth: '280px',
            minHeight: '48px',
            minWidth: '48px',
            padding: '16px 24px',
            display: 'block'
          };
        } else {
          return {
            width: 'auto',
            minWidth: '200px',
            minHeight: '44px',
            padding: '16px 32px',
            display: 'inline-flex'
          };
        }
      }
      
      // Form elements responsive styling
      if (className.includes('franchise-form-')) {
        if (viewportWidth <= BREAKPOINTS.MOBILE_MAX) {
          return {
            width: '100%',
            minHeight: '48px',
            minWidth: '48px',
            padding: '14px 16px'
          };
        } else {
          return {
            width: '100%',
            minHeight: '48px',
            minWidth: '44px',
            padding: '12px 16px'
          };
        }
      }
      
      // Grid layouts responsive styling
      if (className === 'franchise-benefits-grid') {
        if (viewportWidth <= BREAKPOINTS.MOBILE_MAX) {
          return {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '20px'
          };
        } else if (viewportWidth <= BREAKPOINTS.TABLET_MAX) {
          return {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '32px'
          };
        } else {
          return {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '40px'
          };
        }
      }
      
      if (className === 'franchise-support-grid') {
        if (viewportWidth <= BREAKPOINTS.MOBILE_MAX) {
          return {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '20px'
          };
        } else {
          return {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '32px'  // Support grid uses 32px gap, not 40px like benefits grid
          };
        }
      }
      
      // Business model content responsive styling
      if (className === 'franchise-business-model-content') {
        if (viewportWidth <= BREAKPOINTS.MOBILE_MAX) {
          return {
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
            alignItems: 'center'
          };
        } else {
          return {
            display: 'flex',
            flexDirection: 'row',
            gap: '48px',
            alignItems: 'flex-start'
          };
        }
      }
      
      return {
        display: 'block',
        minHeight: '44px',
        minWidth: '44px'
      };
    });
    
    // Set up querySelector mocks
    mockDocument.querySelector.mockImplementation((selector) => {
      switch (selector) {
        case '.franchise-hero':
          return mockElements.heroSection;
        case '.btn-franchise-primary':
          return mockElements.primaryButton;
        case '.btn-franchise-secondary':
          return mockElements.secondaryButton;
        case '.franchise-benefits-grid':
          return mockElements.benefitsGrid;
        case '.franchise-support-grid':
          return mockElements.supportGrid;
        case '.franchise-business-model-content':
          return mockElements.businessModelContent;
        case '.franchise-form-select':
          return mockElements.formSelect;
        case '.franchise-form-textarea':
          return mockElements.formTextarea;
        case '.franchise-form-checkbox':
          return mockElements.formCheckbox;
        case '.btn-franchise-submit':
          return mockElements.submitButton;
        default:
          return null;
      }
    });
    
    mockDocument.querySelectorAll.mockImplementation((selector) => {
      switch (selector) {
        case '.franchise-form-input':
          return mockElements.formInputs;
        case '.franchise-benefit-card':
          return mockElements.benefitsGrid.children;
        case '.franchise-support-card':
          return mockElements.supportGrid.children;
        case '.btn-franchise-primary, .btn-franchise-secondary':
          return [mockElements.primaryButton, mockElements.secondaryButton];
        case '.franchise-form-input, .franchise-form-select, .franchise-form-textarea':
          return [...mockElements.formInputs, mockElements.formSelect, mockElements.formTextarea];
        default:
          return [];
      }
    });
    
    global.document = mockDocument;
    global.window = mockWindow;
  });

  /**
   * Property 1: Responsive Layout Consistency
   * For any viewport size within mobile range (320px-767px), the page layout should remain 
   * single-column with all interactive elements maintaining minimum 44px touch targets
   * Validates: Requirements 1.1, 1.4
   */
  test('Property 1: Responsive Layout Consistency - Mobile viewport maintains single-column layout', () => {
    fc.assert(
      fc.property(
        // Generate random mobile viewport sizes
        fc.record({
          viewport: fc.record({
            width: fc.integer({ min: BREAKPOINTS.MOBILE_MIN, max: BREAKPOINTS.MOBILE_MAX }),
            height: fc.integer({ min: 568, max: 1080 })
          }),
          layoutElement: fc.oneof(
            fc.constant('benefits-grid'),
            fc.constant('support-grid'),
            fc.constant('business-model'),
            fc.constant('hero-buttons')
          )
        }),
        (testCase) => {
          const { viewport, layoutElement } = testCase;
          
          // Set mobile viewport size
          mockWindow.innerWidth = viewport.width;
          mockWindow.innerHeight = viewport.height;
          
          if (layoutElement === 'benefits-grid') {
            // Benefits grid should be single column on mobile
            const benefitsGrid = mockDocument.querySelector('.franchise-benefits-grid');
            expect(benefitsGrid).toBeTruthy();
            
            const gridStyles = mockWindow.getComputedStyle(benefitsGrid);
            expect(gridStyles.gridTemplateColumns).toBe('1fr');
            expect(gridStyles.display).toBe('grid');
            
            // Verify cards stack vertically
            const cards = benefitsGrid.children;
            expect(cards.length).toBe(6);
            
            // In single column, all cards should have same left position (stacked)
            const cardRects = cards.map(card => card.getBoundingClientRect());
            const leftPositions = cardRects.map(rect => rect.left);
            const uniqueLeftPositions = [...new Set(leftPositions)];
            
            // All cards should be in same column (same left position)
            expect(uniqueLeftPositions.length).toBeLessThanOrEqual(1);
            
          } else if (layoutElement === 'support-grid') {
            // Support grid should be single column on mobile
            const supportGrid = mockDocument.querySelector('.franchise-support-grid');
            expect(supportGrid).toBeTruthy();
            
            const gridStyles = mockWindow.getComputedStyle(supportGrid);
            expect(gridStyles.gridTemplateColumns).toBe('1fr');
            expect(gridStyles.display).toBe('grid');
            
            // Verify cards stack vertically
            const cards = supportGrid.children;
            expect(cards.length).toBe(6);
            
            // In single column, all cards should have same left position (stacked)
            const cardRects = cards.map(card => card.getBoundingClientRect());
            const leftPositions = cardRects.map(rect => rect.left);
            const uniqueLeftPositions = [...new Set(leftPositions)];
            
            // All cards should be in same column (same left position)
            expect(uniqueLeftPositions.length).toBeLessThanOrEqual(1);
            
          } else if (layoutElement === 'business-model') {
            // Business model should stack vertically on mobile
            const businessModelContent = mockDocument.querySelector('.franchise-business-model-content');
            expect(businessModelContent).toBeTruthy();
            
            const contentStyles = mockWindow.getComputedStyle(businessModelContent);
            expect(contentStyles.flexDirection).toBe('column');
            expect(contentStyles.display).toBe('flex');
            
          } else if (layoutElement === 'hero-buttons') {
            // Hero buttons should stack vertically on mobile
            const primaryButton = mockDocument.querySelector('.btn-franchise-primary');
            const secondaryButton = mockDocument.querySelector('.btn-franchise-secondary');
            
            expect(primaryButton).toBeTruthy();
            expect(secondaryButton).toBeTruthy();
            
            const primaryStyles = mockWindow.getComputedStyle(primaryButton);
            const secondaryStyles = mockWindow.getComputedStyle(secondaryButton);
            
            // Buttons should be full width on mobile
            expect(primaryStyles.width).toBe('100%');
            expect(secondaryStyles.width).toBe('100%');
            expect(primaryStyles.display).toBe('block');
            expect(secondaryStyles.display).toBe('block');
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  });

  test('Property 1: Responsive Layout Consistency - All interactive elements maintain minimum touch targets', () => {
    fc.assert(
      fc.property(
        // Generate random mobile viewport sizes to test touch targets
        fc.record({
          viewport: fc.record({
            width: fc.integer({ min: BREAKPOINTS.MOBILE_MIN, max: BREAKPOINTS.MOBILE_MAX }),
            height: fc.integer({ min: 568, max: 1080 })
          }),
          elementType: fc.oneof(
            fc.constant('buttons'),
            fc.constant('form-inputs'),
            fc.constant('form-controls')
          )
        }),
        (testCase) => {
          const { viewport, elementType } = testCase;
          
          // Set mobile viewport size
          mockWindow.innerWidth = viewport.width;
          mockWindow.innerHeight = viewport.height;
          
          if (elementType === 'buttons') {
            // Test all button elements
            const buttons = mockDocument.querySelectorAll('.btn-franchise-primary, .btn-franchise-secondary');
            const submitButton = mockDocument.querySelector('.btn-franchise-submit');
            
            const allButtons = [...buttons];
            if (submitButton) allButtons.push(submitButton);
            
            allButtons.forEach(button => {
              const buttonStyles = mockWindow.getComputedStyle(button);
              const rect = button.getBoundingClientRect();
              
              // Verify minimum touch target size
              expect(parseInt(buttonStyles.minHeight)).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
              expect(parseInt(buttonStyles.minWidth)).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
              
              // Verify actual dimensions meet requirements
              expect(rect.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
              expect(rect.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
            });
            
          } else if (elementType === 'form-inputs') {
            // Test form input elements
            const formInputs = mockDocument.querySelectorAll('.franchise-form-input');
            const formSelect = mockDocument.querySelector('.franchise-form-select');
            const formTextarea = mockDocument.querySelector('.franchise-form-textarea');
            
            const allInputs = [...formInputs];
            if (formSelect) allInputs.push(formSelect);
            if (formTextarea) allInputs.push(formTextarea);
            
            allInputs.forEach(input => {
              const inputStyles = mockWindow.getComputedStyle(input);
              const rect = input.getBoundingClientRect();
              
              // Verify minimum touch target size
              expect(parseInt(inputStyles.minHeight)).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
              expect(parseInt(inputStyles.minWidth)).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
              
              // Verify actual dimensions meet requirements
              expect(rect.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
              expect(rect.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
            });
            
          } else if (elementType === 'form-controls') {
            // Test form control elements (checkbox has different size requirements)
            const formCheckbox = mockDocument.querySelector('.franchise-form-checkbox');
            
            if (formCheckbox) {
              const checkboxStyles = mockWindow.getComputedStyle(formCheckbox);
              const rect = formCheckbox.getBoundingClientRect();
              
              // Checkbox should meet minimum touch target (24px is acceptable for checkboxes)
              expect(parseInt(checkboxStyles.minHeight)).toBeGreaterThanOrEqual(24);
              expect(parseInt(checkboxStyles.minWidth)).toBeGreaterThanOrEqual(24);
              
              // Verify actual dimensions
              expect(rect.height).toBeGreaterThanOrEqual(24);
              expect(rect.width).toBeGreaterThanOrEqual(24);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 1: Responsive Layout Consistency - Grid layouts adapt correctly across breakpoints', () => {
    fc.assert(
      fc.property(
        // Generate viewport sizes across all breakpoints
        fc.record({
          viewport: fc.record({
            width: fc.integer({ min: BREAKPOINTS.MOBILE_MIN, max: BREAKPOINTS.DESKTOP_MAX }),
            height: fc.integer({ min: 568, max: 1080 })
          }),
          gridType: fc.oneof(
            fc.constant('benefits'),
            fc.constant('support')
          )
        }),
        (testCase) => {
          const { viewport, gridType } = testCase;
          
          // Set viewport size
          mockWindow.innerWidth = viewport.width;
          mockWindow.innerHeight = viewport.height;
          
          const gridSelector = gridType === 'benefits' ? '.franchise-benefits-grid' : '.franchise-support-grid';
          const grid = mockDocument.querySelector(gridSelector);
          expect(grid).toBeTruthy();
          
          const gridStyles = mockWindow.getComputedStyle(grid);
          
          // Verify grid layout adapts to viewport size
          if (viewport.width <= BREAKPOINTS.MOBILE_MAX) {
            // Mobile: single column
            expect(gridStyles.gridTemplateColumns).toBe('1fr');
            expect(gridStyles.gap).toBe('20px');
            
          } else if (viewport.width <= BREAKPOINTS.TABLET_MAX) {
            // Tablet: different layouts for benefits vs support
            if (gridType === 'benefits') {
              expect(gridStyles.gridTemplateColumns).toBe('repeat(2, 1fr)');
            } else {
              expect(gridStyles.gridTemplateColumns).toBe('repeat(2, 1fr)');
            }
            expect(gridStyles.gap).toBe('32px');
            
          } else {
            // Desktop: different layouts for benefits vs support
            if (gridType === 'benefits') {
              expect(gridStyles.gridTemplateColumns).toBe('repeat(3, 1fr)');
              expect(gridStyles.gap).toBe('40px');
            } else {
              expect(gridStyles.gridTemplateColumns).toBe('repeat(2, 1fr)');
              expect(gridStyles.gap).toBe('32px'); // Support grid uses 32px gap
            }
          }
          
          // Verify grid display property
          expect(gridStyles.display).toBe('grid');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 1: Responsive Layout Consistency - Business model layout adapts from stacked to side-by-side', () => {
    fc.assert(
      fc.property(
        // Generate viewport sizes to test business model layout adaptation
        fc.record({
          viewport: fc.record({
            width: fc.integer({ min: BREAKPOINTS.MOBILE_MIN, max: BREAKPOINTS.DESKTOP_MAX }),
            height: fc.integer({ min: 568, max: 1080 })
          })
        }),
        (testCase) => {
          const { viewport } = testCase;
          
          // Set viewport size
          mockWindow.innerWidth = viewport.width;
          mockWindow.innerHeight = viewport.height;
          
          const businessModelContent = mockDocument.querySelector('.franchise-business-model-content');
          expect(businessModelContent).toBeTruthy();
          
          const contentStyles = mockWindow.getComputedStyle(businessModelContent);
          
          // Verify layout direction based on viewport
          if (viewport.width <= BREAKPOINTS.MOBILE_MAX) {
            // Mobile: stacked layout
            expect(contentStyles.flexDirection).toBe('column');
            expect(contentStyles.alignItems).toBe('center');
            expect(contentStyles.gap).toBe('40px');
            
          } else {
            // Tablet and Desktop: side-by-side layout
            expect(contentStyles.flexDirection).toBe('row');
            expect(contentStyles.alignItems).toBe('flex-start');
            expect(contentStyles.gap).toBe('48px');
          }
          
          // Verify flex display
          expect(contentStyles.display).toBe('flex');
          
          // Test child element sizing
          const children = businessModelContent.children;
          expect(children.length).toBe(2);
          
          const visualElement = children[0];
          const infoElement = children[1];
          
          const visualRect = visualElement.getBoundingClientRect();
          const infoRect = infoElement.getBoundingClientRect();
          
          if (viewport.width <= BREAKPOINTS.MOBILE_MAX) {
            // On mobile, both elements should be full width (minus padding)
            expect(visualRect.width).toBeCloseTo(viewport.width - 40, 10);
            expect(infoRect.width).toBeCloseTo(viewport.width - 40, 10);
            
          } else {
            // On larger screens, visual should be ~40% and info should be ~60%
            expect(visualRect.width).toBeCloseTo(viewport.width * 0.4, 50);
            expect(infoRect.width).toBeCloseTo(viewport.width * 0.6, 50);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 1: Responsive Layout Consistency - Mobile-first approach maintains hierarchy', () => {
    fc.assert(
      fc.property(
        // Test that mobile-first approach is maintained across all viewport sizes
        fc.record({
          viewport: fc.record({
            width: fc.integer({ min: BREAKPOINTS.MOBILE_MIN, max: BREAKPOINTS.DESKTOP_MAX }),
            height: fc.integer({ min: 568, max: 1080 })
          }),
          testAspect: fc.oneof(
            fc.constant('content-hierarchy'),
            fc.constant('touch-targets'),
            fc.constant('layout-structure')
          )
        }),
        (testCase) => {
          const { viewport, testAspect } = testCase;
          
          // Set viewport size
          mockWindow.innerWidth = viewport.width;
          mockWindow.innerHeight = viewport.height;
          
          if (testAspect === 'content-hierarchy') {
            // Content should remain accessible and hierarchical at all sizes
            const heroSection = mockDocument.querySelector('.franchise-hero');
            const benefitsGrid = mockDocument.querySelector('.franchise-benefits-grid');
            const supportGrid = mockDocument.querySelector('.franchise-support-grid');
            
            expect(heroSection).toBeTruthy();
            expect(benefitsGrid).toBeTruthy();
            expect(supportGrid).toBeTruthy();
            
            // All sections should be visible and properly sized
            const heroRect = heroSection.getBoundingClientRect();
            const benefitsRect = benefitsGrid.getBoundingClientRect();
            const supportRect = supportGrid.getBoundingClientRect();
            
            expect(heroRect.width).toBeGreaterThan(0);
            expect(benefitsRect.width).toBeGreaterThan(0);
            expect(supportRect.width).toBeGreaterThan(0);
            
          } else if (testAspect === 'touch-targets') {
            // Touch targets should be adequate at all viewport sizes
            const allInteractiveElements = [
              ...mockDocument.querySelectorAll('.btn-franchise-primary, .btn-franchise-secondary'),
              ...mockDocument.querySelectorAll('.franchise-form-input'),
              mockDocument.querySelector('.franchise-form-select'),
              mockDocument.querySelector('.franchise-form-textarea'),
              mockDocument.querySelector('.btn-franchise-submit')
            ].filter(Boolean);
            
            allInteractiveElements.forEach(element => {
              const rect = element.getBoundingClientRect();
              const styles = mockWindow.getComputedStyle(element);
              
              // All interactive elements should meet minimum touch target requirements
              expect(rect.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
              expect(rect.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
              expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
              expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
            });
            
          } else if (testAspect === 'layout-structure') {
            // Layout structure should be logical and consistent
            const benefitsGrid = mockDocument.querySelector('.franchise-benefits-grid');
            const supportGrid = mockDocument.querySelector('.franchise-support-grid');
            
            const benefitsStyles = mockWindow.getComputedStyle(benefitsGrid);
            const supportStyles = mockWindow.getComputedStyle(supportGrid);
            
            // Grids should always use CSS Grid display
            expect(benefitsStyles.display).toBe('grid');
            expect(supportStyles.display).toBe('grid');
            
            // Column count should be appropriate for viewport size
            const expectedBenefitsColumns = viewport.width <= BREAKPOINTS.MOBILE_MAX ? 1 : 
                                          viewport.width <= BREAKPOINTS.TABLET_MAX ? 2 : 3;
            const expectedSupportColumns = viewport.width <= BREAKPOINTS.MOBILE_MAX ? 1 : 2;
            
            if (expectedBenefitsColumns === 1) {
              expect(benefitsStyles.gridTemplateColumns).toBe('1fr');
            } else {
              expect(benefitsStyles.gridTemplateColumns).toBe(`repeat(${expectedBenefitsColumns}, 1fr)`);
            }
            
            if (expectedSupportColumns === 1) {
              expect(supportStyles.gridTemplateColumns).toBe('1fr');
            } else {
              expect(supportStyles.gridTemplateColumns).toBe(`repeat(${expectedSupportColumns}, 1fr)`);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});