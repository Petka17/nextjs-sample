import React from "react";
import { requestCode } from "shared/api/auth";
import { clearPhone } from "shared/utils/string";

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

export const Context = React.createContext<AuthInterface>(defaultAuth);

export function Provider({ children }: { children: React.ReactNode }) {
  const [phone, setPhone] = React.useState(defaultAuth.phone);

  const setClearPhone = (phone: string) => {
    setPhone(clearPhone(phone).slice(0, 11));
  };

  const startCodeRequest = () => {
    requestCode(phone);
    console.info(`TODO: make real request with ${phone}`);
  };

  const canStartCodeRequest = phone.length === 11;

  const state = {
    phone,
    setPhone: setClearPhone,
    canStartCodeRequest,
    startCodeRequest
  };

  return <Context.Provider value={state}>{children}</Context.Provider>;
}

export const getState = () => React.useContext(Context);
