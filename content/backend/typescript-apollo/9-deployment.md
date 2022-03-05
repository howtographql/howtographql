---
title: Deploying to Production
pageTitle: 'Continuous Deployment Tutorial with Heroku and GitHub Actions'
description: 'Inside .'
question:
  When does a workflow get triggered automatically on GitHub Actions?
answers: ['Workflows need to be triggered manually', 'Workflows are triggered after every push', 'Workflows are triggered based on configurable events', 'Workflows are triggered when any underlying job is triggered']
correctAnswer: 2
---

In this tutorial, you will deploy your API to production so that you and others can access it publicly. You will also refactor the project to make it ready for deployment on [Heroku](https://dashboard.heroku.com/). Additionally, you will automate the deployment process using [GitHub Actions](https://docs.github.com/en/actions) — also referred to as [continuous deployment](https://en.wikipedia.org/wiki/Continuous_deployment).

### Prerequisites 

You will need to install a few command line utilities and create some accounts to follow this chapter. We suggest you do this now so as not to break the flow of the tutorial.

1. **GitHub (Account)**: Create a free [GitHub](https://github.com/join) account.
1. **GitHub (CLI)**: Install the latest stable version of the [GitHub CLI](https://cli.github.com/). Afterward, [login to your GitHub account](https://cli.github.com/manual/gh_auth_login) on the CLI. 
1. **Heroku (Account)**: Create a free account on [Heroku](https://signup.heroku.com/). 
1. **Heroku (CLI)**: Install the latest stable version of the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli). Afterward, [login to your Heroku account](https://devcenter.heroku.com/articles/heroku-cli#get-started-with-the-heroku-cli) on the Heroku CLI. 
1. **[Docker](https://docs.docker.com/get-docker/)** and **[Docker Compose](https://docs.docker.com/compose/install/)**

> **Note:** Docker and Docker Compose will be used to run an instance of the PostgreSQL database. If you prefer, you can install and run [PostgreSQL](https://www.postgresql.org/download/) natively as well. If you choose to run natively, you will need to make some slight changes to the instructions shown in this tutorial. 


With that out of the way, you can get started!

### Adding version control

To automate the deployment process, you will need version control to synchronize the changes on your local machine with the production deployment. This tutorial will not cover the basics of using version control. 

> **Note 1:** If you're unfamiliar with the basics git, I would suggest [this series by Atlassian](https://www.atlassian.com/git/tutorials/setting-up-a-repository). To understand the git commands used in this tutorial, the first two articles of this series are sufficient.

> **Note 2:** If you have already set up version control and a repository on GitHub for this project, you can jump ahead to the **Changing SQLite to PostgreSQL** section.

<Instruction>

Initialize a git repository and create a `.gitignore` file in the root of your project:

```bash(path=".../hackernews-typescript/")
git init
touch .gitignore
```

</Instruction>


Before you commit any file, you need to add some files to the `.gitignore` file. 

<Instruction>

Update your `.gitignore` file with the following contents:

```(path=".../hackernews-typescript/.gitignore")
node_modules
.env
.vscode
dist
```

</Instruction>

Now it's time to create your first commit. 🎉 

<Instruction>

Add your project source files to the git staging area and create your first commit:

```bash(path=".../hackernews-typescript/")
git add .
git commit -m "first commit"
```

</Instruction>

Now that you have a local commit, it's time to create a remote repository on GitHub. You can do this entirely from your terminal using the GitHub command line tool (also known as `gh`). 

> **Note 1:** If you haven't installed `gh` and logged in with your GitHub credentials, you can do so with the `gh auth login` command.

> **Note 2:** If you're not comfortable using the CLI to create a repository, you can do it using [GitHub's](https://github.com/new) graphical user interface (GUI). However, this tutorial will not demonstrate how to do this. 


<Instruction>

Create a new repository for your project:

```bash(path=".../hackernews-typescript/")
gh repo create hackernews-typescript --source . --private 
```
</Instruction>

This command will create a private repository inside your GitHub account called `hackernews-typescript`. The final results of the above command should look like the following, with "\_\_username\_\_" being replaced by your _actual_ GitHub handle: 

```shell(nocopy)
✓ Created repository __username__/hackernews-typescript on GitHub
✓ Added remote git@github.com:__username__/hackernews-typescript.git
```

<Instruction>

Push your local commit to the new remote repository on GitHub. 

```
git push origin master
```

</Instruction>

Once this command finishes execution, you should see the repository with all your code under your GitHub profile. 

> **Note:** This tutorial assumes the name of your default branch is "master". In case it is "main", replace "master" with "main" in the above command. 


### Changing SQLite to PostgreSQL 

The previous tutorials have been using SQLite as the database for your API. However, SQLite is not _typically_ used for production web backends for several reasons. So, before you start working on deployment, you will migrate from SQLite to a more conventional and powerful database: PostgreSQL.

> **Note:** We chose SQLite for this tutorial as it requires minimal setup and configuration. However, deploying SQLite to Heroku would be difficult and need a lot of extra configuration (more info [here](https://devcenter.heroku.com/articles/sqlite3)). This is why you will migrate to PostgreSQL for this chapter. 


<Instruction>

Start by removing the SQLite file and migrations from the `prisma` folder:

```bash(path=".../hackernews-typescript/")
rm -rf prisma/migrations
rm prisma/dev.db
```
</Instruction>

Now that all SQLite assets have been removed, it's time to update your Prisma schema to use PostgreSQL.

<Instruction>

Update the `datasource` API block in your `schema.prisma` file as follows: 

```graphql{2-3}(path=".../hackernews-node/prisma/schema.prisma")
datasource db {
  provider = "postgresql"  
  url      = env("DATABASE_URL")  
}
```

</Instruction>

There are two fields that you should understand: 

1. The `provider` field signifies the underlying database type. You changed the field from `sqlite` to `postgresql`.  
1. The `url` field specifies the database connection string. For SQLite, this was a path to the file. In the case of PostgreSQL, the database connection string will be read from the `DATABASE_URL` [environment variable](https://www.prisma.io/docs/guides/development-environment/environment-variables) that will be defined in the project's `.env` configuration. 


Now you need a PostgreSQL database running on your local machine. You are going to do this using a containerized version of PostgreSQL. 

<Instruction>

Create a `docker-compose.yml` file to store your PostgreSQL container configuration:

```bash(path=".../hackernews-typescript/")
touch docker-compose.yml
```
</Instruction>



<Instruction>

Create the following configuration inside the `docker-compose.yml` file: 

```yaml{}(path=".../hackernews-typescript/docker-compose.yml")
version: '3.8'
services:

  # Docker connection string for local machine: postgres://postgres:postgres@localhost:5432/

  postgres:
    image: postgres:10.3    # 1
    restart: always
    environment:            # 2
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:                # 3
      - postgres:/var/lib/postgresql/data
    ports:
      - '5432:5432'         # 4

volumes:
  postgres:
```

</Instruction>

Here is what is happening inside the `docker-compose.yml` file:

1. The `image` option defines what Docker image to use.
2. The `environment` option specifies the environment variables passed to the container during initialization. You can define the configuration options and secrets – such as the username and password – the container will use here.
3. The `volumes` option is used for persisting data in the host file system. 
4. The `ports` option maps ports from the host machine to the container. The format follows the convention of "host_port:container_port". In this case, you are mapping the port `5432` of the host machine to port `5432` of the `postgres` container. `5432` is conventionally the port used by PostgreSQL. 

With that out of the way, you can now spin up the database with one command. Before you move on to the next instruction, make sure that nothing is already running on port `5432`, in which case, the following command will fail. 

<Instruction>

Open a *new* terminal window and run the following command:

```bash(path=".../hackernews-typescript/")
docker-compose up
```

</Instruction>

If everything worked properly, the new terminal window should show logs saying that the database system is ready to accept connections. The logs should be similar to this

```shell{}(nocopy)
....
postgres_1  | 2022-03-05 12:47:02.410 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
postgres_1  | 2022-03-05 12:47:02.410 UTC [1] LOG:  listening on IPv6 address "::", port 5432
postgres_1  | 2022-03-05 12:47:02.411 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
postgres_1  | 2022-03-05 12:47:02.419 UTC [1] LOG:  database system is ready to accept connections
```


> **Note 1:** You cannot close the new terminal window as it will also stop the container. You can avoid this if you add `-d` to the previous command, like this: `docker-compose up -d`. 

> **Note 2:** Once started, the container will persist even if you restart your machine. At any point if you want to stop the database container, use the following command from the terminal in the root folder of your project: `docker-compose down`.


You will also need to securely provide the connection URL to the newly created PostgreSQL instance to Prisma. To do this, you will use the `.env` file.

<Instruction>

In case you don't have one already, create a new `.env` file: 

```bash(path=".../hackernews-typescript/")
touch .env
```

</Instruction>

Now it's time to provide a connection string that Prisma can connect to PostgreSQL. Remember that inside the `schema.prisma` file you defined the connection string environment variable as `DATABASE_URL`. 

<Instruction>

Specify the `DATABASE_URL` variable inside the `.env` file:

```bash(path=".../hackernews-typescript/.env")
DATABASE_URL=postgres://postgres:postgres@localhost:5432/hackernews-db
```
</Instruction>

This is the format used by Prisma for PostgreSQL connection strings:

![Prisma Connection String format](https://i.imgur.com/qxnUKrS.png)

Note that the **Arguments** portion is optional and is absent in your connection string. 

This format is based on the [official PostgreSQL format for connection URLs](https://www.postgresql.org/docs/current/libpq-connect.html#libpq-connstring). You can find more information about this in the [Prisma docs](https://www.prisma.io/docs/concepts/database-connectors/postgresql). 

Now it's time to recreate the migrations, but this time specific to PostgreSQL.

<Instruction>

Use the `prisma` CLI tool to create a new migration:

```bash(path=".../hackernews-typescript/")
npx prisma migrate dev --name init
```

</Instruction>

[Chapter 4](../4-adding-a-database/) covers the core concept behind the `migrate` command. This command will also regenerate Prisma Client based on the most recent schema. 


Restart server with `npm run dev`. While your previous data will have disappeared, all functionality should remain intact. Feel free to test out all the queries/mutations to confirm they work as expected. 

<Instruction>

Commit all your changes to version control: 

```bash(path=".../hackernews-typescript/")
git add .
git commit -m "migrate database to postgres"
```

</Instruction>

### Update `index.ts` to make it deployment ready

You will need to make a few changes to the `index.ts` to make the API ready for deployment. 

<Instruction>


Update `src/index.ts` as follows:

```typescript{2,10-11,14}(path=".../hackernews-typescript/src/index.ts")
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";

import { schema } from "./schema";
import { context } from "./context";

export const server = new ApolloServer({
    schema,
    context,
    introspection: true,                                      // 1
    plugins: [ApolloServerPluginLandingPageLocalDefault()],   // 2
});

const port = process.env.PORT || 3000;                        // 3

server.listen({ port }).then(({ url }) => {
    console.log(`🚀  Server  ready at ${url}`);
});

```


</Instruction>

You have made the following changes: 

1. [Introspection](https://graphql.org/learn/introspection/) is a feature that allows a GraphQL client to ask a GraphQL server for information about what queries it supports. Apollo turns off introspection in production by default as a security measure. However, you are keeping introspection as it makes it easier to explore the API, though this is not something you usually do in a production application.
2. Similar to introspection, Apollo also turns off Apollo Sandbox in the production version of an app. Once again, as this is not a real application with production workloads, we explicitly decided to keep it on for convenience.
3. Previously, Apollo Server was running on port `3000` on your local machine. Heroku will provide the port number the app will run on through the `port` environment variable in production.

> **Note:** Apollo Server determines whether your app is running in development or production by using the `NODE_ENV` environment variable, which is set automatically to "production" during deployment by Heroku.


### Create new scripts in `package.json` 

So far, you have been using `ts-node` to run your TypeScript code. However, this has a memory and performance overhead. In production, you will transpile your code to JavaScript using the TypeScript compiler and run the JavaScript code directly using `node`. To do this, you will need to create two additional scripts in your `package.json`. You will also add a new script to apply database migrations to your production database. 


<Instruction> 

Update your `package.json` with the following scripts:

```json{5-7}(path=".../hackernews-typescript/package.json") 
  "scripts": {
    "dev": "ts-node-dev --transpile-only --no-notify --exit-child src/index.ts",
    "generate": "ts-node --transpile-only src/schema",
    "prettier-format": "prettier 'src/**/*.ts' --write",
    "migrate:deploy": "prisma migrate deploy",
    "build": "prisma generate && npm run generate && tsc",
    "start": "node dist/src/index.js"
  },
```

</Instruction>

Here's what the scripts are doing:

1. The `migrate:deploy` script applies all pending migrations to the production database by running `prisma migrate deploy`. This command is somewhat different from `prisma migrate dev`, which you have used to generate/apply migrations in your development database. You can find more information about the `migrate deploy` command in the [Prisma docs](https://www.prisma.io/docs/concepts/components/prisma-migrate#production-and-testing-environments).
2. The `build` script first runs `prisma generate` to create the Prisma Client, then runs `src/schema.ts` to generate the nexus assets, and finally transpiles your TypeScript code to JavaScript using the TypeScript compiler (or `tsc`). 
3. The `start` command runs the JavaScript code transpiled by `tsc` using `node`. Notice that the code generated by `tsc` goes into the `dist` folder because of the `outDir` option specified in your `tsconfig.json`. 

Now you will create another commit. 

<Instruction>

Add your project source files to git and create a new commit:

```bash(path=".../hackernews-typescript/")
git add .
git commit -m "update index.ts and create new scripts in package.json"
```

</Instruction>

With that out of the way, it's time to get started deploying the app! 🚀


### Creating resources on Heroku 

In this section, you will create the Heroku app along with a PostgreSQL database to host your API. Make sure you have created a Heroku account and logged into the CLI with the `heroku login` command before proceeding with this section. 

<Instruction>

Inside the root folder of your project, start a new Heroku app with the following command. _Before running the command, make sure to replace "app-name-placeholder" with a meaningful name for your app._

```bash(path=".../hackernews-typescript/")
heroku apps:create app-name-placeholder
```

</Instruction>

After the command finishes executing, you should see a result like this: 


```shell{}(nocopy)
Creating ⬢ app-name-placeholder... done
https://app-name-placeholder.herokuapp.com/ | http://app-name-placeholder.herokuapp.com/
```

We will use "app-name-placeholder" as a placeholder name for the Heroku app throughout the rest of the tutorial; replace it with your app name when appropriate. 

You can also go to your [Heroku dashboard](https://dashboard.heroku.com/apps) on a browser to verify the newly created app.

![Heroku dashboard](https://i.imgur.com/VVXSmkV.png)

[Heroku add-ons](https://elements.heroku.com/addons) are components that support your application, such as data storage, monitoring, analytics, data processing, and more. You will now use the [heroku-postgres](https://www.heroku.com/postgres) add-on to create a database for your app. 

<Instruction>

Create a PostgreSQL database for your Heroku app with the following command: 

```bash(path=".../hackernews-typescript/")
heroku addons:create heroku-postgresql:hobby-dev
```

</Instruction>


You should see an output *similar* to the following: 

```shell(nocopy)
Creating heroku-postgresql:hobby-dev on ⬢ app-name-placeholder... free
Database has been created and is available
 ! This database is empty. If upgrading, you can transfer
 ! data from another database with pg:copy
Created postgresql-cubic-54990 as DATABASE_URL
```

This command also creates a new environment variable called `DATABASE_URL` in the Heroku app, the connection string to the PostgreSQL database. This is very convenient because when you deploy the API, Prisma will have access to the production database automatically, without any additional configuration on your end. The connection string uses the same format as Prisma too! 

> **Note:** You can check your production database connection string with this command: `heroku config:get DATABASE_URL`. 

Now that we have set up the necessary resources on Heroku, it's time to set up a deployment pipeline that will ensure continuous deployment. 


### Implementing continuous deployment using GitHub Actions

GitHub Actions is an automation tool used for continuous integration (CI) and continuous deployment (CD). It allows orchestrating workflows based on events in GitHub and can be used to build, test, and deploy your code directly from GitHub.

To configure GitHub Actions, you define _workflows_ using the "yaml" file format. These workflows are stored in the `.github/workflows` directory of your project. You can configure workflows to run on different repository events, e.g., when a commit is pushed to the repository or when a pull request is created.

Each workflow can contain one or more _jobs_ which are dedicated tasks, which run in an isolated environment (known as a "runner"). A single job can also have one or more steps. In this project, you will create a single workflow with a job called `deploy`. 

<Instruction>

Create a `.github/workflows` directory and a new deployment workflow file. 

```bash(path=".../hackernews-typescript/")
mkdir .github
mkdir .github/workflows
touch .github/workflows/deployment.yml
```

</Instruction>

<Instruction>

Define the action inside the newly created workflow:


```yaml{}(path=".../hackernews-typescript/.github/workflows/continuous-integration.yml")
name: deploy-hackernews-app-heroku                       # 1

on:
  push:
    branches:                                            # 2
      - master
      - main

jobs:  
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2                        # 3
      - run: npm ci                                      # 4
      - name: Run production migration                   
        run: npm run migrate:deploy                      # 5     
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      - uses: akhileshns/heroku-deploy@v3.12.12          # 6
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: ${{ secrets.HEROKU_APP_NAME }}
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

</Instruction>

Here's what is going on here:

1. The `name` keyword defines the name of the workflow. 
2. `on` is used to define which events will trigger the workflow to run automatically. In this case, it will run on a push to the `main` or `master` remote branch. 
3. The `uses` keyword specifies that this step will run `v2` of the [`actions/checkout`](https://github.com/actions/checkout) action. This action checks-out your repository to the runner so your workflow can access it. 
4. The `run` keyword is used to execute any arbitrary shell command on the runner. In this case, you are using `npm ci` which is similar to `npm install`, but more suitable for automated environments. Details are available on the [npm docs](https://docs.npmjs.com/cli/v8/commands/npm-ci)
5. The runner will execute the `migrate:deploy` npm script. This is to synchronize any database changes to the production database. The `env` property provides the database connection string to the runner.
6. This command uses the `heroku-deploy@v3.12.12` action to deploy the final code to Heroku. The `with` keyword is used to pass certain parameters to the action. 


### Defining build-time secrets in GitHub 

In the GitHub Actions workflow you just created, you referenced quite a few `secrets`. Secrets allow you to store sensitive information in your repository instead of keeping them in your code. These secrets can be accessed by your GitHub Action when executing a workflow. 

You can set secrets using the GitHub website GUI or the `gh` CLI tool. In this tutorial, you will learn how to do it using the CLI. If you prefer to do it using the website, take a look at [this guide](https://docs.github.com/en/actions/security-guides/encrypted-secrets). 

The syntax for creating a new secret using `gh secret set SECRET_NAME`, where `SECRET_NAME` should be replaced with the name of your secret.  Running this command will initiate an interactive prompt where you will have to enter the secret value. 

The first secret you will set will be `HEROKU_EMAIL`. This is the email account you used to create your Heroku account. 

<Instruction>

Go to the root of your project and run the following command to set the `HEROKU_EMAIL` secret. After running the command, the CLI will prompt you to enter a secret value, enter the appropriate email as the value. 


```bash(path=".../hackernews-typescript/")
gh secret set HEROKU_EMAIL
```

</Instruction>



> **Note:** If you make a mistake and need to update the value of a secret, running the `gh secret set` command again with the same secret name will update the value of that particular secret. 

<Instruction>

Similarly, create the `HEROKU_APP_NAME` secret using the name of the Heroku app you just created as the value. 

```bash(path=".../hackernews-typescript/")
gh secret set HEROKU_APP_NAME
```

</Instruction>


You can check or verify the Heroku app name by running the following command in the root of your project: 

```bash(path=".../hackernews-typescript/")
heroku apps:info
```

Now you will need to retreive your `HEROKU_API_KEY`. This key is available under the **Account** tab of your Heroku [**Account Settings**](https://dashboard.heroku.com/account). Go to the [**Account Settings**](https://dashboard.heroku.com/account) and scroll down to **API Key**. Finally press the **Reveal** button to retreive the key. 

![Heroku account API key](https://i.imgur.com/llG5CfB.png) 

<Instruction>

Set the `HEROKU_API_KEY` secret using the key retreived from your Heroku account. 

```bash(path=".../hackernews-typescript/")
gh secret set HEROKU_API_KEY
```

</Instruction>

The final secret is `DATABASE_URL` which contains the connection string to your production database. This is already available in Heroku as an environment variable under the same name (`DATABASE_URL`). You can fetch it from Heroku using the following command:

```bash(path=".../hackernews-typescript/")
heroku config:get DATABASE_URL
```

<Instruction>

Set the `DATABASE_URL` secret using the URL retreived from your Heroku app. 

```bash(path=".../hackernews-typescript/")
gh secret set DATABASE_URL
```

</Instruction>

That's it! All the secrets have been set and it is now possible to deploy and execute your GitHub Action. If you want to see the name of the secrets available in your repository, you can do so using the `gh secret list` command. 


<Instruction>

Create a new commit and push all your changes to the remote repository on GitHub: 

```bash(path=".../hackernews-typescript/")
git add .
git commit -m "create deployment github action workflow" 
git push origin master
```

</Instruction>

This should create and trigger the `deploy-hackernews-app-heroku` workflow on GitHub. You can trigger the workflow at any time creating an empty commit: 

```bash(path=".../hackernews-typescript/")
git commit --allow-empty -m "trigger build"
git push
```

Once you have pushed a commit, quickly go to the **Actions** tab of your GitHub repository, and you should see that the workflow is _in progress_. 

![Workflow in progress in the Actions tab](https://i.imgur.com/8xBtd3q.png)


You can also go inside the workflow to inspect the status of any job. To verify that the deployment went successfully:
Click on the most recent workflow in the **All workflows** table in the **Actions** tab for your repository. Then click on the **deploy** job located in the **Jobs** table to the left-hand side. Finally, Click on the **Run akhileshns/heroku-deploy@v3.12.12** step to expand the logs.

If everything goes successfully, you should see something similar to the following near the end of the logs: 

```bash
remote: -----> Launching...        
remote:        Released v2        
remote:        https://***.herokuapp.com/ deployed to Heroku    
```

![Check details GitHub Actions](https://i.imgur.com/yeYWWFm.gif)

Your API should now be live on Heroku. Every time you push a new commit to the `main` or `master` branch to GitHub, the workflow will be triggered automatically, rebuilding the app and redeploying it to Heroku. 

> **Note:**  Heroku will use the `npm run build` and `npm run start` commands to start the application by itself. For all Node.js apps, Heroku will check for the `build` script and run it if it is available. Finally, it will start the app using the `start` script. So a Node.js app deployed to Heroku needs to have a `start` script.  

<Instruction>

To access your app in a browser, run the following command: 

```bash(path=".../hackernews-typescript/")
heroku open
```

</Instruction>

Press the **Query Your Server** button to be redirected to Apollo Studio Explorer. At this point, you should run a few queries to test out all functionality. The commands tested at the end of [Chapter 6](../6-authentication/) are a good way to test out the main functionalities. 

> **Note:** The URL for your Heroku App is also provided as **Web URL** by the following CLI command: `heroku apps:info` 

<Instruction>

Run the following queries one after another to test out the `signup`, `post` mutation and the `feed` query. Make sure to set the `Authorization` header after the first query. 

```graphql

mutation SignUpMutation {
  signup(name: "Alice", email: "alice@prisma.io", password: "graphql") {
    token
    user {
      id
    }
  }
}

mutation FirstPostMutation {
  post(url: "nexusjs.org", description: "Code-First GraphQL schemas for JavaScript/TypeScript") {
    id
    description
    url
    postedBy {
      id
      name
      email
    }
  }
}

mutation SecondPostMutation {
  post(url: "www.prisma.io", description: "Next-generation Node.js and TypeScript ORM") {
    id
    description
    url
    postedBy {
      id
      name
      email
    }
  }
}

query FeedQuery{
  feed {
    count
    links {
      id
      createdAt
      description
    }
  }
}



```

</Instruction>

![Running API operations in production server](https://i.imgur.com/hNQsB3l.gif) 


### Exploring your data in Prisma Data Platform 

Previously, you were using Prisma Studio to interact with your data directly. However, Prisma Studio is meant to be used with your development or test database and is not a great option to interact with production data. To solve this problem, Prisma has a hosted version of Prisma Studio inside the [Prisma Data Platform](https://cloud.prisma.io/?utm_source=howtographql&utm_campaign=typescript-apollo), called the _Data Browser_.  

To get started with the Prisma Data Platform, follow the steps outlined below:

1. Go to the [Prisma Data Platform](https://cloud.prisma.io/?utm_source=howtographql&utm_campaign=typescript-apollo).
2. Click **Continue with GitHub** and click **Authorize Prisma** to proceed. 
3. In the dashboard, click on **New Project**. Then under the dropdown in **GitHub Account**, click on **Add an Organization or Account**. 
4. (**Optional**) If you are part of one or more organizations, choose which account or organization you want to use.
5. Now, you can choose to install Prisma on *all repositories* or *select repositories*. Choose **Only select repositories** and choose the **hackernews-typescript** repository. Then click on **Install** to be redirected to the **Configure project** page.
6. Choose **Import a Prisma repository** and under the **Repository** field, select the **hackernews-typescript** repository.
7. Give a suitable name to your project (this is the name of the Prisma Data Platform project, not to be confused with the name of the repository) and click **Next** to continue.
8. In the  **Configure environment** page, choose **Use my own database**. 
9. Paste the connection string you received from Heroku under the **Connection String** field. 
10. Click on **Create project** to proceed. You will be given a connection URL to the [Prisma Data Proxy](https://www.prisma.io/docs/concepts/data-platform/data-proxy), which you can **Skip** as you won't be using the Data Proxy at the moment.  
11. Click on the **Data Browser** button on the left-hand side to get a hosted version of the Prisma Studio.

![Onboarding the Prisma Data Platform](https://i.imgur.com/ktA3N1Y.gif)


The next time you log in to the Prisma Data Platform, the project you just created should be available for you to access. The project will also be synced with any schema changes pushed to the selected branch on GitHub.


Like Prisma Studio, the Data Browser allows you to explore and edit your data. The Prisma Data Platform also has collaboration features and permission levels, helpful when working with a team. It also has a Query Console, which allows you to write and execute Prisma queries against your production database. Feel free to explore all the features or learn more about the Prisma Data Platform by reading the [docs](https://www.prisma.io/docs/concepts/data-platform/about-platform). 






