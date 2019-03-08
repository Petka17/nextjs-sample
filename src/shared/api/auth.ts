import * as _ from "jsonous";
import { makeRequest } from "./utils";

/**
 * Request code
 */
export const codeRequestUrl = "/api/login/request_code";

export const createCodeRequestBody = (phone: string) => ({
  phone
});

export const codeRequestDecoder = _.field("external_id", _.string);

export const codeRequest = (phone: string) =>
  makeRequest(
    codeRequestUrl,
    "post",
    createCodeRequestBody(phone),
    codeRequestDecoder
  );

/**
 * Login with code
 */
export const loginWithCodeUrl = "/api/login/with_code";

export const createLoginWithCodeBody = (phone: string, code: string) => ({
  phone,
  code,
  profile_type: "employer"
});

export const loginWithCode = (phone: string, code: string) =>
  makeRequest(
    loginWithCodeUrl,
    "post",
    createLoginWithCodeBody(phone, code),
    _.field("auth_token", _.string)
  );

/**
 * Get User Status
 */

/* istanbul ignore next */
export const getUserForToken = (): Promise<string> =>
  new Promise((resolve, _) => {
    console.log("run promise");
    setTimeout(() => {
      console.log("resolve promise");
      resolve("some_external_id");
    }, 1000);
  });
