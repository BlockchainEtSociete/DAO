import { useContext } from "react";
import EthContext from "../contexts/EthContext/EthContext";

const useEthContext = () => useContext(EthContext);

export default useEthContext;
