import { Context, Next } from 'koa';
import Router from 'koa-router';

// Map to store path -> allowed methods
const routeMethodsMap = new Map<string, string>();

// Function to build the route methods map
export function buildRouteMethodsMap(router: Router) {
  // Extract and group routes by path
  const routeGroups = router.stack.reduce(
    (acc, layer) => {
      const path = layer.path;
      const methods = layer.methods.filter((m: string) => m !== 'OPTIONS' && m !== 'HEAD');

      if (!acc[path]) {
        acc[path] = new Set<string>();
      }
      methods.forEach((method) => acc[path].add(method));

      return acc;
    },
    {} as Record<string, Set<string>>
  );

  // Convert grouped methods to map entries
  Object.entries(routeGroups).forEach(([path, methodsSet]) => {
    routeMethodsMap.set(path, Array.from(methodsSet).join(', '));
  });

  return routeMethodsMap;
}

// Optimized middleware
export const optionsHandler = async (ctx: Context, next: Next) => {
  // Skip non-OPTIONS requests
  if (ctx.method !== 'OPTIONS') {
    return await next();
  }

  // Look up pre-computed methods for this path
  const allowedMethods = routeMethodsMap.get(ctx.path) ?? '';

  if (allowedMethods) {
    ctx.set('Allow', allowedMethods);
    ctx.set('Access-Control-Allow-Methods', allowedMethods);
    ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    ctx.status = 204;
  } else {
    // No methods found for this path, pass to next middleware
    await next();
  }
};
