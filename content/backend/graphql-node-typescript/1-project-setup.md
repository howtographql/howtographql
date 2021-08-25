---
title: Project Setup
pageTitle: 'Creating a basic NodeJS & TypeScript project'
description:
  'Learn how to setup a basic NodeJS & TypeScript server'
---

In this section, you will learn how to create a basic NodeJS project with TypeScript. 

This step will cover the initial NodeJS setup required, basic configuration for TypeScript projects, and how to setup the development scripts. 

### Requirements

- NodeJS installed on your operation system ([instructions](https://nodejs.org/en/download/package-manager/)). You can use any recent version (12/14/16).
- Your favorite terminal configured (we are going to use it a lot!)
- Run `node -v`, `npm -v`, `npx -v` in your terminal and make sure these commands are available for use.

### Creating Node+TypeScript project

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
npm install --save-dev typescript @types/node tsup
```

</Instruction>

This will add the dependencies to your project, and will update the `package.json`.

<Instruction>

Now, to create a new TypeScript tools with the default configuration, run the following:

```bash
npx tsc --init
```

</Instruction>

This will create a `tsconfig.json` file in your project.

To make it easier to run your project, replace the `"scripts"` section in your `package.json` file with the following: 

```json
"scripts": {
  "dev": "tsup src/index.ts --watch --onSuccess \"node dist/index.js\"",
  "start": "tsup src/index.ts && node dist/index.js"
},
```

This will allow you to run the following scripts in your project directory:

* `npm run start` - will start the server.
* `npm run dev` - will start the server and restarts it on every change.

<Instruction>


Now create the root entry point for your project, by creating a file under `src/index.ts` with the following:

```ts
console.log('Hello World!');
```

And to run your server in watch mode, run in your terminal:

```bash
npm run dev
```

You should now see some log output regarding your build process, followed by:

```
Hello World!
```

> You can try to change the script, and notice that the server restarts automatically on every change!

</Instruction>

We now have a ready-to-use project with NodeJS, TypeScript and development scripts configured.

The next step will show you how to setup a basic GraphQL schema and a GraphQL server!
