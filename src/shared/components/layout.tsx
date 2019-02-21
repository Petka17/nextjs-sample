import React from "react";
import * as auth from "shared/state/auth";

function layout(Component: typeof React.Component | React.FC) {
  return () => (
    <auth.Provider>
      <Component />
    </auth.Provider>
  );
}

export default layout;
