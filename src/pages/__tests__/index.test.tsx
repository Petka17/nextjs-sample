import React from "react";
import { render } from "react-testing-library";

import Main from "..";

test("main component has some test", () => {
  const { container } = render(<Main />);
  expect(container).toHaveTextContent(/next\.js/i);
});
