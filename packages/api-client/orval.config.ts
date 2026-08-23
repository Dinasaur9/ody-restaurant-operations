import { defineConfig } from "orval";

export default defineConfig({
  odyRestaurantApi: {
    input: "./openapi.json",
    output: {
      target: "./src/generated/api.ts",
      schemas: "./src/generated/models",
      client: "react-query",
      httpClient: "axios",
      mode: "split",
      clean: true,
      prettier: false,
      override: {
        mutator: {
          path: "./src/http.ts",
          name: "apiRequest",
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
  },
});
