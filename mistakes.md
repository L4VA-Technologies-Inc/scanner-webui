# Mistakes Log

## Chakra UI v3 Incompatibility with Vite

- **Mistake:** Using Chakra UI v3 (`^3.15.0`) with Vite (`^6.2.0`) caused runtime errors (`Uncaught SyntaxError: The requested module '/node_modules/.vite/deps/@chakra-ui_react.js' does not provide an export named '...'`). This occurred for multiple components (`FormControl`, `Divider`).
- **Investigation:** Tried aliasing imports, clearing Vite cache (`rm -rf node_modules`), explicitly including `@chakra-ui/react` in `vite.config.ts optimizeDeps`, and simplifying component imports. None resolved the issue.
- **Correction:** Downgraded Chakra UI and related dependencies (`@emotion/react`, `@emotion/styled`, `framer-motion`) to their latest stable v2 versions (`@chakra-ui/react: ^2.8.2`, `@emotion/react: ^11.11.4`, `@emotion/styled: ^11.11.5`, `framer-motion: ^11.0.0`). Reverted debugging changes and restarted the dev server.
- **Outcome:** The application now runs correctly with Chakra UI v2.

## Missing Chakra UI Styles (v2)

- **Mistake:** After downgrading to Chakra UI v2, components rendered without default styles.
- **Investigation:** Checked `src/main.tsx` and found `<ChakraProvider theme={{}}>`.
- **Correction:** Removed the `theme={{}}` prop from `ChakraProvider` in `src/main.tsx` to allow it to use the default theme.
- **Outcome:** Default Chakra UI styles are now applied correctly.
