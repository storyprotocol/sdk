# Contributing

## Code of Conduct

Please make sure to read and observe our [Code of Conduct](/CODE_OF_CONDUCT.md).

## Engineering Guideline

[Typescript coding guidelines][3]

[Good commit messages][2]

## Open Development

### How To Build and Test Story Protocol SDK for local testing

This section provides the instructions on how to build Story Protocol SDK from source code.

#### Prerequisite

- Install PNPM: Execute `npm install -g pnpm`
- Install TypeScript: Run `pnpm add typescript -D`
- Install Yalc: Use `npm install -g yalc`
- Install dependencies: `pnpm install`
- Install pre-commit (to enable git hooks):
  - Option A (Homebrew): `brew install pre-commit`
  - Option B (pipx): `brew install pipx && pipx ensurepath && pipx install pre-commit`
- Enable git hooks: `pre-commit install`
  - Verify: confirm `./.git/hooks/pre-commit` exists, or run `pre-commit --version`

#### Steps for Using Yalc for Local Testing of Core-SDK

For manual testing of the core-sdk, set up a separate web project. The guide below uses `yalc` to link the `core-sdk` locally, enabling its installation and import for testing.

Under the `typescript-sdk/packages/core-sdk` directory:

- Navigate to the `core-sdk` directory.
- Execute `npm run build` to build your latest code.
- Run `yalc publish`. You should see a message like `@story-protocol/core-sdk@<version> published in store.` (Note: The version number may vary).

To set up your testing environment (e.g., a new Next.js project), use `yalc add @story-protocol/core-sdk@<version>` (ensure the version number is updated accordingly).

- Run `pnpm install`. This installs `@story-protocol/core-sdk@<version>` with your local changes.

#### Steps to Refresh the Changes

Under the `typescript-sdk/packages/core-sdk` directory:

- Execute `npm run build` to build your latest code.
- Run `yalc push`.

In your testing environment:

- Run `yalc update` to pull the latest changes.

### How to update the latest Protocol Core & Periphery Smart Contract methods

1. Install the dependencies: `cd packages/wagmi-generator && pnpm install`
2. Update the `wagmi.config.ts` file with the latest contract addresses and chain IDs.
3. Run the generator: `cd packages/wagmi-generator && pnpm run generate`

It will generate the latest contract methods and events in the `packages/core-sdk/src/abi/generated` directory.

## Bug Reports

- Ensure your issue [has not already been reported][1]. It may already be fixed!
- Include the steps you carried out to produce the problem.
- Include the behavior you observed along with the behavior you expected, and
  why you expected it.
- Include any relevant stack traces or debugging output.

## Feature Requests

We welcome feedback with or without pull requests. If you have an idea for how
to improve the project, great! All we ask is that you take the time to write a
clear and concise explanation of what need you are trying to solve. If you have
thoughts on _how_ it can be solved, include those too!

The best way to see a feature added, however, is to submit a pull request.

## Pull Requests

- Before creating your pull request, it's usually worth asking if the code
  you're planning on writing will actually be considered for merging. You can
  do this by [opening an issue][1] and asking. It may also help give the
  maintainers context for when the time comes to review your code.

- Ensure your [commit messages are well-written][2]. This can double as your
  pull request message, so it pays to take the time to write a clear message.

- Add tests for your feature. You should be able to look at other tests for
  examples. If you're unsure, don't hesitate to [open an issue][1] and ask!

- Submit your pull request!
  - Fork the repository on GitHub.
  - Make your changes on your fork repository.
  - Submit a PR.

## Find something to work on

To help you get started contributing, we maintain a list of `good first issues` that contain bugs and features with relatively limited scope. These issues are specifically curated to help new contributors understand our codebase and development process.

We welcome contributions of all kinds, including:

- Documentation improvements and fixes
- Bug reports and fixes
- New features and enhancements
- Code refactoring and test coverage
- Best practices and code quality improvements

Feel free to browse our issues list and find something that interests you. If you're unsure where to start, look for issues tagged with `good first issue` or `help wanted`.

If you have questions about the development process,
feel free to [file an issue](https://github.com/storyprotocol/sdk/issues/new).

## Code Review

To make it easier for your PR to receive reviews, consider the reviewers will need you to:

- follow [good coding guidelines][3].
- write [good commit messages][2].
- break large changes into a logical series of smaller patches which individually make easily understandable changes, and in aggregate solve a broader issue.

[1]: https://github.com/storyprotocol/sdk/issues
[2]: https://chris.beams.io/posts/git-commit/#seven-rules
[3]: https://google.github.io/styleguide/tsguide.html
