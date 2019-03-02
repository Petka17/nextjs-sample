import * as _ from "jsonous";
import { makeRequest } from "./utils";

export const createCodeRequestBody = (phone: string) => ({
  phone
});

export const codeRequestUrl = "/api/login/request_code";

export const requestCode = (phone: string) =>
  makeRequest(
    codeRequestUrl,
    "post",
    createCodeRequestBody(phone),
    _.field("external_id", _.string)
  );
