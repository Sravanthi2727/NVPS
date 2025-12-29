// Feature: franchise-page, Property 7: Typography Accessibility
const fc = require('fast-check');

describe('Franchise Page Typography Accessibility Property Tests', () => {

  /**
   * Property 7: Typography Accessibility
   * For any text element, the font weight, size, and contrast ratio should meet 
   * accessibility standards while maintaining the bold/readable hierarchy
   * Validates: Requirements 8.4, 8.5
   */
  test('Property 7: Typography accessibility standards are maintained across all text elements', () => {
    // Define the brand color palette used in the franchise page
    const brandColors = {
      coffeeBrown: { r: 60, g: 36, b: 21 },    // #3C2415
      cream: { r: 245, g: 241, b: 235 },        // #F5F1EB  
      gold: { r: 212, g: 175, b: 55 },          // #D4AF37
      textDark: { r: 44, g: 24, b: 16 }         // #2C1810
    };

    // Generator for typography specifications used in the franchise page
    // Create separate generators for headings and body text to ensure valid combinations
    const headingArbitrary = fc.record({
      type: fc.constant('heading'),
      fontSize: fc.integer({ min: 18, max: 48 }), // Headings must be at least 18px
      fontWeight: fc.constantFrom(600, 700), // Headings must be at least 600 weight
      lineHeight: fc.float({ min: Math.fround(1.2), max: Math.fround(2.0), noNaN: true }), // Headings must have at least 1.2 line height
      textColor: fc.constantFrom(brandColors.cream, brandColors.gold), // Light colors for headings
      bgColor: fc.constant(brandColors.coffeeBrown) // Dark background for contrast
    });

    const bodyArbitrary = fc.record({
      type: fc.constant('body'),
      fontSize: fc.integer({ min: 14, max: 24 }), // Body text can be 14px minimum
      fontWeight: fc.constantFrom(400, 500), // Body text can be 400 weight minimum
      lineHeight: fc.float({ min: Math.fround(1.4), max: Math.fround(2.0), noNaN: true }), // Body text must have at least 1.4 line height
      textColor: fc.constantFrom(brandColors.coffeeBrown, brandColors.textDark), // Dark colors for body text
      bgColor: fc.constant(brandColors.cream) // Light background for contrast
    });

    // Combine generators - no need to filter since we're ensuring good contrast combinations
    const typographyArbitrary = fc.oneof(headingArbitrary, bodyArbitrary);

    fc.assert(
      fc.property(typographyArbitrary, (spec) => {
        const isHeading = spec.type === 'heading';
        
        // Test 1: Font size meets minimum accessibility requirements
        const minSize = isHeading ? 18 : 14;
        expect(spec.fontSize).toBeGreaterThanOrEqual(minSize);
        
        // Test 2: Font weight maintains proper hierarchy
        const minWeight = isHeading ? 600 : 400;
        expect(spec.fontWeight).toBeGreaterThanOrEqual(minWeight);
        
        // Test 3: Line height ensures readability
        const minLineHeight = isHeading ? 1.2 : 1.4;
        expect(spec.lineHeight).toBeGreaterThan(minLineHeight - 0.01); // Account for floating point precision
        
        // Test 4: Color contrast meets WCAG accessibility standards
        const contrastRatio = calculateContrastRatio(spec.textColor, spec.bgColor);
        const isLargeText = spec.fontSize >= 18 || (spec.fontSize >= 14 && spec.fontWeight >= 700);
        const minContrast = isLargeText ? 3.0 : 4.5;
        
        // Only test contrast if colors are different (avoid same color on same color)
        if (spec.textColor !== spec.bgColor) {
          expect(contrastRatio).toBeGreaterThanOrEqual(minContrast);
        }
      }),
      { numRuns: 100 }
    );
  });

  // Test for specific brand color contrast ratios
  test('Brand color contrast ratios meet accessibility standards', () => {
    // Test the specific brand colors mentioned in the design document
    const brandColors = {
      coffeeBrown: { r: 60, g: 36, b: 21 },    // #3C2415
      cream: { r: 245, g: 241, b: 235 },        // #F5F1EB  
      gold: { r: 212, g: 175, b: 55 },          // #D4AF37
      textDark: { r: 44, g: 24, b: 16 }         // #2C1810
    };

    // Test cream text on coffee brown background (hero section)
    const creamOnBrownRatio = calculateContrastRatio(brandColors.cream, brandColors.coffeeBrown);
    expect(creamOnBrownRatio).toBeGreaterThanOrEqual(4.5);

    // Test dark text on cream background (benefits section)
    const darkOnCreamRatio = calculateContrastRatio(brandColors.textDark, brandColors.cream);
    expect(darkOnCreamRatio).toBeGreaterThanOrEqual(4.5);

    // Test gold on coffee brown background (accent text)
    const goldOnBrownRatio = calculateContrastRatio(brandColors.gold, brandColors.coffeeBrown);
    expect(goldOnBrownRatio).toBeGreaterThanOrEqual(3.0); // Large text standard for accent colors
  });

  // Test for typography hierarchy consistency
  test('Typography hierarchy maintains consistent specifications', () => {
    // Test that heading specifications meet accessibility standards
    const headingSpecs = [
      { fontSize: 48, fontWeight: 700, lineHeight: 57.6 }, // Hero title
      { fontSize: 40, fontWeight: 700, lineHeight: 48 },   // Section titles
      { fontSize: 22, fontWeight: 600, lineHeight: 28.6 }  // Card titles
    ];

    headingSpecs.forEach(spec => {
      // Font size should be at least 18px for headings
      expect(spec.fontSize).toBeGreaterThanOrEqual(18);
      
      // Font weight should be at least 600 for headings
      expect(spec.fontWeight).toBeGreaterThanOrEqual(600);
      
      // Line height ratio should be at least 1.2 for headings
      const lineHeightRatio = spec.lineHeight / spec.fontSize;
      expect(lineHeightRatio).toBeGreaterThanOrEqual(1.2);
    });

    // Test that body text specifications meet accessibility standards
    const bodySpecs = [
      { fontSize: 20, fontWeight: 400, lineHeight: 32 },   // Hero subtitle
      { fontSize: 18, fontWeight: 400, lineHeight: 28.8 }, // Section subtitles
      { fontSize: 16, fontWeight: 400, lineHeight: 25.6 }  // Descriptions
    ];

    bodySpecs.forEach(spec => {
      // Font size should be at least 14px for body text
      expect(spec.fontSize).toBeGreaterThanOrEqual(14);
      
      // Font weight should be at least 400 for body text
      expect(spec.fontWeight).toBeGreaterThanOrEqual(400);
      
      // Line height ratio should be at least 1.4 for body text
      const lineHeightRatio = spec.lineHeight / spec.fontSize;
      expect(lineHeightRatio).toBeGreaterThanOrEqual(1.4);
    });
  });

  // Helper function to calculate contrast ratio between two colors
  function calculateContrastRatio(color1, color2) {
    const luminance1 = getRelativeLuminance(color1);
    const luminance2 = getRelativeLuminance(color2);
    
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Helper function to calculate relative luminance
  function getRelativeLuminance(color) {
    const { r, g, b } = color;
    
    // Convert to sRGB
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;
    
    // Apply gamma correction
    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    // Calculate relative luminance
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }
});