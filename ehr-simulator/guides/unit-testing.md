# Writing a Unit Test

A unit test checks that one piece of logic does what you expect, in isolation. You mock everything it depends on and only assert on what it actually does.

## The basic structure

```ts
describe('what you are testing', () => {
  it('does something specific', async () => {
    // arrange
    // act
    // assert
  })
})
```

Arrange: set up your mocks and inputs.
Act: call the function.
Assert: check the result.

## Mocking dependencies

If the function you're testing calls other functions, mock them so they don't run for real.

```ts
vi.mock('@/lib/someModule')
```

Then in the test, tell the mock what to return:

```ts
(someFunction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true })
```

Call `vi.clearAllMocks()` in `beforeEach` so mocks don't bleed between tests.

## Checking what was called

```ts
expect(someFunction).toHaveBeenCalledWith(arg1, arg2)
```

This checks the function was called with exactly those arguments. Use this when the return value isn't what matters — what matters is that the right thing was triggered.

## Checking return values

```ts
const result = await doSomething({ ... })
expect(result).toMatchObject({ success: true })
```

`toMatchObject` lets you check a subset of the result without needing every field to match exactly.

## Checking that errors are thrown

```ts
await expect(
  doSomething({ id: null })
).rejects.toThrow('ID is required')
```

## Testing multiple similar cases

Use `it.each` instead of copy-pasting the same test:

```ts
it.each(['typeA', 'typeB', 'typeC'])(
  'throws when id is missing for %s',
  async (type) => {
    await expect(
      doSomething({ type, id: null })
    ).rejects.toThrow('ID is required')
  }
)
```

## What to test

Test the branching logic — the `if` statements, `switch` cases, and guard clauses. Don't test that a mock returns what you told it to return. Don't test implementation details that could change without the behavior changing.

Good things to test:
- Each branch of a switch/if gets the right function called
- Guard clauses throw or return early when they should
- The correct arguments are passed through
- Fallback/default behavior works

Not worth testing:
- That `vi.fn()` returns what you mocked
- Internal variable names or implementation shape
- Things already tested by the libraries you're using

## Running tests

```bash
npm test                    # run all tests
npm test myFile             # run by filename match
npm test -- --watch         # rerun on file changes
npm test -- --coverage      # show coverage report
```