import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { LanguageProvider } from "./utils/LanguageContext";

test("renders loading screen title", () => {
  render(
    <LanguageProvider>
      <App />
    </LanguageProvider>,
  );
  const loadingTitle = screen.getByText(/D & N/i);
  expect(loadingTitle).toBeInTheDocument();
});
