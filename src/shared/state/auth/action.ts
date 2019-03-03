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

export class SetCode implements BaseAction {
  readonly type = "SET_CODE";
  constructor(public code: string) {}
}

export class StartLoginWithCode implements BaseAction {
  readonly type = "START_LOGIN_WITH_CODE";
  constructor() {}
}

export class LoginWithCodeSuccess implements BaseAction {
  readonly type = "LOGIN_WITH_CODE_SUCCESS";
  constructor() {}
}

export class LoginWithCodeFail implements BaseAction {
  readonly type = "LOGIN_WITH_CODE_FAIL";
  constructor(public errorMessage: string) {}
}

export type Action =
  | SetPhone
  | StartCodeRequest
  | CodeRequestSuccess
  | CodeRequestFail
  | SetCode
  | StartLoginWithCode
  | LoginWithCodeSuccess
  | LoginWithCodeFail;
