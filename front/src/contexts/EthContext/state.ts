const actions = {
  init: "INIT",
  tx: "TRANSACTION",
}

const initialState: EthContextState = {
  artifact: null,
  web3: null,
  accounts: [],
  networkID: -1,
  contract: null,
  owner: null,
  transactionHash: '',
};

export interface EthContextState {
  artifact: any;
  web3: any;
  accounts: any[];
  networkID: number;
  contract: any;
  owner: any;
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
