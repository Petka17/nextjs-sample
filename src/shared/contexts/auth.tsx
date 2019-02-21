import React from "react";
import { BaseAction, DeepReadOnly } from "shared/contexts/base";
import { requestCode } from "shared/api/auth";
import { clearPhone } from "shared/utils/string";

class SetPhoneAction implements BaseAction {
  readonly type = "SET_PHONE";
  constructor(public phone: string) {}
}

class StartCodeRequestAction implements BaseAction {
  readonly type = "START_CODE_REQUEST";
  constructor() {}
}

class CodeRequestSuccessAction implements BaseAction {
  readonly type = "CODE_REQUEST_SUCCESS";
  constructor(public auth_token: string) {}
}

class CodeRequestFailAction implements BaseAction {
  readonly type = "CODE_REQUEST_FAIL";
  constructor(public errorMessage: string) {}
}

type Action =
  | SetPhoneAction
  | StartCodeRequestAction
  | CodeRequestSuccessAction
  | CodeRequestFailAction;

type State = DeepReadOnly<{
  phone: string;
  isLoading: boolean;
  errorMessage: string;
}>;

const initialState: State = {
  phone: "",
  isLoading: false,
  errorMessage: ""
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_PHONE": {
      return {
        ...state,
        phone: clearPhone(action.phone).slice(0, 11)
      };
    }
    case "START_CODE_REQUEST": {
      console.info(`TODO: make real request with ${state.phone}`);
      requestCode(state.phone);
      return state;
    }
    case "CODE_REQUEST_SUCCESS": {
      return state;
    }
    case "CODE_REQUEST_FAIL": {
      return state;
    }
    default: {
      /* istanbul ignore next */
      const unreachableAction: never = action;
      /* istanbul ignore next */
      return unreachableAction;
    }
  }
};

interface AuthInterface {
  phone: string;
  setPhone: Function;
  canStartCodeRequest: boolean;
  startCodeRequest: Function;
}

const defaultAuth: AuthInterface = {
  phone: "",
  setPhone: new Function(),
  canStartCodeRequest: false,
  startCodeRequest: new Function()
};

export const ContextFactory = React.createContext<AuthInterface>(defaultAuth);

export function Provider({ children }: { children: React.ReactNode }) {
  const [{ phone }, dispatch] = React.useReducer(reducer, initialState);

  const setPhone = (phone: string) => dispatch(new SetPhoneAction(phone));

  const canStartCodeRequest = phone.length === 11;

  const startCodeRequest = () => {
    dispatch(new StartCodeRequestAction());
    requestCode(phone)
      .then(resp => {
        console.log(resp);
        dispatch(new CodeRequestSuccessAction(""));
      })
      .catch(err => dispatch(new CodeRequestFailAction(err)));
  };

  const context: AuthInterface = {
    phone,
    setPhone,
    canStartCodeRequest,
    startCodeRequest
  };

  return (
    <ContextFactory.Provider value={context}>
      {children}
    </ContextFactory.Provider>
  );
}

export const getState = () => React.useContext(ContextFactory);
