import React, { useReducer, useCallback, useEffect, ReactNode } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";

declare var window: any

interface EthProviderProps {
  children: ReactNode
}

const EthProvider = ({ children }: EthProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(
    async (
      cardArtifact: any,
      governanceArtifact: any
    ) => {
      if (cardArtifact && governanceArtifact) {
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        const accounts = await web3.eth.requestAccounts();
        const networkID = await web3.eth.net.getId();
        let owner, widOwner, governanceOwner;

        const abi = cardArtifact.abi;

        const governanceAbi = governanceArtifact.abi;
        let contract, widContract, governanceContract;
        try {
          if (cardArtifact.address && governanceArtifact.address) {
            contract = new web3.eth.Contract(abi, cardArtifact.address);
            governanceContract = new web3.eth.Contract(governanceAbi, governanceArtifact.address);
            owner = await contract.methods.owner().call();
            governanceOwner = await governanceContract.methods.owner().call();
          }
        } catch (err) {
          console.error(err);
        }
        
        dispatch({
          type: actions.init,
          data: { cardArtifact, governanceArtifact, web3, accounts, networkID, contract, widContract, governanceContract, owner, widOwner, governanceOwner }
        });
      }
    }, []);

  useEffect(() => {
    const tryInit = async () => {
      try {
        const networkName = "ganache";

        const cardArtifact = require(`../../contracts/${networkName}/MemberCard.json`);
        const governanceArtifact = require(`../../contracts/${networkName}/Governance.json`);
        init(cardArtifact, governanceArtifact);
      } catch (err) {
        console.error(err);
      }
    };

    tryInit();
  }, [init]);

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init(state.cardArtifact, state.governanceArtifact);
    };

    events.forEach(e => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.cardArtifact, state.governanceArtifact, state.widArtifact]);

  return (
    <EthContext.Provider value={{
      state,
      dispatch
    }}>
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
