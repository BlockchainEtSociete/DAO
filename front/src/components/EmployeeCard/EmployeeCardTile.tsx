import { MouseEvent, useState } from "react";
import "./EmployeeCardTile.scss"

interface EmployeeCardTileProps {
    tokenId: string;
    picture: string;
    lastname: string;
    firstname: string;
    service: string;
    role: string;
    handleSelectedCard: Function;
}

const EmployeeCardTile = ({ tokenId, picture, lastname, firstname, service, role, handleSelectedCard }: EmployeeCardTileProps) => {
    const handleEmployeeCardClick = (event: MouseEvent<HTMLElement>) => {
        handleSelectedCard(tokenId)
    }

    return (
        <>
            <figure className="tile" onClick={handleEmployeeCardClick}>
                <div className="tileIcon">
                    <img src={`data:image/*;base64,${picture}`} alt={firstname + ' ' + lastname} className="tileIconImage" />           
                </div>
                <div className="tileLabel">
                    <div><span>Name:</span> {lastname}</div>
                    <div><span>Firstname:</span> {firstname}</div>
                    <div><span>Service:</span> {service}</div>
                    <div><span>Role:</span> {role}</div>
                </div>
            </figure>
        </>
    )
}

export default EmployeeCardTile