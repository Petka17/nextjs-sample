import React from "react";
import * as auth from "shared/contexts/auth";

function layout(Component: typeof React.Component) {
  return () => (
    <auth.Provider>
      <Component />
    </auth.Provider>
  );
}

export default layout;
