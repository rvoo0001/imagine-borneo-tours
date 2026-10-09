import { defineConfig } from "orval";

export default defineConfig({
  imagineBorneo: {
    input: {
      target: "http://127.0.0.1:8000/openapi.json",
    },
    output: {
      mode: "split",
      client: "axios",
      target: "./src/api/generated.ts",
      schemas: "./src/api/model",
      clean: true,
      prettier: true,
    },
  },
});