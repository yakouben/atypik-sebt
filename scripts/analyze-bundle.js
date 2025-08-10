const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing Bundle Size...\n');

// Analyze bundle size
function analyzeBundle() {
  console.log('📊 Running Bundle Analysis...');
  
  try {
    // Check for bundle analysis output
    const buildDir = './.next';
    if (fs.existsSync(buildDir)) {
      const files = fs.readdirSync(buildDir);
      const jsFiles = files.filter(file => file.endsWith('.js'));
      
      console.log('\n📁 Bundle Files:');
      jsFiles.forEach(file => {
        const filePath = path.join(buildDir, file);
        const stats = fs.statSync(filePath);
        const sizeInKB = Math.round(stats.size / 1024);
        console.log(`- ${file}: ${sizeInKB}KB`);
      });
      
      // Check for large files
      const largeFiles = jsFiles.filter(file => {
        const filePath = path.join(buildDir, file);
        const stats = fs.statSync(filePath);
        return stats.size > 500 * 1024; // Files larger than 500KB
      });
      
      if (largeFiles.length > 0) {
        console.log('\n⚠️ Large Bundle Files Detected:');
        largeFiles.forEach(file => {
          const filePath = path.join(buildDir, file);
          const stats = fs.statSync(filePath);
          const sizeInKB = Math.round(stats.size / 1024);
          console.log(`- ${file}: ${sizeInKB}KB (Consider code splitting)`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
  }
}

// Check for optimization opportunities
function checkOptimizations() {
  console.log('\n🔧 Checking Optimization Opportunities...');
  
  const optimizations = [
    {
      name: 'Dynamic Imports',
      check: () => {
        try {
          const files = fs.readdirSync('./components');
          const hasDynamicImports = files.some(file => {
            const content = fs.readFileSync(`./components/${file}`, 'utf8');
            return content.includes('dynamic(') || content.includes('import(');
          });
          return hasDynamicImports;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Image Optimization',
      check: () => {
        try {
          const files = fs.readdirSync('./components');
          const hasOptimizedImages = files.some(file => {
            const content = fs.readFileSync(`./components/${file}`, 'utf8');
            return content.includes('next/image') || content.includes('OptimizedImage');
          });
          return hasOptimizedImages;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Code Splitting',
      check: () => {
        try {
          const nextConfig = fs.readFileSync('./next.config.js', 'utf8');
          return nextConfig.includes('splitChunks') || nextConfig.includes('optimization');
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Tree Shaking',
      check: () => {
        try {
          const nextConfig = fs.readFileSync('./next.config.js', 'utf8');
          return nextConfig.includes('optimizePackageImports') || nextConfig.includes('treeShaking');
        } catch (error) {
          return false;
        }
      }
    }
  ];
  
  optimizations.forEach(opt => {
    const isImplemented = opt.check();
    const status = isImplemented ? '✅' : '❌';
    console.log(`${status} ${opt.name}: ${isImplemented ? 'Implemented' : 'Not implemented'}`);
  });
}

// Generate optimization recommendations
function generateRecommendations() {
  console.log('\n📋 Optimization Recommendations:');
  console.log('================================');
  
  const recommendations = [
    '1. Implement code splitting for large components',
    '2. Use dynamic imports for non-critical features',
    '3. Optimize images with WebP/AVIF formats',
    '4. Implement lazy loading for images',
    '5. Add service worker for caching',
    '6. Optimize critical rendering path',
    '7. Defer non-critical JavaScript',
    '8. Minimize render-blocking resources',
    '9. Use CDN for static assets',
    '10. Implement proper cache headers'
  ];
  
  recommendations.forEach(rec => {
    console.log(`- ${rec}`);
  });
}

// Main execution
function main() {
  console.log('🚀 Starting Bundle Analysis...\n');
  
  analyzeBundle();
  checkOptimizations();
  generateRecommendations();
  
  console.log('\n🎉 Bundle analysis completed!');
  console.log('\n📁 Next steps:');
  console.log('1. Review large bundle files');
  console.log('2. Implement recommended optimizations');
  console.log('3. Run performance tests again');
  console.log('4. Monitor Core Web Vitals');
}

main(); 