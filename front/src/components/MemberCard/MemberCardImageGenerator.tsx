import { Landscape } from "@mui/icons-material";
import html2pdf from "../../util/html2pdf";

export interface MemberCardInfos { 
    firstName: string;
    lastName: string;
    startDate: string;
    photo: string;
}

export interface MemberCardImageGeneratorProps {
    cardInfos: MemberCardInfos,
    cardDataUrl: string
}

export const generateCardImage = async (cardInfos: MemberCardInfos) => {
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

export const MemberCardImageGenerator = ({cardInfos, cardDataUrl}: MemberCardImageGeneratorProps) => {
    return (
        <>
            <div>
                <img id="generatedCard" src={cardDataUrl} alt="card"></img>
            </div>
            <div id="cardPdf" style={{display: 'none'}}>
                <div className="logos">
                    <div className="companyLogo">
                        <img src="/BS_small.png" alt="Logo" id="companyLogo" />
                    </div>
                    <div className="pictureBrand">
                        Blockchain & Société
                    </div>
                </div>
                <div className="memberDetails">
                    <div className="memberPicture">
                        <div className="picture">
                            <img src={`data:image/*;${cardInfos.photo}`} alt="Member" id="memberPicture" />
                        </div>
                    </div>
                    <div className="memberCardDetails">
                        <div id="memberFirstname"><span className="label">Firstname:</span> {cardInfos.firstName}</div>
                        <div id="memberLastname"><span className="label">Lastname:</span> {cardInfos.lastName}</div>
                        <div id="memberStartdate"><span className="label">Start date:</span> {cardInfos.startDate}</div>
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
                    font-weight: 800;
                    font-size: 1.5rem;
                }
                #cardPdf .companyLogo > img {
                    position: absolute;
                    top: 20px;
                    left: 30px; 
                    width: 60px;
                    height: 60px;
                }
                #cardPdf .memberDetails {
                    clear: both;
                    padding: 40px 0 0 90px;
                }
                #cardPdf .memberPicture {
                    float: none;
                    clear: both;
                }
                #cardPdf .memberPicture .picture {
                    float: left;
                }
                #cardPdf .memberPicture .picture > img {
                    width: 100px;
                    height: 100px;
                }
                #cardPdf span.label {
                    font-weight: bold;
                }
                #cardPdf .memberCardDetails {
                    float: left;
                    margin: 8px 0 0 20px;
                }
            `}</style>
        </>
    )
}

export default MemberCardImageGenerator
