import React, { useEffect } from "react";
import Router from "next/router";
import * as _ from "jsonous";

const getUserForToken = (): Promise<string> =>
  new Promise((resolve, _) => {
    setTimeout(() => {
      resolve("some_external_id");
    }, 1000);
  });

const defaultAuth: string = "";

const ContextFactory = React.createContext<typeof defaultAuth>(defaultAuth);

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [externalId, setExternalId] = React.useState<string | null>(null);

  useEffect(() => {
    getUserForToken()
      .then((externalId: string) => {
        setIsLoading(false);
        setExternalId(externalId);
      })
      .catch(() => {
        setIsLoading(false);
        Router.push(
          `/signin?redirectPath=${encodeURIComponent(Router.asPath || "")}}`
        );
      });
  }, []);

  return isLoading ? (
    <div>isLoading...</div>
  ) : externalId === null ? (
    <div>Redirect...</div>
  ) : (
    <ContextFactory.Provider value={externalId}>
      {children}
    </ContextFactory.Provider>
  );
}

export const getContext = () => React.useContext(ContextFactory);
