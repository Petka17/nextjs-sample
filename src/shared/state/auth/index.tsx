import React from "react";
import { requestCode } from "shared/api/auth";

import {
  CodeRequestFail,
  CodeRequestSuccess,
  SetPhone,
  StartCodeRequest,
  SetCode
} from "./action";
import { initialState, reducer } from "./state";

/**
 * Context for React Component
 */
interface Context {
  phone: string;
  setPhone: Function;
  canStartCodeRequest: boolean;
  startCodeRequest: Function;
  errorMessage: string;
  codeInputFlag: boolean;
  code: string;
  setCode: Function;
}

const defaultAuth: Context = {
  phone: initialState.phone,
  setPhone: new Function(),
  canStartCodeRequest: false,
  startCodeRequest: new Function(),
  errorMessage: initialState.errorMessage,
  codeInputFlag: initialState.codeInputFlag,
  code: initialState.code,
  setCode: new Function()
};

const ContextFactory = React.createContext<Context>(defaultAuth);

/**
 * Provider
 */
export function Provider({ children }: { children: React.ReactNode }) {
  const [
    { phone, isLoading, errorMessage, codeInputFlag, code },
    dispatch
  ] = React.useReducer(reducer, initialState);

  const setPhone = (phone: string) => dispatch(new SetPhone(phone));

  const canStartCodeRequest = phone.length === 11 && !isLoading;

  const startCodeRequest = () => {
    dispatch(new StartCodeRequest());

    requestCode(phone)
      .then((resp: string) => {
        dispatch(new CodeRequestSuccess(resp));
      })
      .catch((err: Error) => {
        dispatch(new CodeRequestFail(err.message));
      });
  };

  const setCode = (code: string) => {
    dispatch(new SetCode(code));
  };

  const context: Context = {
    phone,
    setPhone,
    canStartCodeRequest,
    startCodeRequest,
    errorMessage,
    codeInputFlag,
    code,
    setCode
  };

  return (
    <ContextFactory.Provider value={context}>
      {children}
    </ContextFactory.Provider>
  );
}

export const getContext = () => React.useContext(ContextFactory);
