import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Unused values are a real signal in this codebase - the audit found
      // several dead imports - so they fail the build rather than warn.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    // Tests deliberately poke at malformed values and untyped schema output.
    files: ["tests/**/*.{ts,tsx}"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
];

export default eslintConfig;
