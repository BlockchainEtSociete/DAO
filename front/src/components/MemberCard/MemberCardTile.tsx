import { MouseEvent, useState } from "react";
import "./MemberCardTile.scss"

interface MemberCardTileProps {
    tokenId: string;
    picture: string;
    lastname: string;
    firstname: string;
    handleSelectedCard: Function;
}

const MemberCardTile = ({ tokenId, picture, lastname, firstname, handleSelectedCard }: MemberCardTileProps) => {
    const handleMemberCardClick = (event: MouseEvent<HTMLElement>) => {
        handleSelectedCard(tokenId)
    }

    return (
        <>
            <figure className="tile" onClick={handleMemberCardClick}>
                <div className="tileIcon">
                    <img src={`data:image/*;base64,${picture}`} alt={firstname + ' ' + lastname} className="tileIconImage" />           
                </div>
                <div className="tileLabel">
                    <div><span>Nom:</span> {lastname}</div>
                    <div><span>Prénom:</span> {firstname}</div>
                </div>
            </figure>
        </>
    )
}

export default MemberCardTile