import "EmployeeCardTile.styles.css"

interface EmployeeCardTileProps {
    picture: string;
    lastname: string;
    firstname: string;
    service: string;
    role: string;
}

const EmployeeCardTile = ({ picture, lastname, firstname, service, role }: EmployeeCardTileProps) => {
    return (
        <>
            <figure className="tile">
                <div className="tileIcon">
                    <img src={picture} alt={firstname + ' ' + lastname} className="tileIconImage" />           
                </div>
                <div className="tileLabel">
                    <div>Name: {lastname}</div>
                    <div>Firstname: {firstname}</div>
                    <div>Service: {service}</div>
                    <div>Role: {role}</div>
                </div>
            </figure>
        </>
    )
}

export default EmployeeCardTile