const fs = require('fs');

try {
  const report = JSON.parse(fs.readFileSync('./lighthouse-report.json', 'utf8'));
  
  console.log('🚀 Lighthouse Performance & SEO Test Results\n');
  
  // Extract scores from categories
  const categories = report.categories;
  
  if (categories) {
    console.log('📊 Overall Scores:');
    console.log('==================');
    
    if (categories.performance) {
      const performanceScore = Math.round(categories.performance.score * 100);
      console.log(`Performance: ${performanceScore}/100`);
    }
    
    if (categories.accessibility) {
      const accessibilityScore = Math.round(categories.accessibility.score * 100);
      console.log(`Accessibility: ${accessibilityScore}/100`);
    }
    
    if (categories['best-practices']) {
      const bestPracticesScore = Math.round(categories['best-practices'].score * 100);
      console.log(`Best Practices: ${bestPracticesScore}/100`);
    }
    
    if (categories.seo) {
      const seoScore = Math.round(categories.seo.score * 100);
      console.log(`SEO: ${seoScore}/100`);
    }
  }
  
  // Extract Core Web Vitals
  console.log('\n🎯 Core Web Vitals:');
  console.log('==================');
  
  const audits = report.audits;
  
  if (audits['largest-contentful-paint']) {
    console.log(`LCP: ${audits['largest-contentful-paint'].displayValue || 'N/A'}`);
  }
  
  if (audits['max-potential-fid']) {
    console.log(`FID: ${audits['max-potential-fid'].displayValue || 'N/A'}`);
  }
  
  if (audits['cumulative-layout-shift']) {
    console.log(`CLS: ${audits['cumulative-layout-shift'].displayValue || 'N/A'}`);
  }
  
  if (audits['first-contentful-paint']) {
    console.log(`FCP: ${audits['first-contentful-paint'].displayValue || 'N/A'}`);
  }
  
  // Calculate overall score
  if (categories) {
    const scores = [];
    if (categories.performance) scores.push(categories.performance.score);
    if (categories.accessibility) scores.push(categories.accessibility.score);
    if (categories['best-practices']) scores.push(categories['best-practices'].score);
    if (categories.seo) scores.push(categories.seo.score);
    
    const overallScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
    
    console.log('\n📈 Overall Performance Score:');
    console.log('=============================');
    console.log(`${overallScore}/100`);
    
    if (overallScore >= 90) {
      console.log('🌟 Excellent performance!');
    } else if (overallScore >= 70) {
      console.log('👍 Good performance, some room for improvement');
    } else {
      console.log('⚠️ Performance needs improvement');
    }
  }
  
  console.log('\n📁 Detailed reports:');
  console.log('- lighthouse-report.json (JSON format)');
  console.log('- lighthouse-report.html (Interactive HTML)');
  
} catch (error) {
  console.error('Error reading Lighthouse report:', error.message);
} 