/**
 * Franchise Page Diagnostic Script
 * Helps identify frontend issues and provides debugging information
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('🔍 Franchise Page Diagnostic Starting...');
  
  const diagnostics = {
    pageLoad: false,
    cssLoaded: false,
    jsLoaded: false,
    backgroundOverride: false,
    sectionsPresent: false,
    formFunctional: false,
    responsiveLayout: false
  };
  
  // Check if page loaded properly
  diagnostics.pageLoad = document.querySelector('.franchise-page') !== null;
  console.log('✅ Page loaded:', diagnostics.pageLoad);
  
  // Check if CSS is loaded
  const franchiseCSS = Array.from(document.styleSheets).find(sheet => 
    sheet.href && sheet.href.includes('franchise.css')
  );
  diagnostics.cssLoaded = !!franchiseCSS;
  console.log('✅ Franchise CSS loaded:', diagnostics.cssLoaded);
  
  // Check if JavaScript is loaded
  diagnostics.jsLoaded = typeof window.FranchiseAIAssistant !== 'undefined' || 
                        document.querySelector('#aiAssistant') !== null;
  console.log('✅ Franchise JS loaded:', diagnostics.jsLoaded);
  
  // Check background override
  const body = document.body;
  const computedStyle = window.getComputedStyle(body);
  const backgroundColor = computedStyle.backgroundColor;
  diagnostics.backgroundOverride = backgroundColor.includes('60, 36, 21') || 
                                  backgroundColor.includes('#3C2415') ||
                                  body.classList.contains('franchise-body');
  console.log('✅ Background override applied:', diagnostics.backgroundOverride);
  console.log('   Body background color:', backgroundColor);
  console.log('   Body classes:', Array.from(body.classList).join(', '));
  
  // Check if all sections are present
  const requiredSections = [
    '.franchise-hero',
    '.franchise-benefits', 
    '.franchise-business-model',
    '.franchise-support',
    '.franchise-qualification',
    '.franchise-form-section'
  ];
  
  const missingSections = requiredSections.filter(selector => 
    !document.querySelector(selector)
  );
  diagnostics.sectionsPresent = missingSections.length === 0;
  console.log('✅ All sections present:', diagnostics.sectionsPresent);
  if (missingSections.length > 0) {
    console.warn('❌ Missing sections:', missingSections);
  }
  
  // Check form functionality
  const form = document.getElementById('franchiseEnquiryForm');
  diagnostics.formFunctional = !!form && form.addEventListener !== undefined;
  console.log('✅ Form functional:', diagnostics.formFunctional);
  
  // Check responsive layout
  const benefitsGrid = document.querySelector('.franchise-benefits-grid');
  if (benefitsGrid) {
    const gridStyle = window.getComputedStyle(benefitsGrid);
    diagnostics.responsiveLayout = gridStyle.display === 'grid';
    console.log('✅ Responsive layout active:', diagnostics.responsiveLayout);
  }
  
  // Overall health check
  const healthScore = Object.values(diagnostics).filter(Boolean).length;
  const totalChecks = Object.keys(diagnostics).length;
  
  console.log(`\n🏥 FRANCHISE PAGE HEALTH: ${healthScore}/${totalChecks} checks passed`);
  
  if (healthScore === totalChecks) {
    console.log('🎉 All systems operational! Franchise page is working correctly.');
  } else {
    console.warn('⚠️ Some issues detected. Check the diagnostics above.');
  }
  
  // Visual indicator in the page
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: ${healthScore === totalChecks ? '#28a745' : '#ffc107'};
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    z-index: 10000;
    font-family: monospace;
  `;
  indicator.textContent = `Health: ${healthScore}/${totalChecks}`;
  document.body.appendChild(indicator);
  
  // Remove indicator after 5 seconds
  setTimeout(() => {
    if (indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  }, 5000);
  
  // Store diagnostics globally for debugging
  window.franchiseDiagnostics = diagnostics;
});