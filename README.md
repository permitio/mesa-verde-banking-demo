# Mesa Verde Bank Demo

This project showcases an advanced [fine-grained authorization](https://www.permit.io/blog/what-is-fine-grained-authorization-fga) demo in a banking system using the Permit.io Authorization as a Service product.

The application is written in Next.js and uses Permit.io's Decision Engine to enforce fine-grained authorization policies. The application also uses Stytch for user authentication and JSONBin.io to store external data for location-based authorization.

You can experience the demo live at [mesa-verde-banking-demo.railway.app](https://mesa-verde-banking-demo.railway.app).

## Authorization Flows

- **Multi-Tenancy Hierarchical Role-Based Access Control (RBAC):** When a new user created they are assigned to a tenant and a role within that tenant, such as Account Owner or Read Only Member.
- **Secure Collaboration:** Users can manage beneficiaries and account members using Permit.io's user management components.
- **Dynamic UI Feature Toggling:** The user interface components vary based on the user's role and account ownership status.
- **Fine-Grained Wire Transfer Permissions:** Wire transfers are authorized based on multiple factors flow, including user roles, relationships, user location, and transaction limits.
   - **Use External Data for Authorization:** The system uses external data sources to determine the user's location and apply location-based authorization.
   - **Feedback Loop of Authentication and Authorization:** Users who are not authorized for a specific action can leverage their permissions by strengthening their authentication.
   - **Transaction Approval Flow:** Account owners can approve wire transfers made by other users.
- **Fine-Grained Relationship-Based Access Control (ReBAC):** Users gain access to transactions through their relationship with the particular account and transaction.
- **Access Requests:** Users can request elevated access to specific accounts via ready-made access request components.

## Learn More

To learn more about the authorization models of this application, [Read the Docs](TBD)

For further reading, you can also check the following blogs:

- [What Really Happens When The Bank’s Server Authorizes Your Wire Transfer Request? (TBD)](#)
- [The Feedback Loop of Authentication and Authorization (TBD)](#)
- [How to Add Authorization to Stytch Authentication (TBD)](#)
- [Fine-Grained Authorization with Multi-Tenancy RBAC (TBD)](#)

## Running the application

To run a local version of the application, follow the steps below:

### Prerequisites

First, you need to have the following tools installed:

- [Node.js](https://nodejs.org/en/download/)
- [Docker](https://docs.docker.com/get-docker/)
- [Terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli)
- [ngrok](https://ngrok.com/download) - to expose the local server to the internet for access request webhooks

Then, you need to create a (free) account with the following:

- [Stytch](https://stytch.com/dashboard) - to authenticate users and ensure strong authentication with OTP
- [Permit.io](https://app.permit.io/) - to manage fine-grained authorization and access control
  - To run the project locally, it is recommended to have a fresh Permit environment without any configured policies. To create a new environment, follow the instructions [here](https://docs.permit.io/manage-your-account/projects-and-env/#environments)
- [JSONBin.io](https://jsonbin.io/) - to store the external data for location-based authorization

### Clone the repository and install dependencies

1. Clone the repository:
   ```bash
   git clone git@github.com:permitio/mesa-verde-banking-demo.git
   ```
2. Run the following commands to install the dependencies:
   ```bash
   cd mesa-verde-banking-demo
   npm install
   ```

### Setup the environment variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in the environment variables in the `.env` file with the values from your Stytch, Permit.io, and JSONBin.io accounts.

### Configure the Authorization Policies

1. To configure the initial Authorization schema in Permit, use the following terraform commands that will apply them in your newly created Permit environment:
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```
2. After running the command, you should see the following Policy configured in the Permit [Policy Editor](https://app.permit.io/policy-editor):
   ![Policy](TBD)

### Configure the Permit Elements

1. To configure the Permit Elements, run the following command:
   ```bash
   npm run configure-permit-elements
   ```
2. After running the command, you should see the following Permit Elements configured in the Permit [Elements Editor](https://app.permit.io/elements):
   ![Elements](TBD)

### Start the application

To simply run the application, just use the following command that will start the Next.js server and run all the necessary services in Docker:

```bash
docker-compose up --build
```

### Experience the Demo
At this point, you can just visit the browser in your ngrok URL and open a new account to experience the application live.

## Talk to us
If you find this demo helpful or have any questions, feel free to reach out to us on our [Slack Community](https://io.permit.io/slack), where 1000s of developers are discussing fine-grained authorization and access control.
