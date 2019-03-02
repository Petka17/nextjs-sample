import { digitOnly } from "../string";

test("Clear Phone should remove all non-digit characters", () => {
  expect(digitOnly("79-34$5h87t43)")).toBe("793458743");
});
