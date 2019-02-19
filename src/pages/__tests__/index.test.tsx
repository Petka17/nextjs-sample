import React from "react";
import { render } from "react-testing-library";
// import { axe } from "jest-axe";

import Main from "..";

// test("check for accessibility", async () => {
//   const { container } = render(<Main />);
//   const results = await axe(container.innerHTML);
//   expect(results).toHaveNoViolations();
// });

test("main component has some test", () => {
  const { container } = render(<Main />);
  expect(container).toHaveTextContent(/next\.js/i);
});
