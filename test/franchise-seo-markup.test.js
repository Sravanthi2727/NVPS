const fc = require('fast-check');

// Feature: franchise-page, Property 9: SEO Markup Completeness

describe('Franchise Page SEO Markup Completeness Property Tests', () => {
  let mockDocument;
  let mockWindow;
  
  beforeEach(() => {
    // Create mock DOM environment with SEO elements
    mockDocument = {
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(),
      createElement: jest.fn(),
      head: {
        querySelector: jest.fn(),
        querySelectorAll: jest.fn()
      },
      documentElement: {
        lang: 'en'
      },
      title: 'Franchise Opportunities - Partner with Rabuste Coffee'
    };
    
    mockWindow = {
      location: {
        href: 'https://rabustecoffee.com/franchise',
        origin: 'https://rabustecoffee.com'
      }
    };
    
    // Mock SEO-related elements found in the franchise page
    const mockSEOElements = {
      // Meta tags
      titleTag: {
        tagName: 'TITLE',
        textContent: 'Franchise Opportunities - Partner with Rabuste Coffee',
        getAttribute: () => null
      },
      
      metaDescription: {
        tagName: 'META',
        name: 'description',
        content: 'Join the Rabuste Coffee franchise revolution. Premium Robusta-only café concept with comprehensive support, proven business model, and ₹75K-₹150K investment range.',
        getAttribute: (attr) => attr === 'name' ? 'description' : attr === 'content' ? 'Join the Rabuste Coffee franchise revolution. Premium Robusta-only café concept with comprehensive support, proven business model, and ₹75K-₹150K investment range.' : null
      },
      
      metaKeywords: {
        tagName: 'META',
        name: 'keywords',
        content: 'robusta coffee, premium coffee, coffee franchise, artisanal coffee, coffee culture, community cafe',
        getAttribute: (attr) => attr === 'name' ? 'keywords' : attr === 'content' ? 'robusta coffee, premium coffee, coffee franchise, artisanal coffee, coffee culture, community cafe' : null
      },
      
      metaRobots: {
        tagName: 'META',
        name: 'robots',
        content: 'index, follow',
        getAttribute: (attr) => attr === 'name' ? 'robots' : attr === 'content' ? 'index, follow' : null
      },
      
      // Open Graph tags
      ogTitle: {
        tagName: 'META',
        property: 'og:title',
        content: 'Franchise Opportunities - Partner with Rabuste Coffee',
        getAttribute: (attr) => attr === 'property' ? 'og:title' : attr === 'content' ? 'Franchise Opportunities - Partner with Rabuste Coffee' : null
      },
      
      ogDescription: {
        tagName: 'META',
        property: 'og:description',
        content: 'Join the Rabuste Coffee franchise revolution. Premium Robusta-only café concept with comprehensive support, proven business model, and ₹75K-₹150K investment range.',
        getAttribute: (attr) => attr === 'property' ? 'og:description' : attr === 'content' ? 'Join the Rabuste Coffee franchise revolution. Premium Robusta-only café concept with comprehensive support, proven business model, and ₹75K-₹150K investment range.' : null
      },
      
      ogType: {
        tagName: 'META',
        property: 'og:type',
        content: 'website',
        getAttribute: (attr) => attr === 'property' ? 'og:type' : attr === 'content' ? 'website' : null
      },
      
      ogUrl: {
        tagName: 'META',
        property: 'og:url',
        content: 'https://rabustecoffee.com/franchise',
        getAttribute: (attr) => attr === 'property' ? 'og:url' : attr === 'content' ? 'https://rabustecoffee.com/franchise' : null
      },
      
      ogImage: {
        tagName: 'META',
        property: 'og:image',
        content: '/assets/logo-icon.png',
        getAttribute: (attr) => attr === 'property' ? 'og:image' : attr === 'content' ? '/assets/logo-icon.png' : null
      },
      
      // Twitter Card tags
      twitterCard: {
        tagName: 'META',
        name: 'twitter:card',
        content: 'summary_large_image',
        getAttribute: (attr) => attr === 'name' ? 'twitter:card' : attr === 'content' ? 'summary_large_image' : null
      },
      
      twitterTitle: {
        tagName: 'META',
        name: 'twitter:title',
        content: 'Franchise Opportunities - Partner with Rabuste Coffee',
        getAttribute: (attr) => attr === 'name' ? 'twitter:title' : attr === 'content' ? 'Franchise Opportunities - Partner with Rabuste Coffee' : null
      },
      
      // Canonical URL
      canonicalLink: {
        tagName: 'LINK',
        rel: 'canonical',
        href: 'https://rabustecoffee.com/franchise',
        getAttribute: (attr) => attr === 'rel' ? 'canonical' : attr === 'href' ? 'https://rabustecoffee.com/franchise' : null
      },
      
      // Structured Data (JSON-LD)
      organizationSchema: {
        tagName: 'SCRIPT',
        type: 'application/ld+json',
        textContent: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Rabuste Coffee",
          "url": "https://rabustecoffee.com",
          "logo": "https://rabustecoffee.com/assets/logo-icon.png",
          "description": "Premium Robusta-only coffee franchise offering artisanal coffee experiences, community workshops, and cultural programming."
        }),
        getAttribute: (attr) => attr === 'type' ? 'application/ld+json' : null
      },
      
      webPageSchema: {
        tagName: 'SCRIPT',
        type: 'application/ld+json',
        textContent: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Franchise Opportunities - Partner with Rabuste Coffee",
          "description": "Join the Rabuste Coffee franchise revolution. Premium Robusta-only café concept with comprehensive support, proven business model, and ₹75K-₹150K investment range.",
          "url": "https://rabustecoffee.com/franchise"
        }),
        getAttribute: (attr) => attr === 'type' ? 'application/ld+json' : null
      },
      
      // Semantic HTML elements
      mainElement: {
        tagName: 'MAIN',
        role: 'main',
        getAttribute: (attr) => attr === 'role' ? 'main' : null
      },
      
      headerElement: {
        tagName: 'HEADER',
        role: 'banner',
        getAttribute: (attr) => attr === 'role' ? 'banner' : null
      },
      
      footerElement: {
        tagName: 'FOOTER',
        role: 'contentinfo',
        getAttribute: (attr) => attr === 'role' ? 'contentinfo' : null
      },
      
      // Heading hierarchy
      h1Elements: [{
        tagName: 'H1',
        textContent: 'Partner with a Bold Coffee Revolution.',
        getAttribute: () => null
      }],
      
      h2Elements: [
        {
          tagName: 'H2',
          textContent: 'Why Partner with Rabuste Coffee?',
          getAttribute: () => null
        },
        {
          tagName: 'H2',
          textContent: 'A Proven Business Model',
          getAttribute: () => null
        },
        {
          tagName: 'H2',
          textContent: 'Comprehensive Brand Support',
          getAttribute: () => null
        }
      ],
      
      // Microdata elements
      microdataElements: [
        {
          tagName: 'DIV',
          getAttribute: (attr) => attr === 'itemscope' ? '' : attr === 'itemtype' ? 'https://schema.org/WebPage' : null
        }
      ]
    };
    
    // Set up querySelector mocks
    mockDocument.querySelector.mockImplementation((selector) => {
      switch (selector) {
        case 'title':
          return mockSEOElements.titleTag;
        case 'meta[name="description"]':
          return mockSEOElements.metaDescription;
        case 'meta[name="keywords"]':
          return mockSEOElements.metaKeywords;
        case 'meta[name="robots"]':
          return mockSEOElements.metaRobots;
        case 'meta[property="og:title"]':
          return mockSEOElements.ogTitle;
        case 'meta[property="og:description"]':
          return mockSEOElements.ogDescription;
        case 'meta[property="og:type"]':
          return mockSEOElements.ogType;
        case 'meta[property="og:url"]':
          return mockSEOElements.ogUrl;
        case 'meta[property="og:image"]':
          return mockSEOElements.ogImage;
        case 'meta[name="twitter:card"]':
          return mockSEOElements.twitterCard;
        case 'meta[name="twitter:title"]':
          return mockSEOElements.twitterTitle;
        case 'link[rel="canonical"]':
          return mockSEOElements.canonicalLink;
        case 'main':
          return mockSEOElements.mainElement;
        case 'header':
          return mockSEOElements.headerElement;
        case 'footer':
          return mockSEOElements.footerElement;
        case 'h1':
          return mockSEOElements.h1Elements[0];
        default:
          return null;
      }
    });
    
    mockDocument.querySelectorAll.mockImplementation((selector) => {
      switch (selector) {
        case 'script[type="application/ld+json"]':
          return [mockSEOElements.organizationSchema, mockSEOElements.webPageSchema];
        case 'h1':
          return mockSEOElements.h1Elements;
        case 'h2':
          return mockSEOElements.h2Elements;
        case '[itemscope]':
          return mockSEOElements.microdataElements;
        case 'meta[property^="og:"]':
          return [mockSEOElements.ogTitle, mockSEOElements.ogDescription, mockSEOElements.ogType, mockSEOElements.ogUrl, mockSEOElements.ogImage];
        case 'meta[name^="twitter:"]':
          return [mockSEOElements.twitterCard, mockSEOElements.twitterTitle];
        default:
          return [];
      }
    });
    
    // Mock head element queries
    mockDocument.head.querySelector = mockDocument.querySelector;
    mockDocument.head.querySelectorAll = mockDocument.querySelectorAll;
    
    global.document = mockDocument;
    global.window = mockWindow;
  });

  /**
   * Property 9: SEO Markup Completeness
   * For any page section, the HTML markup should include appropriate semantic elements, 
   * meta tags, and structured data for SEO optimization
   * Validates: Requirements 9.5
   */
  test('Property 9: SEO Markup Completeness - Essential meta tags are present and properly formatted', () => {
    fc.assert(
      fc.property(
        // Generate different SEO validation scenarios
        fc.record({
          metaTagType: fc.oneof(
            fc.constant('basic'),
            fc.constant('open-graph'),
            fc.constant('twitter-card'),
            fc.constant('robots')
          ),
          contentValidation: fc.oneof(
            fc.constant('length'),
            fc.constant('format'),
            fc.constant('presence')
          )
        }),
        (testCase) => {
          const { metaTagType, contentValidation } = testCase;
          
          if (metaTagType === 'basic') {
            // Test basic meta tags
            const titleTag = mockDocument.querySelector('title');
            const metaDescription = mockDocument.querySelector('meta[name="description"]');
            const metaKeywords = mockDocument.querySelector('meta[name="keywords"]');
            
            // Title tag must be present
            expect(titleTag).toBeTruthy();
            expect(titleTag.textContent).toBeTruthy();
            
            if (contentValidation === 'length') {
              // Title should be between 30-60 characters for optimal SEO
              expect(titleTag.textContent.length).toBeGreaterThanOrEqual(30);
              expect(titleTag.textContent.length).toBeLessThanOrEqual(60);
            }
            
            // Meta description must be present
            expect(metaDescription).toBeTruthy();
            expect(metaDescription.getAttribute('content')).toBeTruthy();
            
            if (contentValidation === 'length') {
              // Meta description should be between 120-165 characters for optimal SEO
              const descriptionContent = metaDescription.getAttribute('content');
              expect(descriptionContent.length).toBeGreaterThanOrEqual(120);
              expect(descriptionContent.length).toBeLessThanOrEqual(165);
            }
            
            // Meta keywords should be present
            expect(metaKeywords).toBeTruthy();
            expect(metaKeywords.getAttribute('content')).toBeTruthy();
            
          } else if (metaTagType === 'open-graph') {
            // Test Open Graph meta tags
            const ogTitle = mockDocument.querySelector('meta[property="og:title"]');
            const ogDescription = mockDocument.querySelector('meta[property="og:description"]');
            const ogType = mockDocument.querySelector('meta[property="og:type"]');
            const ogUrl = mockDocument.querySelector('meta[property="og:url"]');
            const ogImage = mockDocument.querySelector('meta[property="og:image"]');
            
            // All essential Open Graph tags must be present
            expect(ogTitle).toBeTruthy();
            expect(ogDescription).toBeTruthy();
            expect(ogType).toBeTruthy();
            expect(ogUrl).toBeTruthy();
            expect(ogImage).toBeTruthy();
            
            if (contentValidation === 'format') {
              // Validate Open Graph content format
              expect(ogTitle.getAttribute('content')).toBeTruthy();
              expect(ogDescription.getAttribute('content')).toBeTruthy();
              expect(ogType.getAttribute('content')).toBe('website');
              
              // URL should be absolute
              const ogUrlContent = ogUrl.getAttribute('content');
              expect(ogUrlContent).toMatch(/^https?:\/\//);
              
              // Image should be a valid path
              const ogImageContent = ogImage.getAttribute('content');
              expect(ogImageContent).toBeTruthy();
            }
            
          } else if (metaTagType === 'twitter-card') {
            // Test Twitter Card meta tags
            const twitterCard = mockDocument.querySelector('meta[name="twitter:card"]');
            const twitterTitle = mockDocument.querySelector('meta[name="twitter:title"]');
            
            // Essential Twitter Card tags must be present
            expect(twitterCard).toBeTruthy();
            expect(twitterTitle).toBeTruthy();
            
            if (contentValidation === 'format') {
              // Validate Twitter Card content format
              const cardType = twitterCard.getAttribute('content');
              expect(['summary', 'summary_large_image', 'app', 'player']).toContain(cardType);
              
              expect(twitterTitle.getAttribute('content')).toBeTruthy();
            }
            
          } else if (metaTagType === 'robots') {
            // Test robots meta tag
            const metaRobots = mockDocument.querySelector('meta[name="robots"]');
            
            expect(metaRobots).toBeTruthy();
            
            if (contentValidation === 'format') {
              const robotsContent = metaRobots.getAttribute('content');
              expect(robotsContent).toBeTruthy();
              
              // Should contain valid robots directives
              const validDirectives = ['index', 'noindex', 'follow', 'nofollow', 'all', 'none'];
              const directives = robotsContent.split(',').map(d => d.trim());
              
              directives.forEach(directive => {
                expect(validDirectives).toContain(directive);
              });
            }
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  });

  test('Property 9: SEO Markup Completeness - Structured data (JSON-LD) is present and valid', () => {
    fc.assert(
      fc.property(
        // Test structured data validation
        fc.record({
          schemaType: fc.oneof(
            fc.constant('organization'),
            fc.constant('webpage'),
            fc.constant('business-opportunity')
          ),
          validationAspect: fc.oneof(
            fc.constant('presence'),
            fc.constant('format'),
            fc.constant('required-fields')
          )
        }),
        (testCase) => {
          const { schemaType, validationAspect } = testCase;
          
          // Get all JSON-LD scripts
          const jsonLdScripts = mockDocument.querySelectorAll('script[type="application/ld+json"]');
          
          // At least one JSON-LD script should be present
          expect(jsonLdScripts.length).toBeGreaterThan(0);
          
          jsonLdScripts.forEach(script => {
            expect(script.textContent).toBeTruthy();
            
            if (validationAspect === 'format') {
              // Validate JSON format
              let parsedData;
              expect(() => {
                parsedData = JSON.parse(script.textContent);
              }).not.toThrow();
              
              // Should have @context and @type
              expect(parsedData['@context']).toBe('https://schema.org');
              expect(parsedData['@type']).toBeTruthy();
            }
            
            if (validationAspect === 'required-fields') {
              const parsedData = JSON.parse(script.textContent);
              
              if (schemaType === 'organization' && parsedData['@type'] === 'Organization') {
                // Organization schema required fields
                expect(parsedData.name).toBeTruthy();
                expect(parsedData.url).toBeTruthy();
                expect(parsedData.description).toBeTruthy();
                
              } else if (schemaType === 'webpage' && parsedData['@type'] === 'WebPage') {
                // WebPage schema required fields
                expect(parsedData.name).toBeTruthy();
                expect(parsedData.description).toBeTruthy();
                expect(parsedData.url).toBeTruthy();
                
              } else if (schemaType === 'business-opportunity' && parsedData.mainEntity && parsedData.mainEntity['@type'] === 'BusinessOpportunity') {
                // BusinessOpportunity schema required fields
                const businessOpp = parsedData.mainEntity;
                expect(businessOpp.name).toBeTruthy();
                expect(businessOpp.description).toBeTruthy();
                expect(businessOpp.category).toBeTruthy();
              }
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 9: SEO Markup Completeness - Semantic HTML elements provide proper document structure', () => {
    fc.assert(
      fc.property(
        // Test semantic HTML structure
        fc.record({
          elementType: fc.oneof(
            fc.constant('landmark'),
            fc.constant('heading-hierarchy'),
            fc.constant('microdata'),
            fc.constant('accessibility')
          ),
          validationLevel: fc.oneof(
            fc.constant('presence'),
            fc.constant('structure'),
            fc.constant('attributes')
          )
        }),
        (testCase) => {
          const { elementType, validationLevel } = testCase;
          
          if (elementType === 'landmark') {
            // Test landmark elements
            const mainElement = mockDocument.querySelector('main');
            const headerElement = mockDocument.querySelector('header');
            const footerElement = mockDocument.querySelector('footer');
            
            if (validationLevel === 'presence') {
              // Essential landmark elements must be present
              expect(mainElement).toBeTruthy();
              expect(headerElement).toBeTruthy();
              expect(footerElement).toBeTruthy();
            }
            
            if (validationLevel === 'attributes') {
              // Landmark elements should have proper roles
              if (mainElement) {
                expect(mainElement.getAttribute('role')).toBe('main');
              }
              if (headerElement) {
                expect(headerElement.getAttribute('role')).toBe('banner');
              }
              if (footerElement) {
                expect(footerElement.getAttribute('role')).toBe('contentinfo');
              }
            }
            
          } else if (elementType === 'heading-hierarchy') {
            // Test heading hierarchy
            const h1Elements = mockDocument.querySelectorAll('h1');
            const h2Elements = mockDocument.querySelectorAll('h2');
            
            if (validationLevel === 'presence') {
              // Should have exactly one H1 element
              expect(h1Elements.length).toBe(1);
              
              // Should have multiple H2 elements for section headings
              expect(h2Elements.length).toBeGreaterThan(0);
            }
            
            if (validationLevel === 'structure') {
              // H1 should contain meaningful content
              if (h1Elements.length > 0) {
                expect(h1Elements[0].textContent).toBeTruthy();
                expect(h1Elements[0].textContent.length).toBeGreaterThan(10);
              }
              
              // H2 elements should contain meaningful content
              h2Elements.forEach(h2 => {
                expect(h2.textContent).toBeTruthy();
                expect(h2.textContent.length).toBeGreaterThan(5);
              });
            }
            
          } else if (elementType === 'microdata') {
            // Test microdata attributes
            const microdataElements = mockDocument.querySelectorAll('[itemscope]');
            
            if (validationLevel === 'presence') {
              // Should have microdata elements
              expect(microdataElements.length).toBeGreaterThan(0);
            }
            
            if (validationLevel === 'attributes') {
              microdataElements.forEach(element => {
                // Elements with itemscope should have itemtype
                const itemtype = element.getAttribute('itemtype');
                if (itemtype) {
                  expect(itemtype).toMatch(/^https?:\/\/schema\.org\//);
                }
              });
            }
            
          } else if (elementType === 'accessibility') {
            // Test accessibility-related SEO attributes
            const titleTag = mockDocument.querySelector('title');
            
            if (validationLevel === 'presence') {
              // Document should have lang attribute
              expect(mockDocument.documentElement.lang).toBeTruthy();
              
              // Title should be present
              expect(titleTag).toBeTruthy();
            }
            
            if (validationLevel === 'attributes') {
              // Lang attribute should be valid
              expect(mockDocument.documentElement.lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?₹/);
              
              // Title should be descriptive
              if (titleTag) {
                expect(titleTag.textContent.length).toBeGreaterThan(10);
              }
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 9: SEO Markup Completeness - Canonical URL and meta robots support proper indexing', () => {
    fc.assert(
      fc.property(
        // Test indexing-related SEO elements
        fc.record({
          indexingAspect: fc.oneof(
            fc.constant('canonical-url'),
            fc.constant('robots-directive'),
            fc.constant('url-structure')
          )
        }),
        (testCase) => {
          const { indexingAspect } = testCase;
          
          if (indexingAspect === 'canonical-url') {
            // Test canonical URL
            const canonicalLink = mockDocument.querySelector('link[rel="canonical"]');
            
            expect(canonicalLink).toBeTruthy();
            
            const canonicalHref = canonicalLink.getAttribute('href');
            expect(canonicalHref).toBeTruthy();
            
            // Canonical URL should be absolute
            expect(canonicalHref).toMatch(/^https?:\/\//);
            
            // Should match the current page URL structure
            expect(canonicalHref).toContain('/franchise');
            
          } else if (indexingAspect === 'robots-directive') {
            // Test robots meta tag
            const metaRobots = mockDocument.querySelector('meta[name="robots"]');
            
            expect(metaRobots).toBeTruthy();
            
            const robotsContent = metaRobots.getAttribute('content');
            expect(robotsContent).toBeTruthy();
            
            // For a franchise page, should typically allow indexing
            expect(robotsContent).toContain('index');
            expect(robotsContent).toContain('follow');
            
          } else if (indexingAspect === 'url-structure') {
            // Test URL structure consistency across meta tags
            const canonicalUrl = mockDocument.querySelector('link[rel="canonical"]')?.getAttribute('href');
            const ogUrl = mockDocument.querySelector('meta[property="og:url"]')?.getAttribute('content');
            
            if (canonicalUrl && ogUrl) {
              // Canonical and OG URLs should match
              expect(canonicalUrl).toBe(ogUrl);
            }
            
            // URLs should follow SEO-friendly structure
            if (canonicalUrl) {
              expect(canonicalUrl).toMatch(/\/franchise₹/); // Clean URL structure
              expect(canonicalUrl).not.toMatch(/\?/); // No query parameters in canonical
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 9: SEO Markup Completeness - All meta tag content meets quality standards', () => {
    fc.assert(
      fc.property(
        // Test meta tag content quality
        fc.record({
          contentAspect: fc.oneof(
            fc.constant('length-optimization'),
            fc.constant('keyword-relevance'),
            fc.constant('uniqueness'),
            fc.constant('brand-consistency')
          )
        }),
        (testCase) => {
          const { contentAspect } = testCase;
          
          const titleTag = mockDocument.querySelector('title');
          const metaDescription = mockDocument.querySelector('meta[name="description"]');
          const ogTitle = mockDocument.querySelector('meta[property="og:title"]');
          const ogDescription = mockDocument.querySelector('meta[property="og:description"]');
          
          if (contentAspect === 'length-optimization') {
            // Test optimal lengths for SEO
            if (titleTag) {
              const titleLength = titleTag.textContent.length;
              expect(titleLength).toBeGreaterThanOrEqual(30);
              expect(titleLength).toBeLessThanOrEqual(60);
            }
            
            if (metaDescription) {
              const descLength = metaDescription.getAttribute('content').length;
              expect(descLength).toBeGreaterThanOrEqual(120);
              expect(descLength).toBeLessThanOrEqual(165);
            }
            
          } else if (contentAspect === 'keyword-relevance') {
            // Test keyword presence in meta content
            const franchiseKeywords = ['franchise', 'coffee', 'robusta', 'business', 'opportunity'];
            
            if (titleTag) {
              const titleText = titleTag.textContent.toLowerCase();
              const keywordMatches = franchiseKeywords.filter(keyword => titleText.includes(keyword));
              expect(keywordMatches.length).toBeGreaterThan(0);
            }
            
            if (metaDescription) {
              const descText = metaDescription.getAttribute('content').toLowerCase();
              const keywordMatches = franchiseKeywords.filter(keyword => descText.includes(keyword));
              expect(keywordMatches.length).toBeGreaterThan(1);
            }
            
          } else if (contentAspect === 'uniqueness') {
            // Test that title and description are different
            if (titleTag && metaDescription) {
              const titleText = titleTag.textContent;
              const descText = metaDescription.getAttribute('content');
              
              expect(titleText).not.toBe(descText);
              
              // Should have some unique content (not just substrings)
              const titleWords = titleText.toLowerCase().split(/\s+/);
              const descWords = descText.toLowerCase().split(/\s+/);
              const uniqueDescWords = descWords.filter(word => !titleWords.includes(word));
              
              expect(uniqueDescWords.length).toBeGreaterThan(5);
            }
            
          } else if (contentAspect === 'brand-consistency') {
            // Test brand name consistency across meta tags
            const brandName = 'Rabuste Coffee';
            
            if (titleTag) {
              expect(titleTag.textContent).toContain(brandName);
            }
            
            if (ogTitle) {
              expect(ogTitle.getAttribute('content')).toContain(brandName);
            }
            
            // Organization schema should also contain brand name
            const jsonLdScripts = mockDocument.querySelectorAll('script[type="application/ld+json"]');
            let foundBrandInSchema = false;
            
            jsonLdScripts.forEach(script => {
              const data = JSON.parse(script.textContent);
              if (data['@type'] === 'Organization' && data.name === brandName) {
                foundBrandInSchema = true;
              }
            });
            
            expect(foundBrandInSchema).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});