---
name: CommonJS imports in the ESM API server
description: Runtime import compatibility for CommonJS packages externalized into the API server's ESM bundle.
---

When a CommonJS dependency remains external in the API server's ESM bundle, use its default import for runtime functions rather than namespace or named imports unless the package explicitly supports named ESM exports.

**Why:** TypeScript checks passed while Mongoose and jsonwebtoken imports failed at runtime under Node's ESM interop.

**How to apply:** After adding or changing a server dependency, start the built API and exercise a route that calls the package; typechecking alone does not verify CommonJS interop.
