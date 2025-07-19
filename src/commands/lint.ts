import { runLint } from "../lint/index.ts";

runLint().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(2);
});
