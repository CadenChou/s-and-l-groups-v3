import "@/styles/globals.css";
import type { AppProps } from "next/app";
import AppContext from "../../utils/AppContext";
import { useState } from "react";
import React from "react";
import Navbar from "../components/Navbar";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App({ Component, pageProps }: AppProps) {
  const [authUser, setAuthUser] = React.useState<boolean>(false);
  const [numberGroups, setNumberGroups] = React.useState<string>("5");

  const contextVars = {
    authUser,
    setAuthUser,
    numberGroups,
    setNumberGroups,
  };

  return (
    <AppContext.Provider
      value={{
        authUser,
        setAuthUser,
        numberGroups,
        setNumberGroups,
      }}
    >
      <Navbar />
      <main className="pb-20">
        <Component {...pageProps} />
      </main>
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </AppContext.Provider>
  );
}
