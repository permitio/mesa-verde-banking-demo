const { Permit } = require("permitio");

const STEP = process.env.SETUP_STEP || "0";

const permit = new Permit({
  token: process.env.PERMIT_API_KEY,
  pdp: process.env.PDP_URL,
});

const ELEMENTS_CONFIG = {
  "wire-transfer-approval-management": {
    name: "Wire Transfer Approval Management",
    elements_type: "approval_management",
    settings: {
      name: "Wire Transfer Approval Management",
      title: "Approval Management",
      isDarkMode: 0,
      isShowDate: 1,
      isShowReason: 1,
      primaryColor: "#067A6F",
      secondaryColor: "#E5484D",
      backgroundColor: "#FFFFFF",
      isShowUserEmail: 1,
      darkPrimaryColor: "#0AC5B3",
      darkSecondaryColor: "#E5484D",
      darkBackgroundColor: "#282826",
    },
    email_notifications: false,
    roles_to_levels: {},
    webhook: null,
  },
  "wire-transfer-approval-request": {
    name: "Wire Transfer Approval Request",
    elements_type: "operation_approval",
    settings: {
      name: "Wire Transfer Approval Request",
      title: "Approval Required",
      resource: "Wire_Transfer",
      isDarkMode: 0,
      webhookUrl: `https://${process.env.NGROK_DOMAIN}/account/webhook`,
      messageText:
        "Performing this transfer requires approval from the account owner",
      primaryColor: "#067A6F",
      webhookSecret: process.env.WEBHOOK_SECRET,
      backgroundColor: "#FFFFFF",
      actionButtonText: "Request Transfer Approval",
      darkPrimaryColor: "#0AC5B3",
      emailNotifications: 0,
      darkBackgroundColor: "#282826",
      webhookNotification: 1,
      isRequireJustification: 1,
      justificationPlaceholder: "I need this wire for...",
    },
    email_notifications: false,
    roles_to_levels: {},
    webhook: {
      type: "elements",
      url: `https://${process.env.NGROK_DOMAIN}/account/webhook`,
      bearer_token: process.env.WEBHOOK_SECRET,
    },
  },
  "wire-transfer-request": {
    name: "Wire Transfer Request",
    elements_type: "approval_flow",
    settings: {
      name: "Wire Transfer Request",
      title: "Access Restricted to Perform a Wire Transfer",
      messageText:
        "Hit the request access button and we’ll let the Account Owner know that you want to perform a Wire Transfer.",
      primaryColor: "#33a2e9",
      backgroundColor: "#FFFFFF",
      actionButtonText: "Request Access",
      darkPrimaryColor: "#0AC5B3",
      darkBackgroundColor: "#282826",
      justificationMessage: "",
      isAccessJustification: 1,
      isRequireJustification: 0,
      justificationPlaceholder: "Reason",
      selectedUserManagementElement: "account-members-management",
    },
    email_notifications: false,
    roles_to_levels: {},
    webhook: null,
  },
  "account-members-management": {
    name: "Account Members Management",
    elements_type: "user_management",
    settings: {
      name: "Account Members Management",
      title: "Members",
      isDarkMode: 0,
      webhookUrl: "",
      isShowTitle: 1,
      isShowReason: 1,
      primaryColor: "#067A6F",
      configureType: "RBAC",
      webhookSecret: "",
      backgroundColor: "#FFFFFF",
      isShowUserEmail: 1,
      actionButtonText: "Send Invite",
      darkPrimaryColor: "#0AC5B3",
      multiRoleSupport: "single",
      emailNotifications: 0,
      isShowUserFullName: 1,
      approvalFlowElement: "wire-transfer-request",
      darkBackgroundColor: "#282826",
      defaultRoleSelected: "",
      webhookNotification: 0,
      resourceTypeSelected: "",
      requestedAccessTimeWindow: 1,
      approvalFlowIsShowUserEmail: 1,
      approvalFlowIsShowUserFullName: 1,
    },
    email_notifications: false,
    roles_to_levels: {
      LEVEL_1: ["AccountOwner"],
      LEVEL_2: ["AccountBeneficiary"],
      LEVEL_3: ["AccountMember"],
    },
    webhook: null,
  },
};
const USER_ATTRIBUTES_CONFIG = [
  {
    key: "location",
    type: "string",
    description: "ISO 3166 country code of the user location",
  },
  {
    key: "country",
    type: "string",
    description: "ISO 3166 country code of the country the user is from",
  },
  {
    key: "strongAuth",
    type: "bool",
    description: "Context attribute if a user entered TOTP code",
  },
];

