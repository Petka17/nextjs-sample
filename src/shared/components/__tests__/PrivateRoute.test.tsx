import React from "react";
import { render, wait } from "react-testing-library";
import { getUserForToken } from "shared/api/auth";
import Router from "next/router";

import { PrivateRoute, getContext } from "../PrivateRoute";

jest.mock("next/router");

const mockPush: jest.Mock = Router.push as jest.Mock;

jest.mock("shared/api/auth", () => {
  return {
    getUserForToken: jest.fn(
      () =>
        new Promise((resolve, _) => {
          console.log("run promise");
          setTimeout(() => {
            console.log("resolve promise");
            resolve("some_external_id");
          }, 1000);
        })
    )
  };
});

jest.mock("next/router");

const mockGetUserForToken: jest.Mock = getUserForToken as jest.Mock;

afterEach(() => {
  mockGetUserForToken.mockClear();
});

const TestComp = () => {
  const externalId = getContext();
  return <div>{externalId}</div>;
};

test("should ", async () => {
  const { getByText } = render(
    <PrivateRoute>
      <div>secret content</div>
    </PrivateRoute>
  );

  expect(mockGetUserForToken).toBeCalledTimes(1);
  expect(getByText(/loading/i)).toBeInTheDocument();

  await wait(() => expect(getByText("secret content")).toBeInTheDocument());
});

test("should 2", async () => {
  const { getByText } = render(
    <PrivateRoute>
      <TestComp />
    </PrivateRoute>
  );

  expect(mockGetUserForToken).toBeCalledTimes(1);
  expect(getByText(/loading/i)).toBeInTheDocument();
  await wait(() => expect(getByText("some_external_id")).toBeInTheDocument());
});

test("should 3", async () => {
  mockGetUserForToken.mockReturnValueOnce(Promise.reject());

  const { getByText } = render(
    <PrivateRoute>
      <TestComp />
    </PrivateRoute>
  );

  expect(getByText(/loading/i)).toBeInTheDocument();
  await wait(() => expect(getByText(/redirect/i)).toBeInTheDocument());
  expect(mockPush).toBeCalledTimes(1);
});
