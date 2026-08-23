# @ody/api-client

This package is generated from `openapi.json` with Orval. Dashboard code must
import backend models and React Query hooks from this package rather than
declaring request or response DTOs by hand.

Regenerate after an API contract change:

```bash
pnpm gen:contract
```

Files under `src/generated` are generated artifacts and must not be edited
manually. The only handwritten transport code is `src/http.ts`.
