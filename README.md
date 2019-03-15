# Koa/GraphQL/Typescript Boilerplate

This boilerplate if an effort to have a minimal boilerplate to begin with that lets you work with Koa, GraphQL and Typescript and hit the ground running. This boilerplate doesn't implement a full backend application, but rather gives you what I consider a good bare-bones baseline to get started.

## Included functionality

- Koa app with middleware
  - Body parser
  - Global exception handler
  - Async local storage for having global unique ID for each request
  - JWT authentication
  - Serving static files
  - Request logging with Morgan
- GraphQL Apollo Server
  - Role based authentication for queries/mutations/fields
- User system
  - Login and authentication with JWT
  - Password reset
  - User access roles
  - User config values
- Emailing templates with MJML
- Logging
- Docker integration
- Testing with Jest
- User notifications

## NPM scripts

start - Run the application
pm2:start - Run the app in daemon mode with pm2
dev - Run nodemon to monitor files during development
debug - Run the app in debug mode. If run in VS Code integrated terminal it can auto attached if configured.
test - Run Jest tests
test:watch - Run Jest in watch mode
docker:build - Build the docker image
docker:up - Start up the docker service
docker:down - Stop the docker service
docker:pm2 - Runs the app with pm2 (used inside docker container)
docker:shell - Gets a shell into the running container (only works if one container is running)

## Core Libraries

- [Koa](https://github.com/koajs/koa)
- [TypeGraphQL](https://github.com/19majkel94/type-graphql)
- [TypeORM](https://github.com/typeorm/typeorm)
- [Winston](https://github.com/winstonjs/winston)
- [Apollo Server](https://github.com/apollographql/apollo-server)

### Koa

Koa handles the actual server listening on the configured port as well as setting up the middleware. The main benefit of Koa is the nature of its async/await adoption with its middleware pattern.

### TypeGraphQL

This awesome library lets us have one source of truth for the database models and GraphQL schema. With its decorators in combination with TypeORM's decorators we can have one class to define both things.

### TypeORM

Our database ORM. Plays nicely with Typescript and has a large range of databases it is compatible with.

### Winston

Great logging library.

### Apollo Server

Awesome GraphQL server which has a Koa implementation to use here.

## Directory structure

- logs
  - All log files for the app
- public
  - Any static files that need to be served directly (SPA files).
- scripts
  - Any scripts that are used to support the app. Includes CLI files.
- src
  - common
    - Any files/classes that are needed in multiple places in the app that don't fit into a particular module.
  - logging
    - Logger classes
  - modules
    - Core code resides here. Each main "resource" of the application is split into a module. Each module can consist of the following:
      - Resolver: GraphQL resolver
      - Entity: Database model/GraphQL schema
      - Service: Main business logic for the resource
      - Controller: REST API endpoints if needed for resource
      - Spec: Unit testing for module
  - security
    - Classes/modules needed for app security
  - testing
    - Contains E2E tests, test setup/config, and text fixtures
  - app.ts
    - Main application definition. Separated from run script to be imported easily in tests
  - bootstrap-db.ts
    - Sets up database connection and mock data for tests
  - main.ts
    - Main run script for application

## Environment Variables

We use dotenv to handle environment variables for things like database credentials and the secret app key. A `.env.example` file is provided as a blueprint for values to input.

## CLI

I didn't like working with existing libraries to implement the simple CLI that I had in mind. Rather than learning how to use those libraries, I figured it'd be more fun to implement my own. The `scripts/cli` folder contains the main brains of everything along with the `scripts/cli.ts` file.

`cmdDefs.ts` defines the structure of commands that are available to be executed. Take a look at that file and the interfaces to see what you can specify.
