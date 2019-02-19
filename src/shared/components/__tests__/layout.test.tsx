import React from "react";
import { render } from "react-testing-library";

import layout from "../layout";

test("Layout should render children", () => {
  const someText = "children";
  const Component = () => <div>{someText}</div>;
  const ComponentWithLayout = layout(Component);
  const { getByText } = render(<ComponentWithLayout />);

  expect(getByText(someText)).toBeInTheDocument();
});
