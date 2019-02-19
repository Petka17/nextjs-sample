import { clearPhone } from "../string";

test("Clear Phone should remove all non-digit characters", () => {
  expect(clearPhone("79-34$5h87t43)")).toBe("793458743");
});
