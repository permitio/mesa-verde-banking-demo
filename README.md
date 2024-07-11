# Mesa Verde Bank Demo

This project showcases a basic banking system using Permit.io for authorization and Stytch for authentication. It demonstrates Role-Based Access Control (RBAC) with multitenancy and Attribute-Based Access Control (ABAC), allowing users to log in, create current accounts, and perform various operations based on their roles and permissions.

Stytch is integrated to handle user authentication, ensuring a secure and seamless login process. When a user logs in, Stytch creates a secure session, allowing them to interact with the banking system.

## Introduction

The Mesa Verde Bank Demo is designed to illustrate a secure and flexible banking system. Users can authenticate via Stytch, create new current accounts, and interact with these accounts based on their assigned roles. This guide provides an overview of the project's features, key components, and usage instructions.

<img width="989" alt="Screenshot 2024-07-01 at 22 58 19" src="https://github.com/permitio/barclays-demo-app/assets/109458126/6dd9d400-3e69-4b2e-b96d-40d42ca2f1ba">

## Features Overview

The demo includes the following key features:

- **User Authentication:** Secure login using Stytch, which creates a session for the user.
- **Current Account Creation:** Users can create new current accounts, each representing a tenant in the system.
- **Role-Based Access Control (RBAC):** Users are assigned roles such as Account Owner or Read Only Member, determining their access and permissions.
- **Attribute-Based Access Control (ABAC):** Specific actions, such as transaction limits, are controlled based on user attributes and roles.

### User Synchronization and Role Assignment

When a new user is created, they are automatically synced into Permit.io. Each user is assigned a role within a tenant, such as Account Owner or Read Only Member. Users can have multiple roles across different accounts, enabling a flexible multi-tenancy setup.

<img width="336" alt="Screenshot 2024-07-01 at 22 58 30" src="https://github.com/permitio/barclays-demo-app/assets/109458126/ce01fa0e-40e8-4b2f-bee7-60ee25adaaad">

### Dynamic UI Rendering

The user interface components vary based on the user's role and account ownership status. This dynamic rendering ensures that users only see elements relevant to their permissions.

### Access Requests and Approval Workflow

Users can request elevated access to specific accounts via an access request element. This access request is one of many Permit.io elements that allow us to safely delegate authorization functionality to end users. Account owners can approve these requests, granting the user an Account Access Member role with elevated permissions. This workflow ensures controlled and secure access management.

#### Inviting a user into the current account as a specific role
<img width="696" alt="Screenshot 2024-07-01 at 23 01 53" src="https://github.com/permitio/barclays-demo-app/assets/109458126/630cbe4b-f3b9-4bff-80ec-e11c4162e433">

#### User successfully invited:
<img width="678" alt="Screenshot 2024-07-01 at 23 02 09" src="https://github.com/permitio/barclays-demo-app/assets/109458126/e89201f8-763f-493a-85a1-643d1d7c3e19">

### Transaction Management

- Account Owners: Can perform wire transfers without restrictions.
- Account Access Members: Can perform wire transfers up to 1000 GBP, showcasing simple ABAC controls.
  Permission Controls

<img width="608" alt="Screenshot 2024-07-01 at 22 59 17" src="https://github.com/permitio/barclays-demo-app/assets/109458126/4c15f58a-d00d-49cc-afe7-249b9ce9f7bc">

- Read Only Members: Can view a limited set of data for each current account.

The system enforces transaction limits and other permissions based on user roles and attributes, ensuring secure and compliant operations.

## Running the application

We have dockerized the whole project for ease of use. But before we run the `docker-compose` we need to setup a `.env.local` file.

You will need to make an account with the following:

1. [Stytch](https://stytch.com/) - to get the `STYTCH_PROJECT_ENV`, `STYTCH_PROJECT_ID`, `STYTCH_SECRET` & `NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN`.
2. [Permit](https://permit.io/) - to get the `PERMIT_API_KEY`, `NEXT_PUBLIC_PROJ_ID`, `NEXT_PUBLIC_ENV_ID` & `PERMIT_PDP_HOSTNAME`

Here is the `.env.local` structure:

```bash
STYTCH_PROJECT_ENV=
STYTCH_PROJECT_ID=
STYTCH_SECRET=
NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN=
NEXT_PUBLIC_PERMIT_API_KEY=
PERMIT_API_KEY=
NEXT_PUBLIC_PROJ_ID=
NEXT_PUBLIC_ENV_ID=
PERMIT_PDP_HOSTNAME="http://localhost:7766"
```

Once you have all of these, just run:

```bash
docker-compose up --build
```

This will launch the whole app, but you still need to configure the policies for for the different roles.
Please use the below screenshots as per what to copy.

Once you have all of these, everything should work as expected. Happy testing!


## Permit Configuration
Roles:
AccountOwner
AccountBeneficiary
AccountMember

Resources:
Account - add-members, add-beneficiaries, read

JWKs Config