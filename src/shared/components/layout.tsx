import React from "react";
import * as auth from "shared/contexts/auth";

function layout(Component) {
  return () => (
    <auth.Provider>
      <Component />
    </auth.Provider>
  );
}

export default layout;
