import React from "react";
import { LanguageProvider } from "./utils/LanguageContext";
import App from "./App";

const AppWrapper: React.FC = () => {
  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
};

export default AppWrapper;
