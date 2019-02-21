import { BaseAction } from "shared/state/common";

/**
 * Actions
 */
export class SetPhone implements BaseAction {
  readonly type = "SET_PHONE";
  constructor(public phone: string) {}
}

export class StartCodeRequest implements BaseAction {
  readonly type = "START_CODE_REQUEST";
  constructor() {}
}

export class CodeRequestSuccess implements BaseAction {
  readonly type = "CODE_REQUEST_SUCCESS";
  constructor(public auth_token: string) {}
}

export class CodeRequestFail implements BaseAction {
  readonly type = "CODE_REQUEST_FAIL";
  constructor(public errorMessage: string) {}
}

export type Action =
  | SetPhone
  | StartCodeRequest
  | CodeRequestSuccess
  | CodeRequestFail;

// export default Action;
