# Spec 03: Development Guidelines

## Goal

Define the minimum development and review rules for this project. These rules are based on issues encountered while implementing the Students feature and are intended to prevent recurring TypeScript, ESLint, React, and browser-test problems.

## Validation Before Commit

Run the following commands from the project root:

```bash
npm run lint
npm run build
npm test
```

The change is ready to commit only when:

- ESLint reports no errors.
- TypeScript compilation and the Vite production build succeed.
- Tests pass, or any unrelated existing failure is documented in the change description.
- `git diff --check` reports no whitespace errors.

When the editor still shows diagnostics after the commands pass, restart the TypeScript language service before changing source code.

## ESLint Rules

### Remove unused imports and variables

Strict TypeScript and ESLint settings treat unused imports, parameters, and local variables as errors. Remove code that is no longer used after refactoring instead of suppressing the rule.

```tsx
// Avoid leaving unused imports after removing a handler.
import { unusedHelper } from '@/lib/utils'
```

### Avoid `any`

Do not use `as any` to bypass a type mismatch. Reuse an existing project type, define a narrow adapter type, or correct the API boundary. For example, table navigation should use the existing `NavigateFn` type from `use-table-url-state`.

### Keep render functions pure

Do not call impure functions such as `Date.now()` or `Math.random()` while building JSX or render-time default values. A render may run more than once.

For generated IDs:

- Prefer IDs from the backend or provider.
- Generate a temporary ID in an event handler such as form submission when a demo requires one.
- Do not rely on `Date.now()` or `Math.random()` as a persistent identity strategy.

### Handle known library compatibility warnings locally

TanStack Table's `useReactTable()` may trigger the React Compiler `react-hooks/incompatible-library` warning because it returns functions that cannot be safely memoized by the compiler.

If the warning is intentional and verified, suppress it only around the affected file or statement with a short reason. Do not disable all React Hooks rules globally, and do not hide unrelated warnings.

## Routing and Generated Types

TanStack Router route types are generated from the file-based route tree. Once a route is registered and the generated types recognize it:

- Remove obsolete `@ts-expect-error` directives.
- Treat an `Unused '@ts-expect-error' directive` error as a signal that the workaround is no longer needed.
- Use the route's typed `useNavigate()` result instead of casting it to `any`.

If VS Code reports `TS2307: Cannot find module` even though the file exists and `npm run build` succeeds:

1. Confirm the file name and relative import casing.
2. Run the build to verify the compiler sees the file.
3. Restart the TypeScript language service.
4. Re-check diagnostics before editing import paths.

## Browser Component Tests

Use only locator methods supported by the installed `vitest-browser-react` version. TypeScript errors such as the following indicate that a DOM-testing API is not available on the browser test result or locator type:

- `getByDisplayValue` does not exist on `RenderResult`.
- `getByPlaceholderText` does not exist on `RenderResult`.
- `getAttribute` does not exist on `Locator`.

When an API is unavailable, use a supported role, text, or locator query and keep the assertion behavioral. Do not replace an interaction test with a weak existence check merely to make TypeScript pass.

Required dialog coverage should include:

- Validation appears when submitting invalid input.
- Confirmation controls remain disabled until the required value is entered.
- Valid submission calls the expected callback and closes the dialog.
- Delete actions call the expected callback with the correct data.

If the browser test API cannot express an assertion, document the limitation and add a follow-up test using a supported API rather than silently reducing coverage.

## Test Mocking

Mocks must be valid values for the mocked API. Do not call promise methods on a Vitest mock function, for example:

```tsx
// Incorrect: vi.fn() is a mock function, not a Promise.
vi.fn().then(...)
```

Use `vi.fn()` for callbacks and explicitly return a promise only when the production code expects one:

```tsx
const mockRequest = vi.fn().mockResolvedValue(undefined)
```

Remove unused mocked modules and imports after a test is simplified.

## Review Checklist

- [ ] The implementation follows existing feature and route patterns.
- [ ] No unused imports, `any` casts, or stale `@ts-expect-error` directives remain.
- [ ] No impure function is called during render.
- [ ] Any library-specific lint suppression is narrow and justified.
- [ ] Tests verify behavior, not only that elements exist.
- [ ] Test mocks match the real API shape.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] `npm test` passes or known failures are documented.
