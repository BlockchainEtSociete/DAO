const actions = {
  init: "INIT",
  tx: "TRANSACTION",
}

const initialState: EthContextState = {
  cardArtifact: null,
  widArtifact: null,
  governanceArtifact: null,
  web3: null,
  accounts: [],
  networkID: -1,
  contract: null,
  widContract: null,
  governanceContract: null,
  owner: null,
  widOwner: null,
  governanceOwner: null,
  transactionHash: '',
};

export interface EthContextState {
  cardArtifact: any;
  widArtifact: any;
  governanceArtifact: any;
  web3: any;
  accounts: any[];
  networkID: number;
  contract: any;
  widContract: any;
  governanceContract: any;
  owner: any;
  widOwner: any;
  governanceOwner: any;
  transactionHash: string;
}

export interface EthContextAction {
  type: string;
  data?: any;
}

const reducer = (state: EthContextState, action: EthContextAction) => {
  const { type, data } = action;
  switch (type) {
    case actions.init:
    case actions.tx:
      return { ...state, ...data }
    default:
      throw new Error("Undefined reducer action type");
  }
};

export {
  actions,
  initialState,
  reducer,
};
