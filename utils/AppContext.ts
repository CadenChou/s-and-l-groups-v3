import { createContext } from "react";

interface ContextVars {
  authUser: boolean;
  setAuthUser: (auth: boolean) => void;
  numberGroups: string;
  setNumberGroups: (num: string) => void;
}

const AppContext = createContext<ContextVars>({
  authUser: false,
  setAuthUser: () => {},
  numberGroups: "5",
  setNumberGroups: () => {},
});

export default AppContext;
