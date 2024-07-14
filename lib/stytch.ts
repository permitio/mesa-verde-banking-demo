import { StytchAPIError } from "@stytch/vanilla-js";
import * as stytch from "stytch";
const { STYTCH_PROJECT_ID, STYTCH_SECRET, STYTCH_PROJECT_ENV } = process.env;

let client: stytch.Client | undefined = undefined;

const loadStytch = (): stytch.Client => {
  if (!client) {
    client = new stytch.Client({
      project_id: STYTCH_PROJECT_ID || "",
      secret: STYTCH_SECRET || "",
      env: STYTCH_PROJECT_ENV === "live" ? stytch.envs.live : stytch.envs.test,
    });
  }

  return client;
};

export const auhtenticateOTP = async (
  code: string,
  method_id: string,
): Promise<string> => {
  console.log("Authenticating OTP", code, method_id);
  try {
    await client?.otps.authenticate({
      method_id,
      code: code.toString(),
    });
    return "";
  } catch (error: any) {
    const e = error as StytchAPIError;
    return e.error_message;
  }
};

export default loadStytch;
