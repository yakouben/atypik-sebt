const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Performance & SEO Testing...\n');

// Check if the development server is running
function checkServer() {
  try {
    const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', { encoding: 'utf8' });
    return response.trim() === '200';
  } catch (error) {
    return false;
  }
}

// Run Lighthouse performance test
function runLighthouse() {
  console.log('📊 Running Lighthouse Performance Test...');
  try {
    execSync('lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless"', { stdio: 'inherit' });
    console.log('✅ Lighthouse test completed successfully!');
    
    // Read and parse the report
    if (fs.existsSync('./lighthouse-report.json')) {
      const report = JSON.parse(fs.readFileSync('./lighthouse-report.json', 'utf8'));
      const scores = report.lhr.categories;
      
      console.log('\n📈 Performance Scores:');
      console.log(`Performance: ${Math.round(scores.performance.score * 100)}/100`);
      console.log(`Accessibility: ${Math.round(scores.accessibility.score * 100)}/100`);
      console.log(`Best Practices: ${Math.round(scores['best-practices'].score * 100)}/100`);
      console.log(`SEO: ${Math.round(scores.seo.score * 100)}/100`);
      
      // Check Core Web Vitals
      const audits = report.lhr.audits;
      console.log('\n🎯 Core Web Vitals:');
      console.log(`LCP: ${audits['largest-contentful-paint']?.displayValue || 'N/A'}`);
      console.log(`FID: ${audits['max-potential-fid']?.displayValue || 'N/A'}`);
      console.log(`CLS: ${audits['cumulative-layout-shift']?.displayValue || 'N/A'}`);
      console.log(`FCP: ${audits['first-contentful-paint']?.displayValue || 'N/A'}`);
      
      return scores;
    }
  } catch (error) {
    console.error('❌ Lighthouse test failed:', error.message);
  }
}

// Check SEO elements
function checkSEO() {
  console.log('\n🔍 Checking SEO Elements...');
  
  const seoChecks = [
    { name: 'Meta Title', selector: 'title', required: true },
    { name: 'Meta Description', selector: 'meta[name="description"]', required: true },
    { name: 'Open Graph Tags', selector: 'meta[property^="og:"]', required: true },
    { name: 'Twitter Cards', selector: 'meta[name^="twitter:"]', required: false },
    { name: 'Canonical URL', selector: 'link[rel="canonical"]', required: true },
    { name: 'Robots Meta', selector: 'meta[name="robots"]', required: false },
    { name: 'Structured Data', selector: 'script[type="application/ld+json"]', required: true },
  ];
  
  try {
    const html = execSync('curl -s http://localhost:3000', { encoding: 'utf8' });
    
    seoChecks.forEach(check => {
      const regex = new RegExp(check.selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const found = regex.test(html);
      const status = found ? '✅' : (check.required ? '❌' : '⚠️');
      console.log(`${status} ${check.name}: ${found ? 'Found' : 'Missing'}`);
    });
    
  } catch (error) {
    console.error('❌ SEO check failed:', error.message);
  }
}

// Check performance metrics
function checkPerformance() {
  console.log('\n⚡ Checking Performance Metrics...');
  
  try {
    const html = execSync('curl -s http://localhost:3000', { encoding: 'utf8' });
    
    // Check for optimized images
    const imageCount = (html.match(/<img/g) || []).length;
    const optimizedImageCount = (html.match(/next\/image/g) || []).length;
    console.log(`📸 Images: ${imageCount} total, ${optimizedImageCount} optimized`);
    
    // Check for preloaded resources
    const preloadCount = (html.match(/rel="preload"/g) || []).length;
    console.log(`🚀 Preloaded resources: ${preloadCount}`);
    
    // Check for external resources
    const externalScripts = (html.match(/<script[^>]*src="https?:\/\//g) || []).length;
    const externalStyles = (html.match(/<link[^>]*href="https?:\/\//g) || []).length;
    console.log(`🌐 External scripts: ${externalScripts}, External styles: ${externalStyles}`);
    
  } catch (error) {
    console.error('❌ Performance check failed:', error.message);
  }
}

// Generate HTML report
function generateHTMLReport() {
  console.log('\n📄 Generating HTML Report...');
  try {
    execSync('lighthouse http://localhost:3000 --output=html --output-path=./lighthouse-report.html --chrome-flags="--headless"', { stdio: 'inherit' });
    console.log('✅ HTML report generated: lighthouse-report.html');
  } catch (error) {
    console.error('❌ HTML report generation failed:', error.message);
  }
}

// Main execution
function main() {
  if (!checkServer()) {
    console.log('❌ Development server is not running on http://localhost:3000');
    console.log('Please start the server with: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Development server is running\n');
  
  // Run all tests
  const scores = runLighthouse();
  checkSEO();
  checkPerformance();
  generateHTMLReport();
  
  console.log('\n🎉 Testing completed!');
  console.log('\n📁 Generated files:');
  console.log('- lighthouse-report.json (Detailed JSON report)');
  console.log('- lighthouse-report.html (Interactive HTML report)');
  
  // Summary
  if (scores) {
    const avgScore = Math.round(
      (scores.performance.score + scores.accessibility.score + scores['best-practices'].score + scores.seo.score) * 25
    );
    console.log(`\n📊 Overall Score: ${avgScore}/100`);
    
    if (avgScore >= 90) {
      console.log('🌟 Excellent performance!');
    } else if (avgScore >= 70) {
      console.log('👍 Good performance, some room for improvement');
    } else {
      console.log('⚠️ Performance needs improvement');
    }
  }
}

main(); 