import { useEffect, useState } from "react";
import useEthContext from "../../hooks/useEthContext";

type TokenBalanceProps = {
  account: string;
};

const TokenBalance = ({ account }: TokenBalanceProps) => {
    const { state: { accounts, contract } } = useEthContext()
    const [tokenBalance, setTokenBalance] = useState(0)

    useEffect(() => {
        (async () => {
          if (account) {
            const balance = await contract?.methods?.balanceOf(account).call({from: account})

            if (balance) {
                setTokenBalance(balance)
            }
          }
        })()
    }, [tokenBalance, setTokenBalance, accounts, contract, account])

  return (
    <p>
      The entered wallet address has already {tokenBalance ?? 0} employee card
    </p>
  );
};

export default TokenBalance;