import React from "react";
import { fireEvent, render } from "react-testing-library";

import SigninPage from "../signin";
import { requestCode } from "shared/api/auth";

const mockRequestCode: jest.Mock<typeof Function> = requestCode as jest.Mock<
  typeof Function
>;

const renderPage = (phone = "") => {
  const utils = render(<SigninPage />);
  const phoneInput = utils.getByLabelText(/Телефон/) as HTMLInputElement;
  const getCodeButton = utils.getByText(/Запросить код/) as HTMLButtonElement;

  const fillPhone = (phone: string) => {
    fireEvent.change(phoneInput, { target: { value: phone } });
  };

  if (phone !== "") fillPhone(phone);

  return {
    ...utils,
    fillPhone,
    phoneInput,
    getCodeButton
  };
};

jest.mock("shared/api/auth", () => {
  return {
    requestCode: jest.fn(() => null)
  };
});

afterEach(() => {
  mockRequestCode.mockClear();
});

// test("check for accessibility", async () => {
//   const { container } = renderPage();
//   const results = await axe(container.innerHTML);
//   expect(results).toHaveNoViolations();
// });

test("Signin page should have phone input and submit button, and input should be focused", () => {
  const { phoneInput, getCodeButton } = renderPage();

  expect(phoneInput).toHaveAttribute("type", "tel");
  expect(phoneInput).toHaveFocus(); // not working properly
  expect(getCodeButton).toBeDisabled();
});

test("Signin page input should clear all non number character, apply formatting and not allow more than 11 numbers", () => {
  const { phoneInput, fillPhone } = renderPage();

  const phone = "75551*2f34)567er234";
  const clearedPhone = "75551234567";

  fillPhone(phone);

  expect(phoneInput.value).toBe(clearedPhone);
});

test("Signin page submit button should become enabled only if user fill correct phone", async () => {
  const { getCodeButton, fillPhone } = renderPage();

  expect(getCodeButton).toBeDisabled();
  fillPhone("7555111223");
  expect(getCodeButton).toBeDisabled();
  fillPhone("75551112233");
  expect(getCodeButton).toBeEnabled();
  fillPhone("75551112");
  expect(getCodeButton).toBeDisabled();
  fillPhone("75551112233");
  expect(getCodeButton).toBeEnabled();
});

test("When submit button is clicked, code request should fire", () => {
  const phone = "75551112233";
  const { getCodeButton } = renderPage(phone);

  expect(getCodeButton).toBeEnabled();

  fireEvent.click(getCodeButton);

  expect(mockRequestCode).toBeCalledTimes(1);
  expect(mockRequestCode).toBeCalledWith(phone);
});

test("If there are any errors in requesting code, the should be shown under the input", () => {
  // TODO: Simulate api error
});
