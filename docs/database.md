# Database operations

## Local development

```sh
cp .env.example .env
pnpm db:up
pnpm db:deploy
pnpm db:seed
```

`pnpm db:down` stops PostgreSQL without deleting its named volume.

## Schema changes

Change `prisma/schema.prisma`, then create and review a versioned migration.

```sh
pnpm db:migrate -- --name describe_the_change
```

Commit the generated SQL in `prisma/migrations`. Do not use `prisma db push` for shared development.

## Integration tests

The Compose environment creates a separate `medical_supply_manager_test` database.

```sh
pnpm db:up
pnpm db:test:prepare
pnpm test:integration
```

## Production

Production uses a managed PostgreSQL service. Apply committed migrations with `pnpm db:deploy` before starting the application. Development credentials in `compose.yaml` must not be reused outside local development.
