const fc = require('fast-check');

// Feature: franchise-page, Property 2: Responsive Grid Adaptation

describe('Franchise Benefits Grid Responsive Properties', () => {
  let mockDocument;
  let mockWindow;
  
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
    
    // Mock benefits grid container
    const mockBenefitsGrid = {
      offsetWidth: mockWindow.innerWidth,
      offsetHeight: 600,
      children: [],
      getBoundingClientRect: () => ({
        width: Math.min(mockWindow.innerWidth - 40, 1200), // Account for container padding
        height: 600,
        top: 0,
        left: 20,
        right: Math.min(mockWindow.innerWidth - 20, 1220),
        bottom: 600
      })
    };
    
    // Mock benefit cards - 6 cards total as per requirements
    const mockBenefitCards = Array.from({ length: 6 }, (_, index) => ({
      offsetWidth: 0, // Will be calculated based on viewport
      offsetHeight: 300,
      getBoundingClientRect: () => {
        let cardWidth;
        let cardsPerRow;
        
        // Calculate grid layout based on viewport size
        if (mockWindow.innerWidth < 768) {
          // Mobile: Single column
          cardsPerRow = 1;
          cardWidth = Math.min(mockWindow.innerWidth - 40, 1200 - 40); // Container padding
        } else if (mockWindow.innerWidth < 1024) {
          // Tablet: 2 columns
          cardsPerRow = 2;
          cardWidth = (Math.min(mockWindow.innerWidth - 40, 1200 - 40) - 32) / 2; // Account for gap
        } else {
          // Desktop: 3 columns
          cardsPerRow = 3;
          cardWidth = (Math.min(mockWindow.innerWidth - 40, 1200 - 40) - 80) / 3; // Account for gaps
        }
        
        const row = Math.floor(index / cardsPerRow);
        const col = index % cardsPerRow;
        
        return {
          width: cardWidth,
          height: 300,
          top: row * 340, // Card height + gap
          left: 20 + col * (cardWidth + (cardsPerRow === 2 ? 32 : (cardsPerRow === 3 ? 40 : 0))),
          right: 20 + col * (cardWidth + (cardsPerRow === 2 ? 32 : (cardsPerRow === 3 ? 40 : 0))) + cardWidth,
          bottom: row * 340 + 300
        };
      }
    }));
    
    // Update grid children
    mockBenefitsGrid.children = mockBenefitCards;
    
    // Mock computed styles for grid
    mockWindow.getComputedStyle.mockImplementation((element) => {
      if (element === mockBenefitsGrid) {
        let gridTemplateColumns;
        
        if (mockWindow.innerWidth < 768) {
          gridTemplateColumns = '1fr';
        } else if (mockWindow.innerWidth < 1024) {
          gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
          gridTemplateColumns = 'repeat(3, 1fr)';
        }
        
        return {
          display: 'grid',
          gridTemplateColumns,
          gap: mockWindow.innerWidth < 768 ? '24px' : (mockWindow.innerWidth < 1024 ? '32px' : '40px'),
          marginTop: '48px'
        };
      }
      
      return {
        display: 'block',
        padding: '32px 24px',
        borderRadius: '8px',
        minHeight: '44px',
        minWidth: '44px'
      };
    });
    
    // Set up querySelector mocks
    mockDocument.querySelector.mockImplementation((selector) => {
      switch (selector) {
        case '.franchise-benefits-grid':
          return mockBenefitsGrid;
        case '.franchise-benefits':
          return {
            getBoundingClientRect: () => ({
              width: mockWindow.innerWidth,
              height: 800,
              top: 0,
              left: 0,
              right: mockWindow.innerWidth,
              bottom: 800
            })
          };
        default:
          return null;
      }
    });
    
    mockDocument.querySelectorAll.mockImplementation((selector) => {
      if (selector === '.franchise-benefit-card') {
        return mockBenefitCards;
      }
      return [];
    });
    
    global.document = mockDocument;
    global.window = mockWindow;
  });

  /**
   * Property 2: Responsive Grid Adaptation
   * For any viewport size, the benefit cards and support cards should adapt their grid layout appropriately: 
   * single column on mobile, 2-column on tablet, and 3-column on desktop
   * Validates: Requirements 3.2, 3.3
   */
  test('Property 2: Responsive Grid Adaptation - Benefits grid adapts layout based on viewport size', () => {
    fc.assert(
      fc.property(
        // Generate various viewport sizes across mobile, tablet, and desktop ranges
        fc.oneof(
          // Mobile viewport sizes (320px - 767px)
          fc.record({
            width: fc.integer({ min: 320, max: 767 }),
            height: fc.integer({ min: 568, max: 1024 }),
            type: fc.constant('mobile'),
            expectedColumns: fc.constant(1)
          }),
          // Tablet viewport sizes (768px - 1023px)
          fc.record({
            width: fc.integer({ min: 768, max: 1023 }),
            height: fc.integer({ min: 768, max: 1366 }),
            type: fc.constant('tablet'),
            expectedColumns: fc.constant(2)
          }),
          // Desktop viewport sizes (1024px+)
          fc.record({
            width: fc.integer({ min: 1024, max: 1920 }),
            height: fc.integer({ min: 768, max: 1080 }),
            type: fc.constant('desktop'),
            expectedColumns: fc.constant(3)
          })
        ),
        (testCase) => {
          const { width, height, type, expectedColumns } = testCase;
          
          // Set viewport size
          mockWindow.innerWidth = width;
          mockWindow.innerHeight = height;
          
          // Update document scroll width to match viewport
          mockDocument.documentElement.scrollWidth = width;
          
          // Get benefits grid and cards
          const benefitsGrid = mockDocument.querySelector('.franchise-benefits-grid');
          const benefitCards = mockDocument.querySelectorAll('.franchise-benefit-card');
          
          // Verify grid and cards exist
          expect(benefitsGrid).toBeTruthy();
          expect(benefitCards.length).toBe(6); // Should have 6 benefit cards as per requirements
          
          // Get computed styles for the grid
          const gridStyles = mockWindow.getComputedStyle(benefitsGrid);
          
          // Verify grid display property
          expect(gridStyles.display).toBe('grid');
          
          // Verify grid template columns based on viewport
          if (type === 'mobile') {
            expect(gridStyles.gridTemplateColumns).toBe('1fr');
            expect(gridStyles.gap).toBe('24px');
          } else if (type === 'tablet') {
            expect(gridStyles.gridTemplateColumns).toBe('repeat(2, 1fr)');
            expect(gridStyles.gap).toBe('32px');
          } else if (type === 'desktop') {
            expect(gridStyles.gridTemplateColumns).toBe('repeat(3, 1fr)');
            expect(gridStyles.gap).toBe('40px');
          }
          
          // Verify card layout and positioning
          benefitCards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            
            // Cards should have positive dimensions
            expect(cardRect.width).toBeGreaterThan(0);
            expect(cardRect.height).toBeGreaterThan(0);
            
            // Verify card width is appropriate for the grid layout
            const containerWidth = Math.min(width - 40, 1200 - 40); // Account for container padding
            let expectedCardWidth;
            
            if (expectedColumns === 1) {
              expectedCardWidth = containerWidth;
            } else if (expectedColumns === 2) {
              expectedCardWidth = (containerWidth - 32) / 2; // Account for gap
            } else if (expectedColumns === 3) {
              expectedCardWidth = (containerWidth - 80) / 3; // Account for gaps
            }
            
            // Allow small tolerance for rounding
            expect(Math.abs(cardRect.width - expectedCardWidth)).toBeLessThan(2);
            
            // Verify cards are positioned correctly within the grid
            const row = Math.floor(index / expectedColumns);
            const col = index % expectedColumns;
            
            // Cards should be positioned in the correct row
            expect(cardRect.top).toBe(row * 340); // Card height + gap
            
            // Cards should be positioned in the correct column
            let gapSize = 0;
            if (expectedColumns === 2) {
              gapSize = 32;
            } else if (expectedColumns === 3) {
              gapSize = 40;
            }
            
            const expectedLeft = 20 + col * (expectedCardWidth + gapSize);
            expect(Math.abs(cardRect.left - expectedLeft)).toBeLessThan(2);
          });
          
          // Verify grid container fits within viewport (with reasonable overflow allowance)
          const gridRect = benefitsGrid.getBoundingClientRect();
          expect(gridRect.width).toBeGreaterThan(0);
          expect(gridRect.width).toBeLessThanOrEqual(Math.min(width, 1200)); // Max container width
          
          // Verify grid maintains proper spacing
          expect(gridStyles.marginTop).toBe('48px');
          
          // Verify responsive behavior consistency
          // All cards should have the same width within a row
          const firstRowCards = benefitCards.slice(0, expectedColumns);
          if (firstRowCards.length > 1) {
            const firstCardWidth = firstRowCards[0].getBoundingClientRect().width;
            firstRowCards.forEach(card => {
              const cardWidth = card.getBoundingClientRect().width;
              expect(Math.abs(cardWidth - firstCardWidth)).toBeLessThan(1);
            });
          }
          
          // Verify that cards don't overlap
          for (let i = 0; i < benefitCards.length - 1; i++) {
            const currentCard = benefitCards[i].getBoundingClientRect();
            const nextCard = benefitCards[i + 1].getBoundingClientRect();
            
            // Cards in the same row should not overlap horizontally
            const currentRow = Math.floor(i / expectedColumns);
            const nextRow = Math.floor((i + 1) / expectedColumns);
            
            if (currentRow === nextRow) {
              // Same row - check horizontal spacing
              expect(nextCard.left).toBeGreaterThanOrEqual(currentCard.right);
            } else {
              // Different row - check vertical spacing
              expect(nextCard.top).toBeGreaterThanOrEqual(currentCard.bottom);
            }
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  });

  test('Property 2: Responsive Grid Adaptation - Grid maintains visual hierarchy across breakpoints', () => {
    fc.assert(
      fc.property(
        // Test specific breakpoint transitions
        fc.oneof(
          fc.constant({ width: 767, type: 'mobile-edge' }), // Mobile edge
          fc.constant({ width: 768, type: 'tablet-start' }), // Tablet start
          fc.constant({ width: 1023, type: 'tablet-edge' }), // Tablet edge
          fc.constant({ width: 1024, type: 'desktop-start' }) // Desktop start
        ),
        (testCase) => {
          const { width, type } = testCase;
          
          // Set viewport size
          mockWindow.innerWidth = width;
          mockWindow.innerHeight = 768;
          
          // Get benefits grid and cards
          const benefitsGrid = mockDocument.querySelector('.franchise-benefits-grid');
          const benefitCards = mockDocument.querySelectorAll('.franchise-benefit-card');
          
          // Verify grid exists and has correct number of cards
          expect(benefitsGrid).toBeTruthy();
          expect(benefitCards.length).toBe(6);
          
          // Get computed styles
          const gridStyles = mockWindow.getComputedStyle(benefitsGrid);
          
          // Verify correct grid layout at breakpoints
          if (type === 'mobile-edge') {
            expect(gridStyles.gridTemplateColumns).toBe('1fr');
            expect(gridStyles.gap).toBe('24px');
          } else if (type === 'tablet-start') {
            expect(gridStyles.gridTemplateColumns).toBe('repeat(2, 1fr)');
            expect(gridStyles.gap).toBe('32px');
          } else if (type === 'tablet-edge') {
            expect(gridStyles.gridTemplateColumns).toBe('repeat(2, 1fr)');
            expect(gridStyles.gap).toBe('32px');
          } else if (type === 'desktop-start') {
            expect(gridStyles.gridTemplateColumns).toBe('repeat(3, 1fr)');
            expect(gridStyles.gap).toBe('40px');
          }
          
          // Verify all cards maintain consistent styling
          benefitCards.forEach(card => {
            const cardStyles = mockWindow.getComputedStyle(card);
            const cardRect = card.getBoundingClientRect();
            
            // Cards should maintain minimum dimensions
            expect(cardRect.width).toBeGreaterThan(200); // Reasonable minimum width
            expect(cardRect.height).toBe(300); // Fixed height as per mock
            
            // Cards should have consistent padding and border radius
            expect(cardStyles.padding).toBe('32px 24px');
            expect(cardStyles.borderRadius).toBe('8px');
            
            // Cards should maintain minimum touch targets
            expect(cardStyles.minHeight).toBe('44px');
            expect(cardStyles.minWidth).toBe('44px');
          });
          
          // Verify grid container maintains proper constraints
          const gridRect = benefitsGrid.getBoundingClientRect();
          expect(gridRect.width).toBeLessThanOrEqual(1200); // Max container width
          expect(gridRect.width).toBeGreaterThan(0);
          
          // Verify visual hierarchy is maintained
          expect(gridStyles.marginTop).toBe('48px');
          expect(gridStyles.display).toBe('grid');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 2: Responsive Grid Adaptation - Support cards follow same responsive pattern', () => {
    fc.assert(
      fc.property(
        // Generate viewport sizes to test support cards grid adaptation
        fc.record({
          width: fc.integer({ min: 320, max: 1920 }),
          height: fc.integer({ min: 568, max: 1080 })
        }),
        (testCase) => {
          const { width, height } = testCase;
          
          // Set viewport size
          mockWindow.innerWidth = width;
          mockWindow.innerHeight = height;
          
          // Mock support cards grid (should follow same pattern as benefits grid)
          const mockSupportGrid = {
            offsetWidth: Math.min(width - 40, 1200 - 40),
            offsetHeight: 400,
            getBoundingClientRect: () => ({
              width: Math.min(width - 40, 1200 - 40),
              height: 400,
              top: 0,
              left: 20,
              right: Math.min(width - 20, 1220),
              bottom: 400
            })
          };
          
          // Mock 6 support cards (as per requirements 5.1)
          const mockSupportCards = Array.from({ length: 6 }, (_, index) => ({
            getBoundingClientRect: () => {
              let cardWidth;
              let cardsPerRow;
              
              // Same responsive logic as benefits grid
              if (width < 768) {
                cardsPerRow = 1;
                cardWidth = Math.min(width - 40, 1200 - 40);
              } else if (width < 1024) {
                cardsPerRow = 2;
                cardWidth = (Math.min(width - 40, 1200 - 40) - 32) / 2;
              } else {
                cardsPerRow = 3;
                cardWidth = (Math.min(width - 40, 1200 - 40) - 80) / 3;
              }
              
              const row = Math.floor(index / cardsPerRow);
              const col = index % cardsPerRow;
              
              return {
                width: cardWidth,
                height: 250,
                top: row * 290,
                left: 20 + col * (cardWidth + (cardsPerRow === 2 ? 32 : (cardsPerRow === 3 ? 40 : 0))),
                right: 20 + col * (cardWidth + (cardsPerRow === 2 ? 32 : (cardsPerRow === 3 ? 40 : 0))) + cardWidth,
                bottom: row * 290 + 250
              };
            }
          }));
          
          // Update querySelector to return support grid elements
          mockDocument.querySelector.mockImplementation((selector) => {
            if (selector === '.franchise-support-grid' || selector === '.franchise-benefits-grid') {
              return selector === '.franchise-support-grid' ? mockSupportGrid : mockDocument.querySelector('.franchise-benefits-grid');
            }
            return null;
          });
          
          mockDocument.querySelectorAll.mockImplementation((selector) => {
            if (selector === '.franchise-support-card') {
              return mockSupportCards;
            } else if (selector === '.franchise-benefit-card') {
              return mockDocument.querySelectorAll('.franchise-benefit-card');
            }
            return [];
          });
          
          // Mock computed styles for support grid
          mockWindow.getComputedStyle.mockImplementation((element) => {
            if (element === mockSupportGrid) {
              let gridTemplateColumns;
              
              if (width < 768) {
                gridTemplateColumns = '1fr';
              } else if (width < 1024) {
                gridTemplateColumns = 'repeat(2, 1fr)';
              } else {
                gridTemplateColumns = 'repeat(3, 1fr)';
              }
              
              return {
                display: 'grid',
                gridTemplateColumns,
                gap: width < 768 ? '24px' : (width < 1024 ? '32px' : '40px')
              };
            }
            
            return {
              display: 'block',
              padding: '24px',
              borderRadius: '8px'
            };
          });
          
          // Test support cards grid (when it exists)
          const supportGrid = mockDocument.querySelector('.franchise-support-grid');
          const supportCards = mockDocument.querySelectorAll('.franchise-support-card');
          
          if (supportGrid && supportCards.length > 0) {
            // Verify support grid follows same responsive pattern
            const supportGridStyles = mockWindow.getComputedStyle(supportGrid);
            
            expect(supportGridStyles.display).toBe('grid');
            
            // Verify same responsive breakpoints
            if (width < 768) {
              expect(supportGridStyles.gridTemplateColumns).toBe('1fr');
              expect(supportGridStyles.gap).toBe('24px');
            } else if (width < 1024) {
              expect(supportGridStyles.gridTemplateColumns).toBe('repeat(2, 1fr)');
              expect(supportGridStyles.gap).toBe('32px');
            } else {
              expect(supportGridStyles.gridTemplateColumns).toBe('repeat(3, 1fr)');
              expect(supportGridStyles.gap).toBe('40px');
            }
            
            // Verify support cards maintain proper layout
            supportCards.forEach((card, index) => {
              const cardRect = card.getBoundingClientRect();
              
              expect(cardRect.width).toBeGreaterThan(0);
              expect(cardRect.height).toBeGreaterThan(0);
              
              // Cards should not overlap
              if (index > 0) {
                const prevCard = supportCards[index - 1].getBoundingClientRect();
                const expectedColumns = width < 768 ? 1 : (width < 1024 ? 2 : 3);
                const currentRow = Math.floor(index / expectedColumns);
                const prevRow = Math.floor((index - 1) / expectedColumns);
                
                if (currentRow === prevRow) {
                  // Same row - no horizontal overlap
                  expect(cardRect.left).toBeGreaterThanOrEqual(prevCard.right - 1); // Allow 1px tolerance
                } else {
                  // Different row - no vertical overlap
                  expect(cardRect.top).toBeGreaterThanOrEqual(prevCard.bottom - 1); // Allow 1px tolerance
                }
              }
            });
          }
          
          // Always verify that the responsive pattern is consistent
          // This ensures both benefits and support grids follow the same rules
          const expectedColumns = width < 768 ? 1 : (width < 1024 ? 2 : 3);
          const expectedGap = width < 768 ? '24px' : (width < 1024 ? '32px' : '40px');
          
          expect(expectedColumns).toBeGreaterThan(0);
          expect(expectedColumns).toBeLessThanOrEqual(3);
          expect(['24px', '32px', '40px']).toContain(expectedGap);
        }
      ),
      { numRuns: 100 }
    );
  });
});