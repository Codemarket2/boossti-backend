# Vijaa Backend

How to setup AWS AppSync GraphQL Backend and test using Live Lambda Development

## Setup AWS CLI

Install [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html).

Configure your AWS cli with the credentials

```bash
$ aws configure
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-west-2
Default output format [None]: json
```

If you are doing first time setup create your new branch if you havn't already. (Skip this step if you already have a branch)

{branch-name} = <your-first-name>+<first-letter-of-lastname> eg - sumij

### `git checkout -b {branch-name}`

## Installation

Use the package manager [yarn](https://yarnpkg.com) to install dependecies.(Don't use npm install)

### `yarn install`

Duplicate .env-sample and rename to .env and add your MONGO_USERNAME and MONGO_PASSWORD, add your STAGE (eg dev-sumij)

## Commands

Starts the local Lambda development environment.(for local testing always use dev-{with-your-branchname}eg dev-sumij)

### `npx sst start --stage dev-{your-branchname}`

Build your app and synthesize your stacks. (for build always use prod-{with-your-branchname} eg prod-sumij)

### `npx sst build --stage prod-{your-branchname}`

Runs your tests using Jest. Takes all the [Jest CLI options](https://jestjs.io/docs/en/cli).

### `npm run test`

Deploy all your stacks to AWS. Or optionally deploy a specific stack. (for deploy always use prod-{with-your-branchname} eg prod-sumij)

### `npx sst deploy --stage prod-{your-branchname}`

Remove all your stacks and all of their resources from AWS. Or optionally remove a specific stack.

1 Remove Debug Stack

### `npx sst remove --stage dev-{your-branchname}`

2 Remove Production Stack

### `npx sst remove --stage prod-{your-branchname}`
