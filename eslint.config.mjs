import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "node_modules/**", "out/**"],
  },
  {
    // R3F scenes drive three.js imperatively: uniforms and buffer attributes
    // are memoized once and mutated inside useFrame callbacks. That is the
    // idiomatic (and performant) pattern — the compiler-oriented immutability
    // rule cannot model it. React Compiler is not enabled for this project.
    files: ["src/scenes/**"],
    rules: {
      "react-hooks/immutability": "off",
    },
  },
];

export default eslintConfig;