const createUserAttribute = async (attribute) => {
  const { project, environment } = permit.config.apiContext;
  const response = await fetch(
    `https://api.permit.io/v2/schema/${project}/${environment}/users/attributes`,
    {
      method: "POST",
      body: JSON.stringify(attribute),
      headers: {
        Authorization: `Bearer ${process.env.PERMIT_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );
  return response.json();
};

const createElement = async (element) => {
  const { project, environment } = permit.config.apiContext;
  const response = await fetch(
    `https://api.permit.io/v2/elements/${project}/${environment}/config`,
    {
      method: "POST",
      body: JSON.stringify(element),
      headers: {
        Authorization: `Bearer ${process.env.PERMIT_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );
  return response.json();
};

const updateElement = async (key, element) => {
  const { project, environment } = permit.config.apiContext;
  const response = await fetch(
    `https://api.permit.io/v2/elements/${project}/${environment}/config/${key}`,
    {
      method: "PATCH",
      body: JSON.stringify(element),
      headers: {
        Authorization: `Bearer ${process.env.PERMIT_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );
  return response.json();
};

const createUserAttributes = async () => {
  const { project, environment } = permit.config.apiContext;
  const response = await fetch(
    `https://api.permit.io/v2/schema/${project}/${environment}/users/attributes`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PERMIT_API_KEY}`,
      },
    },
  );
  const schema = await response.json();
  console.log(`Found ${schema.length - 3} custom user attributes`);
  const missingAttributes = USER_ATTRIBUTES_CONFIG.filter(
    (attr) => !schema.find((s) => s.key === attr.key),
  );
  console.log(`Creating ${missingAttributes.length} missing attributes`);
  await Promise.all(missingAttributes.map((attr) => createUserAttribute(attr)));
  console.log("User attributes created");
};

const createElementsConfig = async () => {
  const { project, environment } = permit.config.apiContext;
  const response = await fetch(
    `https://api.permit.io/v2/elements/${project}/${environment}/config`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PERMIT_API_KEY}`,
      },
    },
  );
  const elements = await response.json();
  console.log(`Found ${elements.data.length} elements`);
  const missingElements = Object.keys(ELEMENTS_CONFIG).filter(
    (element) => !elements.data.find((e) => e.key === element),
  );
  console.log(`Creating ${missingElements.length} missing elements`);
  const elementsResponse = await Promise.all(
    missingElements.map((key) =>
      createElement({
        key,
        ...ELEMENTS_CONFIG[key],
      }),
    ),
  );
  const userManagementElement = elementsResponse.find(
    (element) => element.key === "account-members-management",
  );
  const wireTransferRequestElement = elementsResponse.find(
    (element) => element.key === "wire-transfer-request",
  );
  if (userManagementElement && wireTransferRequestElement) {
    await updateElement("account-members-management", {
      ...ELEMENTS_CONFIG["account-members-management"],
      settings: {
        ...ELEMENTS_CONFIG["account-members-management"].settings,
        approvalFlowElement: wireTransferRequestElement.id,
      },
    });
    console.log("Updated user management element");
    await updateElement("wire-transfer-request", {
      ...ELEMENTS_CONFIG["wire-transfer-request"],
      settings: {
        ...ELEMENTS_CONFIG["wire-transfer-request"].settings,
        selectedUserManagementElement: userManagementElement.id,
      },
    });
    console.log("Updated wire transfer request element");
  }
};

(async () => {
  // a small hack to set the project and environment
  await permit.api.projects.list();
  console.log('Permit Environment ID:', permit.config.apiContext.environment);
  switch (STEP) {
    case "0":
      console.log("Creating user attributes");
      try {
        await createUserAttributes();
      } catch (error) {
        console.error(`Failed to create user attributes: ${error}`);
      }
      break;
    case "1":
      console.log("Creating elements config");
      try {
        await createElementsConfig();
      } catch (error) {
        console.error(`Failed to create elements config: ${error}`);
      }
      break;
    default:
      console.log("Unknown step");
      break;
  }
})();
