# Contributing to LexiNote

First off, thank you for considering contributing to LexiNote! It's people like you that make LexiNote such a great tool for learners.

## Development Setup

1. Fork the repo and create your branch from `main`.
2. Follow the root [`README.md`](README.md) to configure the backend, client, and dashboard.
3. Ensure PostgreSQL is available and the backend `.env` contains a valid `DATABASE_URL` and `JWT_SECRET`.
4. Ensure you have ESLint and Prettier installed in your editor.

The backend Swagger UI is available at `http://localhost:1337/api/docs` while the API is running. The Postman collection in [`docs/postman/`](docs/postman/) can be used for authenticated API checks.

## Code Style

- Use Prettier for code formatting.
- Try your best to adhere to the ESLint rules already defined in the project.
- Keep client and dashboard API base URLs in their respective `.env` files; do not hard-code deployment URLs in source files.

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
Examples:
- `feat: add awesome new feature`
- `fix: resolve crash on login`
- `docs: update readme API details`
- `chore: update dependencies`

## Submitting a PR

- Push your branch to your fork.
- Open a PR against the `main` branch.
- Fill out the provided PR template.
- Run the relevant lint and test commands for every affected application before opening the PR.
- If tests or linting fail in CI, resolve them before merge.
