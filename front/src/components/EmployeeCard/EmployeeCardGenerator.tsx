import React, { useEffect, useState } from "react";
import ipfs from "../Common/Ipfs";
import TokenBalance from "./TokenBalance";
import useEthContext from "../../hooks/useEthContext";
import html2pdf from "../../util/html2pdf";
import { Button, InputLabel, TextField } from "@mui/material";
import EmployeeCardDisplay from "./EmployeeCardDisplay";

const EmployeeCardGenerator = () => {

    const { state: { contract, accounts } } = useEthContext()
    // manage minting state
    const [minting, setMinting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [startDate, setStartDate] = useState('');
    const [picture, setPicture] = useState('');
    const [, setFile] = useState(null);
    const [wallet, setWallet] = useState('');
    const [, setWalletBalance] = useState(0);

    const [tokenId, setTokenId] = useState('');

    const handleFirstNameChange = (event: any) => {
        setFirstName(event.target.value);
    };
    const handleLastNameChange = (event: any) => {
        setLastName(event.target.value);
    };
    const handleBirthDateChange = (event: any) => {
        setBirthDate(event.target.value);
    };
    const handleStartDateChange = (event: any) => {
        setStartDate(event.target.value);
    };
    const handlePictureChange = (event: any) => {
        setPictureBase64(event.target.files[0]);
    };
    const handleWalletAddress = async (event: any) => {
        setErrorMessage('');
        setWalletBalance(0);
        setTokenId('');
        setWallet(event.target.value);

        if (event.target.value != '' && event.target.value.match(/(\b0x[a-fA-F0-9]{40}\b)/g)) {
            const userBalance = await contract.methods.balanceOf(event.target.value).call({from: accounts[0]})
            .catch((err: Error) => {
                console.log(err.message);
                setWalletBalance(0);
            })

            setWalletBalance(userBalance);

            if (userBalance > 0) {
                const tokenId = await contract.methods.getEmployeeCardId(event.target.value).call({from: accounts[0]})
                setTokenId(tokenId)

                setErrorMessage('An employee can only have 1 card.');
            }
            else {
                setErrorMessage('');
            }
        }
    }

    const validateFormAndMint = (event: any) => {
        event.preventDefault();
        setMinting(false);
        setErrorMessage('');
        
        const dateFormatRegex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;
        if (!birthDate.match(dateFormatRegex)) {
            alert("Invalid birth date");
            return false;
        }
        if (!startDate.match(dateFormatRegex)) {
            alert("Invalid start date");
            return false;
        }

        if (!firstName || firstName.length == 0) {
            alert("Firstname is mandatory");
            return false;
        }

        if (!lastName || lastName.length == 0) {
            alert("Lastname is mandatory");
            return false;
        }

        if (!picture) {
            alert("You must upload a picture");
        }

        generateImageCard(firstName, lastName, birthDate, startDate, picture);
    };

    const setPictureBase64 = (file: any) => {
        setFile(file);

        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            setPicture(reader.result as string);
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    };
    
    const dataUrlToFile = async (src: string) => {
        return (fetch(src)
            .then(function(res) {
                return res.arrayBuffer();
            }))
            .then(function(buf) {
                return new File([buf], 'card.jpg', {type:'image/*'});
            })
    };

    const generateImageCard = async (fname: string, lname: string, bdate: string, sdate: string, pict: string) => {
        const employeePicture = document.getElementById('employeePicture');
        
        const employeeFirstnameElement = document.getElementById('employeeFirstname')
        const employeeLastnameElement = document.getElementById('employeeLastname')
        const employeeBirthdateElement = document.getElementById('employeeBirthdate')
        const employeeStartdateElement = document.getElementById('employeeStartdate')
        
        if (employeePicture)
            employeePicture.setAttribute('src', 'data:image/*;' + pict);

        if(employeeFirstnameElement)
            employeeFirstnameElement.innerHTML = fname;
        if(employeeLastnameElement)
            employeeLastnameElement.innerHTML = lname;
        if(employeeBirthdateElement)
            employeeBirthdateElement.innerHTML = bdate;
        if (employeeStartdateElement)
            employeeStartdateElement.innerHTML = sdate;

        const element = document.getElementById('cardPdf');
        if (element)
            element.style.display = 'block';
        
        var html2pdfWorker = new html2pdf.Worker;
        html2pdfWorker.from(element).toImg().outputImg('dataurl').then((cardBase64: string) => {            
            dataUrlToFile(cardBase64)
            .then((cardFile) => {
                ipfs.add(cardFile, {pin:true})
                .then(response => {
                    const imageUri = `ipfs://${response.cid}`;
                    console.log('ipfs://' + response.cid);

                    generateNFTMetadataAndUploadToIpfs(imageUri, fname, lname, bdate, sdate);
                }).catch((err: Error) => {
                    console.log(err.message);
                    setErrorMessage(`IPFS: ${err.message}`);

                    setMinting(false);
                });
            });
        });
    };
    
    const generateNFTMetadataAndUploadToIpfs = (imageUri: string, fname: string, lname: string, bdate: string, sdate: string) => {
        const NFTMetaData = {
            "description": "Alyra Employee Card", 
            "external_url": "https://www.alyra.fr", 
            "image": imageUri, 
            "name": "Alyra",
            "attributes": {
                "firstName": fname,
                "lastName": lname,
                "birthDate": bdate,
                "startDate": sdate,
            }
        };

        const splittedSDate: Array<string> = sdate.split('/');
        const dDateObj: Date = new Date(parseInt(splittedSDate[2]), parseInt(splittedSDate[1]) - 1, parseInt(splittedSDate[0]));

        const metadataString = JSON.stringify(NFTMetaData);
        ipfs.add(metadataString, {pin:true})
                .then(response => {
                    console.log('ipfs://' + response.cid);
                    setMinting(true);
                    
                    contract?.methods.mint(wallet, 'ipfs://' + response.cid, dDateObj.getTime()/1000).send({from: accounts[0]})
                    .on("transactionHash", async (transactionHash: string   ) => {
                        setSuccessMessage(`Minting in progress, transaction number: Transaction number: ${transactionHash}`);
                    })
                    .then((response: string) => {
                        setTokenId(response);
                        setSuccessMessage(`Minting finished ! :)`);
                    })
                    .catch ((mintErr: Error) => {
                        console.log(mintErr.message);
                        setErrorMessage(`Minting: ${mintErr.message}`);
    
                        setMinting(false);
                    });

                    setMinting(false);
                }).catch((err: Error) => {
                    console.log(err.message);
                    setErrorMessage(`IPFS: ${err.message}`);

                    setMinting(false);
                });
    }

    return (
        <div>
            <div style={{margin: '20px'}}>
                <p>Contract address: {contract._address}</p>
                <TokenBalance account={wallet} />
                <EmployeeCardDisplay tokenId={tokenId} />
                <div className="success_message">{successMessage}</div>
                <div className="error_message">{errorMessage}</div>
                <form method="post" id="mintForm" encType="multipart/form-data" onSubmit={validateFormAndMint}>
                    <div className="form-item">
                        <TextField fullWidth={true} name="ethaddress" label="Employee Ethereum wallet address" onChange={handleWalletAddress}></TextField>
                    </div>
                    <div className="form-item">
                        <TextField fullWidth={true} name="firstname" label="Firstname" onChange={handleFirstNameChange}></TextField>
                    </div>
                    <div className="form-item">
                        <TextField fullWidth={true} name="lastname" label="Lastname" onChange={handleLastNameChange}></TextField>
                    </div>
                    <div className="form-item">
                        <TextField fullWidth={true} name="birthdate" label="Birth date" onChange={handleBirthDateChange}></TextField>
                    </div>
                    <div className="form-item">
                        <TextField fullWidth={true} name="startdate" label="Start date in the company" onChange={handleStartDateChange}></TextField>
                    </div>
                    <div className="form-item">
                        <InputLabel>Photo</InputLabel>
                        <TextField fullWidth={true} name="picture" type="file" onChange={handlePictureChange} />
                    </div>
                    <div className="form-item" style={{textAlign: 'center'}}>
                        <Button variant="contained" type="submit" disabled={minting/* || walletBalance > 0*/}>
                            Mint your employee card
                        </Button>
                    </div>
                </form>
                <div>
                    <img id="generatedCard"></img>
                </div>
                <div id="cardPdf" style={{display: 'none'}}>
                    <div className="companyLogo">
                        <img src="/logo.png" alt="Logo" id="companyLogo" />
                    </div>
                    <div className="employeePicture">
                        <div className="picture">
                            <img src="" alt="picture" id="employeePicture" />
                        </div>
                        <div className="employeeCardDetails">
                            <p id="employeeFirstname"></p>
                            <p id="employeeLastname"></p>
                            <p id="employeeBirthdate"></p>
                            <p id="employeeStartdate"></p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .form-item {
                    margin: 20px;
                }
                #generatedCard {
                    display: none;
                }
                #cardPdf {
                    display: block;
                    position: relative;
                    width: 500px;
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
                .error_message {
                    color: red;
                    font-weight: bold;
                }
                .success_message {
                    color: green;
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
};

export default EmployeeCardGenerator;
