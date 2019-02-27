import React from "react";
import { fireEvent, render, wait } from "react-testing-library";

import SigninPage from "../signin";
import { requestCode } from "shared/api/auth";

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
    requestCode: jest.fn(
      () =>
        new Promise((resolve, _) => {
          let wait = setTimeout(() => {
            clearTimeout(wait);
            resolve("auth_token");
          }, 500);
        })
    )
  };
});

const mockRequestCode: jest.Mock = requestCode as jest.Mock;

afterEach(() => {
  mockRequestCode.mockClear();
});

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

test("Signin page submit button should become enabled only if user fill correct phone", () => {
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

test("When submit button is clicked, code request should fire and button should become disabled", async () => {
  const phone = "75551112233";
  const { getCodeButton } = renderPage(phone);

  expect(getCodeButton).toBeEnabled();

  fireEvent.click(getCodeButton);

  expect(mockRequestCode).toBeCalledTimes(1);
  expect(mockRequestCode).toBeCalledWith(phone);

  expect(getCodeButton).toBeDisabled();

  await wait(() => expect(getCodeButton).toBeEnabled(), { timeout: 600 });
});

test("If there are any errors in requesting code, the should be shown under the input", async () => {
  const errorMessage = "error";
  const { getCodeButton, getByText, queryByText } = renderPage("75551112233");

  mockRequestCode.mockReturnValueOnce(Promise.reject(errorMessage));
  fireEvent.click(getCodeButton);
  await wait(() => expect(getByText(errorMessage)).toBeInTheDocument());

  fireEvent.click(getCodeButton);
  expect(queryByText(errorMessage)).toBeNull();
});
