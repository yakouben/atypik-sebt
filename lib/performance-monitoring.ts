// Performance monitoring wrapper
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = fn(...args);
    
    if (result instanceof Promise) {
      return result.then(res => {
        const end = performance.now();
        if (end - start > 100) { // Only log slow operations
          console.warn(`Slow operation: ${name} took ${Math.round(end - start)}ms`);
        }
        return res;
      });
    } else {
      const end = performance.now();
      if (end - start > 50) { // Only log slow operations
        console.warn(`Slow operation: ${name} took ${Math.round(end - start)}ms`);
      }
      return result;
    }
  }) as T;
}