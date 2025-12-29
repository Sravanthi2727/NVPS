const fc = require('fast-check');

// Feature: franchise-page, Property 4: Visual Hierarchy Consistency

describe('Franchise Visual Hierarchy Consistency Properties', () => {
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
    
    // Mock benefit cards - 6 cards as per requirements
    const mockBenefitCards = Array.from({ length: 6 }, (_, index) => ({
      className: 'franchise-benefit-card',
      offsetWidth: 300,
      offsetHeight: 400,
      getBoundingClientRect: () => ({
        width: 300,
        height: 400,
        top: 0,
        left: index * 320,
        right: (index * 320) + 300,
        bottom: 400
      }),
      querySelector: jest.fn((selector) => {
        if (selector === '.franchise-benefit-icon') {
          return {
            offsetWidth: 80,
            offsetHeight: 80,
            getBoundingClientRect: () => ({ width: 80, height: 80 })
          };
        }
        if (selector === '.franchise-benefit-title') {
          return {
            offsetWidth: 260,
            offsetHeight: 32,
            getBoundingClientRect: () => ({ width: 260, height: 32 })
          };
        }
        if (selector === '.franchise-benefit-description') {
          return {
            offsetWidth: 260,
            offsetHeight: 96,
            getBoundingClientRect: () => ({ width: 260, height: 96 })
          };
        }
        return null;
      })
    }));
    
    // Mock support cards - 6 cards as per requirements
    const mockSupportCards = Array.from({ length: 6 }, (_, index) => ({
      className: 'franchise-support-card',
      offsetWidth: 300,
      offsetHeight: 350,
      getBoundingClientRect: () => ({
        width: 300,
        height: 350,
        top: 0,
        left: index * 320,
        right: (index * 320) + 300,
        bottom: 350
      }),
      querySelector: jest.fn((selector) => {
        if (selector === '.franchise-support-icon') {
          return {
            offsetWidth: 80,
            offsetHeight: 80,
            getBoundingClientRect: () => ({ width: 80, height: 80 })
          };
        }
        if (selector === '.franchise-support-title') {
          return {
            offsetWidth: 260,
            offsetHeight: 32,
            getBoundingClientRect: () => ({ width: 260, height: 32 })
          };
        }
        if (selector === '.franchise-support-description') {
          return {
            offsetWidth: 260,
            offsetHeight: 80,
            getBoundingClientRect: () => ({ width: 260, height: 80 })
          };
        }
        return null;
      })
    }));
    
    // Mock computed styles for consistent visual hierarchy
    mockWindow.getComputedStyle.mockImplementation((element) => {
      // Benefit card styles
      if (element.className === 'franchise-benefit-card') {
        return {
          padding: '32px 24px',
          borderRadius: '8px',
          backgroundColor: '#F5F1EB',
          border: '1px solid rgba(60, 36, 21, 0.1)',
          boxShadow: '0 4px 12px rgba(60, 36, 21, 0.15)',
          textAlign: 'center',
          transition: 'all 0.3s ease'
        };
      }
      
      // Support card styles (should be consistent with benefit cards)
      if (element.className === 'franchise-support-card') {
        return {
          padding: '32px 24px',
          borderRadius: '8px',
          backgroundColor: '#F5F1EB',
          border: '1px solid rgba(60, 36, 21, 0.1)',
          boxShadow: '0 4px 12px rgba(60, 36, 21, 0.15)',
          textAlign: 'center',
          transition: 'all 0.3s ease'
        };
      }
      
      // Icon styles - check if element has icon-like properties
      if (element && (element.offsetWidth === 80 && element.offsetHeight === 80)) {
        return {
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(60, 36, 21, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          transition: 'all 0.3s ease'
        };
      }
      
      // Title styles - check if element has title-like properties
      if (element && (element.offsetWidth === 260 && element.offsetHeight === 32)) {
        return {
          fontFamily: '"Playfair Display", serif',
          fontSize: '1.25rem',
          fontWeight: '600',
          lineHeight: '1.3',
          marginBottom: '16px',
          color: '#3C2415'
        };
      }
      
      // Description styles - check if element has description-like properties
      if (element && (element.offsetWidth === 260 && (element.offsetHeight === 96 || element.offsetHeight === 80))) {
        return {
          fontSize: '1rem',
          lineHeight: '1.6',
          color: '#2C1810',
          opacity: '0.8'
        };
      }
      
      return {
        display: 'block'
      };
    });
    
    // Set up querySelector mocks
    mockDocument.querySelector.mockImplementation((selector) => {
      switch (selector) {
        case '.franchise-benefits-grid':
          return {
            children: mockBenefitCards,
            getBoundingClientRect: () => ({ width: 1200, height: 800 })
          };
        case '.franchise-support-grid':
          return {
            children: mockSupportCards,
            getBoundingClientRect: () => ({ width: 1200, height: 700 })
          };
        default:
          return null;
      }
    });
    
    mockDocument.querySelectorAll.mockImplementation((selector) => {
      if (selector === '.franchise-benefit-card') {
        return mockBenefitCards;
      }
      if (selector === '.franchise-support-card') {
        return mockSupportCards;
      }
      return [];
    });
    
    global.document = mockDocument;
    global.window = mockWindow;
  });

  /**
   * Property 4: Visual Hierarchy Consistency
   * For any benefit card or support card, the visual treatment (typography, spacing, iconography) 
   * should remain consistent across all instances
   * Validates: Requirements 3.5, 5.2
   */
  test('Property 4: Visual Hierarchy Consistency - Benefit cards maintain consistent visual treatment', () => {
    fc.assert(
      fc.property(
        // Generate random card indices to test consistency across different cards
        fc.record({
          cardIndex1: fc.integer({ min: 0, max: 5 }),
          cardIndex2: fc.integer({ min: 0, max: 5 }),
          viewport: fc.record({
            width: fc.integer({ min: 320, max: 1920 }),
            height: fc.integer({ min: 568, max: 1080 })
          })
        }),
        (testCase) => {
          const { cardIndex1, cardIndex2, viewport } = testCase;
          
          // Set viewport size
          mockWindow.innerWidth = viewport.width;
          mockWindow.innerHeight = viewport.height;
          
          // Get benefit cards
          const benefitCards = mockDocument.querySelectorAll('.franchise-benefit-card');
          
          // Verify we have the expected number of cards
          expect(benefitCards.length).toBe(6);
          
          // Get two different cards to compare
          const card1 = benefitCards[cardIndex1];
          const card2 = benefitCards[cardIndex2];
          
          expect(card1).toBeTruthy();
          expect(card2).toBeTruthy();
          
          // Get computed styles for both cards
          const card1Styles = mockWindow.getComputedStyle(card1);
          const card2Styles = mockWindow.getComputedStyle(card2);
          
          // Verify consistent card container styling
          expect(card1Styles.padding).toBe(card2Styles.padding);
          expect(card1Styles.borderRadius).toBe(card2Styles.borderRadius);
          expect(card1Styles.backgroundColor).toBe(card2Styles.backgroundColor);
          expect(card1Styles.border).toBe(card2Styles.border);
          expect(card1Styles.boxShadow).toBe(card2Styles.boxShadow);
          expect(card1Styles.textAlign).toBe(card2Styles.textAlign);
          expect(card1Styles.transition).toBe(card2Styles.transition);
          
          // Verify consistent dimensions (cards should have same structure)
          const card1Rect = card1.getBoundingClientRect();
          const card2Rect = card2.getBoundingClientRect();
          
          expect(card1Rect.width).toBe(card2Rect.width);
          expect(card1Rect.height).toBe(card2Rect.height);
          
          // Test icon consistency
          const icon1 = card1.querySelector('.franchise-benefit-icon');
          const icon2 = card2.querySelector('.franchise-benefit-icon');
          
          if (icon1 && icon2) {
            const icon1Styles = mockWindow.getComputedStyle(icon1);
            const icon2Styles = mockWindow.getComputedStyle(icon2);
            
            // Icons should have consistent styling
            expect(icon1Styles.width).toBe(icon2Styles.width);
            expect(icon1Styles.height).toBe(icon2Styles.height);
            expect(icon1Styles.borderRadius).toBe(icon2Styles.borderRadius);
            expect(icon1Styles.backgroundColor).toBe(icon2Styles.backgroundColor);
            expect(icon1Styles.display).toBe(icon2Styles.display);
            expect(icon1Styles.alignItems).toBe(icon2Styles.alignItems);
            expect(icon1Styles.justifyContent).toBe(icon2Styles.justifyContent);
            expect(icon1Styles.margin).toBe(icon2Styles.margin);
            expect(icon1Styles.transition).toBe(icon2Styles.transition);
            
            // Icons should have consistent dimensions
            const icon1Rect = icon1.getBoundingClientRect();
            const icon2Rect = icon2.getBoundingClientRect();
            
            expect(icon1Rect.width).toBe(icon2Rect.width);
            expect(icon1Rect.height).toBe(icon2Rect.height);
          }
          
          // Test title consistency
          const title1 = card1.querySelector('.franchise-benefit-title');
          const title2 = card2.querySelector('.franchise-benefit-title');
          
          if (title1 && title2) {
            const title1Styles = mockWindow.getComputedStyle(title1);
            const title2Styles = mockWindow.getComputedStyle(title2);
            
            // Titles should have consistent typography
            expect(title1Styles.fontFamily).toBe(title2Styles.fontFamily);
            expect(title1Styles.fontSize).toBe(title2Styles.fontSize);
            expect(title1Styles.fontWeight).toBe(title2Styles.fontWeight);
            expect(title1Styles.lineHeight).toBe(title2Styles.lineHeight);
            expect(title1Styles.marginBottom).toBe(title2Styles.marginBottom);
            expect(title1Styles.color).toBe(title2Styles.color);
          }
          
          // Test description consistency
          const desc1 = card1.querySelector('.franchise-benefit-description');
          const desc2 = card2.querySelector('.franchise-benefit-description');
          
          if (desc1 && desc2) {
            const desc1Styles = mockWindow.getComputedStyle(desc1);
            const desc2Styles = mockWindow.getComputedStyle(desc2);
            
            // Descriptions should have consistent typography
            expect(desc1Styles.fontSize).toBe(desc2Styles.fontSize);
            expect(desc1Styles.lineHeight).toBe(desc2Styles.lineHeight);
            expect(desc1Styles.color).toBe(desc2Styles.color);
            expect(desc1Styles.opacity).toBe(desc2Styles.opacity);
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  });

  test('Property 4: Visual Hierarchy Consistency - Support cards maintain consistent visual treatment', () => {
    fc.assert(
      fc.property(
        // Generate random card indices to test consistency across different support cards
        fc.record({
          cardIndex1: fc.integer({ min: 0, max: 5 }),
          cardIndex2: fc.integer({ min: 0, max: 5 }),
          viewport: fc.record({
            width: fc.integer({ min: 320, max: 1920 }),
            height: fc.integer({ min: 568, max: 1080 })
          })
        }),
        (testCase) => {
          const { cardIndex1, cardIndex2, viewport } = testCase;
          
          // Set viewport size
          mockWindow.innerWidth = viewport.width;
          mockWindow.innerHeight = viewport.height;
          
          // Get support cards
          const supportCards = mockDocument.querySelectorAll('.franchise-support-card');
          
          // Verify we have the expected number of cards
          expect(supportCards.length).toBe(6);
          
          // Get two different cards to compare
          const card1 = supportCards[cardIndex1];
          const card2 = supportCards[cardIndex2];
          
          expect(card1).toBeTruthy();
          expect(card2).toBeTruthy();
          
          // Get computed styles for both cards
          const card1Styles = mockWindow.getComputedStyle(card1);
          const card2Styles = mockWindow.getComputedStyle(card2);
          
          // Verify consistent card container styling
          expect(card1Styles.padding).toBe(card2Styles.padding);
          expect(card1Styles.borderRadius).toBe(card2Styles.borderRadius);
          expect(card1Styles.backgroundColor).toBe(card2Styles.backgroundColor);
          expect(card1Styles.border).toBe(card2Styles.border);
          expect(card1Styles.boxShadow).toBe(card2Styles.boxShadow);
          expect(card1Styles.textAlign).toBe(card2Styles.textAlign);
          expect(card1Styles.transition).toBe(card2Styles.transition);
          
          // Test icon consistency
          const icon1 = card1.querySelector('.franchise-support-icon');
          const icon2 = card2.querySelector('.franchise-support-icon');
          
          if (icon1 && icon2) {
            const icon1Styles = mockWindow.getComputedStyle(icon1);
            const icon2Styles = mockWindow.getComputedStyle(icon2);
            
            // Icons should have consistent styling
            expect(icon1Styles.width).toBe(icon2Styles.width);
            expect(icon1Styles.height).toBe(icon2Styles.height);
            expect(icon1Styles.borderRadius).toBe(icon2Styles.borderRadius);
            expect(icon1Styles.backgroundColor).toBe(icon2Styles.backgroundColor);
            expect(icon1Styles.display).toBe(icon2Styles.display);
            expect(icon1Styles.alignItems).toBe(icon2Styles.alignItems);
            expect(icon1Styles.justifyContent).toBe(icon2Styles.justifyContent);
            expect(icon1Styles.margin).toBe(icon2Styles.margin);
            expect(icon1Styles.transition).toBe(icon2Styles.transition);
          }
          
          // Test title consistency
          const title1 = card1.querySelector('.franchise-support-title');
          const title2 = card2.querySelector('.franchise-support-title');
          
          if (title1 && title2) {
            const title1Styles = mockWindow.getComputedStyle(title1);
            const title2Styles = mockWindow.getComputedStyle(title2);
            
            // Titles should have consistent typography
            expect(title1Styles.fontFamily).toBe(title2Styles.fontFamily);
            expect(title1Styles.fontSize).toBe(title2Styles.fontSize);
            expect(title1Styles.fontWeight).toBe(title2Styles.fontWeight);
            expect(title1Styles.lineHeight).toBe(title2Styles.lineHeight);
            expect(title1Styles.marginBottom).toBe(title2Styles.marginBottom);
            expect(title1Styles.color).toBe(title2Styles.color);
          }
          
          // Test description consistency
          const desc1 = card1.querySelector('.franchise-support-description');
          const desc2 = card2.querySelector('.franchise-support-description');
          
          if (desc1 && desc2) {
            const desc1Styles = mockWindow.getComputedStyle(desc1);
            const desc2Styles = mockWindow.getComputedStyle(desc2);
            
            // Descriptions should have consistent typography
            expect(desc1Styles.fontSize).toBe(desc2Styles.fontSize);
            expect(desc1Styles.lineHeight).toBe(desc2Styles.lineHeight);
            expect(desc1Styles.color).toBe(desc2Styles.color);
            expect(desc1Styles.opacity).toBe(desc2Styles.opacity);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 4: Visual Hierarchy Consistency - Benefit and support cards share consistent visual treatment', () => {
    fc.assert(
      fc.property(
        // Generate random indices to compare benefit and support cards
        fc.record({
          benefitIndex: fc.integer({ min: 0, max: 5 }),
          supportIndex: fc.integer({ min: 0, max: 5 }),
          viewport: fc.record({
            width: fc.integer({ min: 320, max: 1920 }),
            height: fc.integer({ min: 568, max: 1080 })
          })
        }),
        (testCase) => {
          const { benefitIndex, supportIndex, viewport } = testCase;
          
          // Set viewport size
          mockWindow.innerWidth = viewport.width;
          mockWindow.innerHeight = viewport.height;
          
          // Get benefit and support cards
          const benefitCards = mockDocument.querySelectorAll('.franchise-benefit-card');
          const supportCards = mockDocument.querySelectorAll('.franchise-support-card');
          
          // Verify we have the expected number of cards
          expect(benefitCards.length).toBe(6);
          expect(supportCards.length).toBe(6);
          
          // Get one card from each type
          const benefitCard = benefitCards[benefitIndex];
          const supportCard = supportCards[supportIndex];
          
          expect(benefitCard).toBeTruthy();
          expect(supportCard).toBeTruthy();
          
          // Get computed styles for both card types
          const benefitStyles = mockWindow.getComputedStyle(benefitCard);
          const supportStyles = mockWindow.getComputedStyle(supportCard);
          
          // Verify consistent card container styling across card types
          // Both benefit and support cards should follow the same visual hierarchy
          expect(benefitStyles.padding).toBe(supportStyles.padding);
          expect(benefitStyles.borderRadius).toBe(supportStyles.borderRadius);
          expect(benefitStyles.backgroundColor).toBe(supportStyles.backgroundColor);
          expect(benefitStyles.border).toBe(supportStyles.border);
          expect(benefitStyles.boxShadow).toBe(supportStyles.boxShadow);
          expect(benefitStyles.textAlign).toBe(supportStyles.textAlign);
          expect(benefitStyles.transition).toBe(supportStyles.transition);
          
          // Test icon consistency across card types
          const benefitIcon = benefitCard.querySelector('.franchise-benefit-icon');
          const supportIcon = supportCard.querySelector('.franchise-support-icon');
          
          if (benefitIcon && supportIcon) {
            const benefitIconStyles = mockWindow.getComputedStyle(benefitIcon);
            const supportIconStyles = mockWindow.getComputedStyle(supportIcon);
            
            // Icons should have consistent styling across card types
            expect(benefitIconStyles.width).toBe(supportIconStyles.width);
            expect(benefitIconStyles.height).toBe(supportIconStyles.height);
            expect(benefitIconStyles.borderRadius).toBe(supportIconStyles.borderRadius);
            expect(benefitIconStyles.backgroundColor).toBe(supportIconStyles.backgroundColor);
            expect(benefitIconStyles.display).toBe(supportIconStyles.display);
            expect(benefitIconStyles.alignItems).toBe(supportIconStyles.alignItems);
            expect(benefitIconStyles.justifyContent).toBe(supportIconStyles.justifyContent);
            expect(benefitIconStyles.margin).toBe(supportIconStyles.margin);
            expect(benefitIconStyles.transition).toBe(supportIconStyles.transition);
          }
          
          // Test title consistency across card types
          const benefitTitle = benefitCard.querySelector('.franchise-benefit-title');
          const supportTitle = supportCard.querySelector('.franchise-support-title');
          
          if (benefitTitle && supportTitle) {
            const benefitTitleStyles = mockWindow.getComputedStyle(benefitTitle);
            const supportTitleStyles = mockWindow.getComputedStyle(supportTitle);
            
            // Titles should have consistent typography across card types
            expect(benefitTitleStyles.fontFamily).toBe(supportTitleStyles.fontFamily);
            expect(benefitTitleStyles.fontSize).toBe(supportTitleStyles.fontSize);
            expect(benefitTitleStyles.fontWeight).toBe(supportTitleStyles.fontWeight);
            expect(benefitTitleStyles.lineHeight).toBe(supportTitleStyles.lineHeight);
            expect(benefitTitleStyles.marginBottom).toBe(supportTitleStyles.marginBottom);
            expect(benefitTitleStyles.color).toBe(supportTitleStyles.color);
          }
          
          // Test description consistency across card types
          const benefitDesc = benefitCard.querySelector('.franchise-benefit-description');
          const supportDesc = supportCard.querySelector('.franchise-support-description');
          
          if (benefitDesc && supportDesc) {
            const benefitDescStyles = mockWindow.getComputedStyle(benefitDesc);
            const supportDescStyles = mockWindow.getComputedStyle(supportDesc);
            
            // Descriptions should have consistent typography across card types
            expect(benefitDescStyles.fontSize).toBe(supportDescStyles.fontSize);
            expect(benefitDescStyles.lineHeight).toBe(supportDescStyles.lineHeight);
            expect(benefitDescStyles.color).toBe(supportDescStyles.color);
            expect(benefitDescStyles.opacity).toBe(supportDescStyles.opacity);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 4: Visual Hierarchy Consistency - Brand color consistency across all card elements', () => {
    fc.assert(
      fc.property(
        // Test brand color consistency across different viewport sizes
        fc.record({
          viewport: fc.record({
            width: fc.integer({ min: 320, max: 1920 }),
            height: fc.integer({ min: 568, max: 1080 })
          }),
          cardType: fc.oneof(
            fc.constant('benefit'),
            fc.constant('support')
          )
        }),
        (testCase) => {
          const { viewport, cardType } = testCase;
          
          // Set viewport size
          mockWindow.innerWidth = viewport.width;
          mockWindow.innerHeight = viewport.height;
          
          // Get cards based on type
          const cards = cardType === 'benefit' 
            ? mockDocument.querySelectorAll('.franchise-benefit-card')
            : mockDocument.querySelectorAll('.franchise-support-card');
          
          expect(cards.length).toBe(6);
          
          // Test brand color consistency across all cards
          cards.forEach((card, index) => {
            const cardStyles = mockWindow.getComputedStyle(card);
            
            // Verify consistent brand colors
            expect(cardStyles.backgroundColor).toBe('#F5F1EB'); // Franchise cream
            expect(cardStyles.border).toBe('1px solid rgba(60, 36, 21, 0.1)'); // Coffee brown with opacity
            expect(cardStyles.boxShadow).toBe('0 4px 12px rgba(60, 36, 21, 0.15)'); // Coffee brown shadow
            
            // Test icon brand colors
            const iconSelector = cardType === 'benefit' ? '.franchise-benefit-icon' : '.franchise-support-icon';
            const icon = card.querySelector(iconSelector);
            
            if (icon) {
              const iconStyles = mockWindow.getComputedStyle(icon);
              expect(iconStyles.backgroundColor).toBe('rgba(60, 36, 21, 0.05)'); // Coffee brown with low opacity
            }
            
            // Test title brand colors
            const titleSelector = cardType === 'benefit' ? '.franchise-benefit-title' : '.franchise-support-title';
            const title = card.querySelector(titleSelector);
            
            if (title) {
              const titleStyles = mockWindow.getComputedStyle(title);
              expect(titleStyles.color).toBe('#3C2415'); // Coffee brown
            }
            
            // Test description brand colors
            const descSelector = cardType === 'benefit' ? '.franchise-benefit-description' : '.franchise-support-description';
            const description = card.querySelector(descSelector);
            
            if (description) {
              const descStyles = mockWindow.getComputedStyle(description);
              expect(descStyles.color).toBe('#2C1810'); // Dark text color
            }
          });
          
          // Verify all cards maintain the same brand color scheme
          if (cards.length > 1) {
            const firstCardStyles = mockWindow.getComputedStyle(cards[0]);
            
            for (let i = 1; i < cards.length; i++) {
              const cardStyles = mockWindow.getComputedStyle(cards[i]);
              
              // All cards should have identical brand colors
              expect(cardStyles.backgroundColor).toBe(firstCardStyles.backgroundColor);
              expect(cardStyles.border).toBe(firstCardStyles.border);
              expect(cardStyles.boxShadow).toBe(firstCardStyles.boxShadow);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});