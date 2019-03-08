import React from "react";
import Router from "next/router";
import * as _ from "jsonous";

import { getUserForToken } from "shared/api/auth";

const defaultAuth: string = "";

const ContextFactory = React.createContext<typeof defaultAuth>(defaultAuth);

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [externalId, setExternalId] = React.useState<string | null>(null);

  React.useEffect(() => {
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
    <div>Loading...</div>
  ) : externalId === null ? (
    <div>Redirecting to signin...</div>
  ) : (
    <ContextFactory.Provider value={externalId}>
      {children}
    </ContextFactory.Provider>
  );
}

export const getContext = () => React.useContext(ContextFactory);
