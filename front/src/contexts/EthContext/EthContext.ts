import { createContext } from "react";
import { initialState } from "./state";

const defaultDispatch: React.Dispatch<any> = () => initialState
const EthContext = createContext({
  state: initialState,
  dispatch: defaultDispatch
})

export default EthContext;
