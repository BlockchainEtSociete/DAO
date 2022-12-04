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

            const html2pdfWorker = new html2pdf.Worker;
            const cardDataUrl = await html2pdfWorker
                .set({
                    margin:1,
                    unit: 'px',
                    orientation: Landscape,
                    jsPDF: {format: [100, 100]}
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
                <div className="companyLogo">
                    <img src="/logo.png" alt="Logo" id="companyLogo" />
                </div>
                <div className="employeePicture">
                    <div className="picture">
                        <img src={`data:image/*;${cardInfos.photo}`} alt="picture" id="employeePicture" />
                    </div>
                    <div className="employeeCardDetails">
                        <p id="employeeFirstname">{cardInfos.firstName}</p>
                        <p id="employeeLastname">{cardInfos.lastName}</p>
                        <p id="employeeBirthdate">{cardInfos.birthDate}</p>
                        <p id="employeeStartdate">{cardInfos.startDate}</p>
                    </div>
                </div>
            </div>  
            <style>{`
                #cardPdf {
                    display: block;
                    position: relative;
                    width: 400px;
                    height: 200px;
                    margin: auto;
                    text-align: left;
                }
                #cardPdf .companyLogo > img {
                    position: absolute;
                    top: 20px;
                    left: 30px; 
                    width: 60px;
                    height: 60px;
                }
                #cardPdf .employeePicture {
                    float: none;
                    clear: both;
                    padding: 50px 0 0 90px;
                }
                #cardPdf .employeePicture .picture {
                    float: left;
                }
                #cardPdf .employeePicture .picture > img {
                    width: 100px;
                    height: 100px;
                }
                #cardPdf .employeeCardDetails {
                    float: left;
                    margin-left: 20px;
                }
            `}</style>
        </>
    )
}

export default EmployeeCardImageGenerator
