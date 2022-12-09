import { Landscape } from "@mui/icons-material";
import html2pdf from "../../util/html2pdf";

export interface EmployeeCardInfos { 
    firstName: string;
    lastName: string;
    birthDate: string;
    startDate: string;
    photo: string;
}

export interface EmployeeCardImageGeneratorProps {
    cardInfos: EmployeeCardInfos,
    cardDataUrl: string
}

export const generateCardImage = async (cardInfos: EmployeeCardInfos) => {
    if (cardInfos.photo !== '') {
        const element = document.getElementById('cardPdf');
        if (element) {
            element.style.display = 'block';

            const html2pdfWorker = new html2pdf.Worker();
            const cardDataUrl = await html2pdfWorker
                .set({
                    margin:1,
                    unit: 'px',
                    orientation: Landscape,
                    jsPDF: {format: [125, 125]}
                })
                .from(element)
                .toImg()
                .outputImg('dataurl');

            return cardDataUrl;
        }
    }
    return '';
}

export const EmployeeCardImageGenerator = ({cardInfos, cardDataUrl}: EmployeeCardImageGeneratorProps) => {
    return (
        <>
            <div>
                <img id="generatedCard" src={cardDataUrl} alt="card"></img>
            </div>
            <div id="cardPdf" style={{display: 'none'}}>
                <div className="logos">
                    <div className="companyLogo">
                        <img src="/logo.png" alt="Logo" id="companyLogo" />
                    </div>
                    <div className="pictureBrand">
                        <img src="/WorkID_small.png" alt="WorkID" />
                    </div>
                </div>
                <div className="employeeDetails">
                    <div className="employeePicture">
                        <div className="picture">
                            <img src={`data:image/*;${cardInfos.photo}`} alt="Employee" id="employeePicture" />
                        </div>
                    </div>
                    <div className="employeeCardDetails">
                        <div id="employeeFirstname"><span className="label">Firstname:</span> {cardInfos.firstName}</div>
                        <div id="employeeLastname"><span className="label">Lastname:</span> {cardInfos.lastName}</div>
                        <div id="employeeBirthdate"><span className="label">Birth date:</span> {cardInfos.birthDate}</div>
                        <div id="employeeStartdate"><span className="label">Start date:</span> {cardInfos.startDate}</div>
                    </div>
                </div>
            </div>  
            <style>{`
                #cardPdf {
                    display: block;
                    position: relative;
                    height: 220px;
                    width: 440px;
                    margin: auto;
                    padding: 0 20px 0 0;
                    background-color: white;
                    color: black;
                    border: 1px solid black;
                    text-align: left;
                }
                #cardPdf .logos {
                    clear: both;
                    position: relative;
                }
                #cardPdf .companyLogo {
                    float: left;
                }
                #cardPdf .pictureBrand {
                    text-align: right;
                    float: right;
                    margin-top: 30px;
                }
                #cardPdf .companyLogo > img {
                    position: absolute;
                    top: 20px;
                    left: 30px; 
                    width: 60px;
                    height: 60px;
                }
                #cardPdf .employeeDetails {
                    clear: both;
                    padding: 20px 0 0 90px;
                }
                #cardPdf .employeePicture {
                    float: none;
                    clear: both;
                }
                #cardPdf .employeePicture .picture {
                    float: left;
                }
                #cardPdf .employeePicture .picture > img {
                    width: 100px;
                    height: 100px;
                }
                #cardPdf span.label {
                    font-weight: bold;
                }
                #cardPdf .employeeCardDetails {
                    float: left;
                    margin: 8px 0 0 20px;
                }
            `}</style>
        </>
    )
}

export default EmployeeCardImageGenerator
