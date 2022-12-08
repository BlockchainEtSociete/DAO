import { Button, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { useState } from "react";
import useEthContext from "../../hooks/useEthContext";
import ipfs from "../Common/Ipfs";
import EmployeeCardImageDisplay from "./EmployeeCardImageDisplay";
import EmployeeCardImageGenerator, { generateCardImage } from "./EmployeeCardImageGenerator";
import TokenBalance from "./TokenBalance";

export interface EmployeeCardMetadata {
    "description": string; 
    "external_url": string;
    "image": string;
    "name": string;
    "attributes": [
        {
            "trait_type": "Picture",
            "value": string;
        },
        {
            "trait_type": "Firstname",
            "value": string;
        },
        {
            "trait_type": "Lastname",
            "value": string;
        },
        {
            "trait_type": "Role",
            "value": string;
        },
        {
            "trait_type": "Service",
            "value": string;
        },
        {
            "trait_type": "Contract type",
            "value": string;
        },
        {
            "trait_type": "Contract category",
            "value": string;
        },
        {
            "trait_type": "Birth date",
            "value": string;
        },
        {
            "trait_type": "Start date",
            "value": string;
        },
        {
            "trait_type": "End date",
            "value": string;
        }
    ]
}

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
    const [service, setService] = useState('');
    const [role, setRole] = useState('');
    const [contractType, setContractType] = useState('');
    const [contractCategory, setContractCategory] = useState('');
    const [picture, setPicture] = useState('');
    const [, setFile] = useState(null);
    const [wallet, setWallet] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);

    const [cardInfos, setCardInfos] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        startDate: '',
        photo: ''
    });
    const [cardDataUrl, setCardDataUrl] = useState('');
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
    const handleServiceChange = (event: any) => {
        setService(event.target.value);
    }
    const handleRoleChange = (event: any) => {
        setRole(event.target.value);
    }
    const handleContractTypeChange = (event: any) => {
        setContractType(event.target.value);
    }
    const handleContractCategoryChange = (event: any) => {
        setContractCategory(event.target.value);
    }
    const handlePictureChange = (event: any) => {
        setPictureBase64(event.target.files[0]);
    };
    const handleWalletAddress = async (event: any) => {
        setErrorMessage('');
        setWalletBalance(0);
        setTokenId('');
        setWallet(event.target.value);

        if (event.target.value !== '' && event.target.value.match(/(\b0x[a-fA-F0-9]{40}\b)/g)) {
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

    const mintCard = async (tokenURI: string) => {
        setMinting(true);

        const mintedTokenId = await contract?.methods.mint(wallet, tokenURI).send({from: accounts[0]})
        .on("transactionHash", async (transactionHash: string   ) => {
            setSuccessMessage(`Minting in progress, transaction number: Transaction number: ${transactionHash}`);
        })
        .catch ((mintErr: Error) => {
            console.log(mintErr.message);
            setErrorMessage(`Minting: ${mintErr.message}`);

            setMinting(false);

            return false;
        });

        setTokenId(mintedTokenId);
        setSuccessMessage(`Minting finished ! :)`);

        return true;
    }

    const generateNFTMetadataAndUploadToIpfs = async (
        imageUri: string, 
        pictureUri: string, 
        newCardInfos: any,
    ) => {
        const NFTMetaData: EmployeeCardMetadata = {
            "description": "Professional decentralized identity and proof of experience.", 
            "external_url": "https://www.alyra.fr", 
            "image": imageUri, 
            "name": "Alyra Employee Card",
            "attributes": [
                {
                    "trait_type": "Picture",
                    "value": pictureUri,
                },
                {
                    "trait_type": "Firstname",
                    "value": newCardInfos.firstName,
                },
                {
                    "trait_type": "Lastname",
                    "value": newCardInfos.lastName,
                },
                {
                    "trait_type": "Role",
                    "value": newCardInfos.role,
                },
                {
                    "trait_type": "Service",
                    "value": newCardInfos.service,
                },
                {
                    "trait_type": "Contract type",
                    "value": newCardInfos.contractType,
                },
                {
                    "trait_type": "Contract category",
                    "value": newCardInfos.contractCategory,
                },
                {
                    "trait_type": "Birth date",
                    "value": newCardInfos.birthDate,
                },
                {
                    "trait_type": "Start date",
                    "value": newCardInfos.startDate,
                },
                {
                    "trait_type": "End date",
                    "value": '',
                },
                
            ]
        };

        const metadataString = JSON.stringify(NFTMetaData);
        const ipfsResponse = await ipfs.add(metadataString, {pin:true}).catch((err: Error) => {
            console.log(err.message);
            setErrorMessage(`IPFS: ${err.message}`);

            setMinting(false);
        });

        if (ipfsResponse) {
            const tokenURI = 'ipfs://' + ipfsResponse.cid;
            console.log(tokenURI);
            
            const minted = await mintCard(tokenURI);

            console.log(minted);
        }

        setMinting(false);
    }

    const validateFormAndMint = async (event: any) => {
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

        if (!firstName || firstName.length === 0) {
            alert("Firstname is mandatory");
            return false;
        }

        if (!lastName || lastName.length === 0) {
            alert("Lastname is mandatory");
            return false;
        }

        if (!picture) {
            alert("You must upload a picture");
        }


        const newCardInfos = {
            firstName,
            lastName,
            birthDate,
            startDate,
            service,
            role,
            contractType,
            contractCategory,
            photo: picture
        };
        setCardInfos(newCardInfos);

        const pictureFile = await dataUrlToFile(`data:image/*;${newCardInfos.photo}`)
        const ipfsPictureUploadResult = await ipfs.add(pictureFile, {pin:true}).catch((err: Error) => {
            console.log(err.message);
            setErrorMessage(`IPFS: ${err.message}`);

            setMinting(false);
        });

        if (ipfsPictureUploadResult) {
            const pictureUri = `ipfs://${ipfsPictureUploadResult.cid}`
            console.log(pictureUri)

            const cardBase64 = await generateCardImage(newCardInfos)

            if (cardBase64 && cardBase64 !== 'data:image/*;' && cardBase64 !== 'data:,') {
                setCardDataUrl(cardBase64)

                const cardFile = await dataUrlToFile(cardBase64)

                const ipfsImageUploadResult = await ipfs.add(cardFile, {pin:true}).catch((err: Error) => {
                    console.log(err.message)
                    setErrorMessage(`IPFS: ${err.message}`)

                    setMinting(false)
                });

                if (ipfsImageUploadResult) {
                    const imageUri = `ipfs://${ipfsImageUploadResult.cid}`;
                    console.log('ipfs://' + ipfsImageUploadResult.cid);

                    generateNFTMetadataAndUploadToIpfs(
                        imageUri, 
                        pictureUri,
                        newCardInfos
                    );
                }
            }
        }
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

    return (
        <div>
            <div style={{margin: '20px'}}>
                <p>Contract address: {contract._address}</p>
                <TokenBalance account={wallet} />
                <EmployeeCardImageDisplay tokenId={tokenId} />
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
                        <TextField fullWidth={true} name="startdate" label="Start date" onChange={handleStartDateChange}></TextField>
                    </div>
                    <div className="form-item">
                        <TextField fullWidth={true} name="service" label="Service" onChange={handleServiceChange}></TextField>
                    </div>
                    <div className="form-item">
                        <TextField fullWidth={true} name="role" label="Role" onChange={handleRoleChange}></TextField>
                    </div>
                    <div className="form-item">
                        <InputLabel id="contract-type-label">Contract type</InputLabel>
                        <Select fullWidth={true} name="contract_type" labelId="contract-type-label" label="Contract type" onChange={handleContractTypeChange}>
                            <MenuItem value={'CDI'}>CDI</MenuItem>
                            <MenuItem value={'CDD'}>CDD</MenuItem>
                            <MenuItem value={'Freelance'}>Freelance</MenuItem>
                            <MenuItem value={'Interim'}>Interim</MenuItem>
                        </Select>
                    </div>
                    <div className="form-item">
                        <InputLabel id="contract-type-label">Contract category</InputLabel>
                        <Select fullWidth={true} name="contract_category" labelId="contract-category-label" label="Contract category" onChange={handleContractCategoryChange}>
                            <MenuItem value={'Employee'}>Employee</MenuItem>
                            <MenuItem value={'Executive'}>Executive</MenuItem>
                        </Select>
                    </div>
                    <div className="form-item">
                        <InputLabel>Photo</InputLabel>
                        <TextField fullWidth={true} name="picture" type="file" onChange={handlePictureChange} />
                    </div>
                    <div className="form-item" style={{textAlign: 'center'}}>
                        <Button variant="contained" type="submit" disabled={minting || walletBalance > 0}>
                            Mint the employee card
                        </Button>
                    </div>
                </form>
                <EmployeeCardImageGenerator cardInfos={cardInfos} cardDataUrl={cardDataUrl} />
            </div>

            <style>{`
                .form-item {
                    margin: 20px;
                }
                #generatedCard {
                    display: none;
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
