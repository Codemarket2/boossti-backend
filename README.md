# Boossti Backend

How to setup AWS AppSync GraphQL Backend and test using Live Lambda Development

## Setup AWS CLI

Install [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html).

Configure your AWS cli with the credentials

```bash
$ aws configure
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-west-1
Default output format [None]: json
```

If you are doing first time setup create your new branch if you havn't already. (Skip this step if you already have a branch)

```
{branch-name} = <your-first-name>+<first-letter-of-lastname> eg - sumij
```

```
{stage-name} = boossti-backend-{branch-name} eg - boossti-backend-sumij
```

Create your branch

```
git checkout -b {branch-name}
```

## Clone database

Install [mongodb shell](https://www.mongodb.com/try/download/shell) then run these commands

```bash
mongodump --uri mongodb+srv://<mongodb-username>:<mongodb-password>@codemarket-staging.k16z7.mongodb.net/boossti-backend-vivekt
```

```bash
mongorestore --uri mongodb+srv://vivekt:Codemarket.1234@codemarket-staging.k16z7.mongodb.net --db=<your-stage-name> dump/boossti-backend-vivekt
```

## Installation

Use the package manager [yarn](https://yarnpkg.com) to install dependecies.(Don't use npm install)

```
yarn install
```

Duplicate .env.example and rename to .env and add your MONGO_USERNAME and MONGO_PASSWORD

## Commands

Starts the local Lambda development environment.(for local testing always use {repository-name}-{your-branchname}
eg boossti-backend-sumij)

```
npx sst start --stage {repository-name}-{your-branchname}

example - npx sst start --stage boossti-backend-sumij
```

Runs your tests using Jest. Takes all the [Jest CLI options](https://jestjs.io/docs/en/cli).

```
yarn test
```

Deploy all your stacks to AWS. Or optionally deploy a specific stack. (for deploy always use {repository-name}-{your-branchname} eg boossti-backend-sumij)

```
npx sst deploy --stage {repository-name}-{your-branchname}

example - npx sst deploy --stage boossti-backend-sumij
```

Remove all your stacks and all of their resources from AWS. Or optionally remove a specific stack.

1 Remove Stack

```
npx sst remove --stage {repository-name}-{your-branchname}

example - npx sst remove --stage boossti-backend-sumij
```
