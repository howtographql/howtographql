---
title: Project Setup
pageTitle: 'Creating a basic NodeJS & TypeScript project'
description:
  'Learn how to setup a basic NodeJS & TypeScript project'
question: 'What is `@types/node` package used for?'
answers: ['To add NodeJS', 'To add TypeScript Language compiler', 'To run TypeScript files directly', 'To add TypeScript types for NodeJS environment']
correctAnswer: 3
---

In this section, you will learn how to create a basic NodeJS project with TypeScript. 

This step will cover the initial NodeJS setup required, basic configuration for TypeScript projects, and how to setup the development scripts. 

### Requirements

- Have NodeJS installed on your operation system ([instructions](https://nodejs.org/en/download/package-manager/)). You can use any recent version (12/14/16).
- Your favorite terminal configured (you are going to use it a lot!)
- Run `node -v`, `npm -v`, `npx -v` in your terminal and make sure these commands are available for use.

### Creating Node.js & TypeScript project

This tutorial teaches you how to build a NodeJS project from scratch, so the first thing you need to do is create the
directory that'll hold the files for your project:

<Instruction>

Open your terminal, navigate to a location of your choice, and run the following commands:

```bash
mkdir hackernews-node-ts
cd hackernews-node-ts
npm init -y
```

</Instruction>

This creates a new directory called `hackernews-node-ts` and initializes it with a `package.json` file. 

The `package.json` is the configuration file for the Node.js app you're building. It lists all dependencies and other configuration options (such as _scripts_) needed for the app.

To add TypeScript support for your NodeJS project, do the following:

<Instruction>

In your project directory, install the packages required to run a TypeScript project:

```bash
npm install --save-dev typescript @types/node ts-node ts-node-dev
```

</Instruction>

This will add the dependencies to your project, and will update the `package.json`.

The command above will get you the following libraries installed in the project:

* `typescript` is the basic TypeScript language support and compiler.
* `@types/node` is a package that contains the basic TypeScript types for NodeJS environment.
* `ts-node` and `ts-node-dev` are libraries that allows you to run `.ts` files directly, without a compilation step to JavaScript.

<Instruction>

Now, to create a new TypeScript tools with the default configuration, run the following:

```bash
npx tsc --init
```

</Instruction>

This will create a `tsconfig.json` file in your project. The [`tsconfig.json` is the TypeScript configuration file](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html), and it exists per-project. This is where you tell TypeScript compiler which files to compile and how to compile.

<Instruction>

To make it easier to run your project, replace the `"scripts"` section in your `package.json` file with the following: 

```json{5-6}(path="hackernews-node-ts/package.json")
{
  "name": "hackernews-node-ts",
  "version": "1.0.0",
  "description": "",
  "scripts": {
    "dev": "ts-node-dev --exit-child src/index.ts",
    "start": "ts-node src/index.ts"
  },
  "devDependencies": {
    "@types/node": "^16.9.2",
    "ts-node": "^10.2.1",
    "ts-node-dev": "^1.1.8",
    "typescript": "^4.4.3"
  }
}
```

</Instruction>

This will allow you to run the following scripts in your project directory:

* `npm run start` - will start the server.
* `npm run dev` - will start the server and restarts it on every change.

<Instruction>

Now create the root entry point for your project, by creating a file under `src/index.ts` with the following:

```typescript(path="hackernews-node-ts/src/index.ts")
console.log('Hello World!');
```

</Instruction>

And to run your server in watch mode, run in your terminal:

```bash
npm run dev
```

> Watch mode tracks your project's files, and re-runs your project automatically on a file change.

You should now see some log output regarding your build process, followed by:

```(nocopy)
Hello World!
```

> You can try to change the script, and notice that the server restarts automatically on every change!

The `index.ts` is the project entrypoint - this is where you NodeJS project starts and this runs the rest of the code.

</Instruction>

Congratulations! You now have a ready-to-use project with NodeJS, TypeScript and development scripts configured.

The next step will show you how to setup a basic GraphQL schema and a GraphQL server!
