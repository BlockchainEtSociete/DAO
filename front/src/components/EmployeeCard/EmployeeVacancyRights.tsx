import { useEffect, useState } from "react";
import useEthContext from "../../hooks/useEthContext";
import TokenBalance from "./TokenBalance";

const EmployeeVacancyRights = () => {
    const { state: { accounts, contract } } = useEthContext()
    const [employeeRights, setEmployeeRights] = useState('')

    useEffect(() => {
        (async () => {
            const vacancyRights = await contract?.methods?.getEmployeeVacationRights(accounts[0]).call({from: accounts[0]})

            if (vacancyRights) {
                setEmployeeRights(vacancyRights)
            }
        })()

    }, [accounts, contract])

    return (
        <div>
            <div>
                <p>Contract address: {contract._address}</p>
                <TokenBalance account={accounts[0]} />
                <br/>
                <div>
                    You&apos;ve {employeeRights} days of holidays.
                </div>
            </div>
        </div>
    );
};

export default EmployeeVacancyRights;
