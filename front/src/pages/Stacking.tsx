import { useState } from "react";
import ERC20Balances from "../components/Governance/ERC20Balances";
import StackForm from "../components/Governance/StackForm";
import WIDMinter from "../components/Governance/WIDMinter";
import useEthContext from "../hooks/useEthContext";

const Stacking = () => {
    const { state: { accounts, widOwner } } = useEthContext()

    const [widBalance, setWidBalance] = useState(0);
    const [swidBalance, setSWidBalance] = useState(0);

    return (
        <>
            <ERC20Balances setWIDBalance={setWidBalance} WIDBalance={widBalance} SWIDBalance={swidBalance} setSWIDBalance={setSWidBalance} />
            {accounts[0] === widOwner && <><p>&nbsp;</p><WIDMinter setWIDBalance={setWidBalance} /></> }
            <p>&nbsp;</p>
            <StackForm setWIDBalance={setWidBalance} setSWIDBalance={setSWidBalance} />
        </>
    )
}

export default Stacking;