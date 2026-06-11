import 'reflect-metadata';

// ─────────────────────────────────────────────
// METHOD DECORATOR
// Wraps a method to log its name, arguments, 
// return value, and execution time automatically
// ─────────────────────────────────────────────

export function LogMethod(
  _target: object,                    // prototype of the class
  propertyKey: string,               // name of the method
  descriptor: PropertyDescriptor     // contains the original method
): PropertyDescriptor {

  const originalMethod = descriptor.value; // save original method

  descriptor.value = function (...args: unknown[]) {
    console.log(`[LOG] Calling ${propertyKey} with args:`, args);

    const start = Date.now();
    const result: unknown = originalMethod.apply(this, args); // call original
    const duration = Date.now() - start;

    console.log(`[LOG] ${propertyKey} returned:`, result);
    console.log(`[LOG] ${propertyKey} took ${duration}ms`);

    return result;
  };

  return descriptor;
}