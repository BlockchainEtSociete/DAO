import { AlertColor, Button, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import { ChangeEvent, useState } from "react";
import useEthContext from "../../hooks/useEthContext";
import ipfs from "../Common/Ipfs";
import SnackbarAlert from "../Common/SnackbarAlert";
import MemberCardImageDisplay from "./MemberCardImageDisplay";
import MemberCardImageGenerator, { generateCardImage } from "./MemberCardImageGenerator";
import TokenBalance from "./TokenBalance";

export interface MemberCardMetadata {
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
            "trait_type": "Start date",
            "value": string;
        },
    ]
}

const MemberCardGenerator = () => {
    const { state: { contract, accounts } } = useEthContext()

    // manage minting state
    const [minting, setMinting] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [picture, setPicture] = useState('');
    const [, setFile] = useState(null);
    const [wallet, setWallet] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);

    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [severity, setSeverity] = useState<AlertColor | undefined>('success')

    const [cardInfos, setCardInfos] = useState({
        firstName: '',
        lastName: '',
        startDate: '',
        photo: ''
    });
    const [cardDataUrl, setCardDataUrl] = useState('');
    const [tokenId, setTokenId] = useState('');

    const handleFirstNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFirstName(event.target.value);
    };
    const handleLastNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setLastName(event.target.value);
    };
    const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
        setStartDate(event.target.value);
    };
    const handlePictureChange = (event: ChangeEvent<HTMLInputElement>) => {
        const filesUploaded = event.currentTarget.files;
        if (filesUploaded && filesUploaded.length > 0) {
            setPictureBase64(filesUploaded[0]);
        }
    };
    const handleWalletAddress = async (event: ChangeEvent<HTMLInputElement>) => {
        setOpen(false) 
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
                const tokenId = await contract.methods.getMemberCardId(event.target.value).call({from: accounts[0]})
                setTokenId(tokenId)

                setMessage('An member can only have 1 card.')
                setSeverity('error')
                setOpen(true) 
            }
        }
    }

    const mintCard = async (tokenURI: string) => {
        setMinting(true);

        const mintedTokenId = await contract?.methods.mint(wallet, tokenURI).send({from: accounts[0]})
        .on("transactionHash", async (transactionHash: string   ) => {
            setMessage(`Minting in progress, transaction number: Transaction number: ${transactionHash}`)
            setSeverity('success')
            setOpen(true) 
        })
        .catch ((mintErr: Error) => {
            console.log(mintErr.message);
            setMessage(`Minting: ${mintErr.message}`)
            setSeverity('error')
            setOpen(true)

            setMinting(false);

            return false;
        });

        setTokenId(mintedTokenId);
        setMessage('Minting finished ! :)')
        setSeverity('success')
        setOpen(true) 

        return true;
    }

    const generateNFTMetadataAndUploadToIpfs = async (
        imageUri: string, 
        pictureUri: string, 
        newCardInfos: any,
    ) => {
        const NFTMetaData: MemberCardMetadata = {
            "description": "Professional decentralized identity and proof of experience.", 
            "external_url": "https://www.alyra.fr", 
            "image": imageUri, 
            "name": "Alyra Member Card",
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
                    "trait_type": "Start date",
                    "value": newCardInfos.startDate,
                },                
            ]
        };

        const metadataString = JSON.stringify(NFTMetaData);
        const ipfsResponse = await ipfs.add(metadataString, {pin:true}).catch((err: Error) => {
            console.log(err.message);

            setMessage(`IPFS: ${err.message}`)
            setSeverity('error')
            setOpen(true)

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
        
        const dateFormatRegex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;
        if (!startDate.match(dateFormatRegex)) {
            setMessage('Invalid start date')
            setSeverity('error')
            setOpen(true)
            return false;
        }

        if (!firstName || firstName.length === 0) {
            setMessage('Firstname is mandatory')
            setSeverity('error')
            setOpen(true)
            return false;
        }

        if (!lastName || lastName.length === 0) {
            setMessage('Lastname is mandatory')
            setSeverity('error')
            setOpen(true)
            return false;
        }

        if (!picture) {
            setMessage('You must upload a picture')
            setSeverity('error')
            setOpen(true)
            return false;
        }


        const newCardInfos = {
            firstName,
            lastName,
            startDate,
            photo: picture
        };
        setCardInfos(newCardInfos);

        const pictureFile = await dataUrlToFile(`data:image/*;${newCardInfos.photo}`)
        const ipfsPictureUploadResult = await ipfs.add(pictureFile, {pin:true}).catch((err: Error) => {
            console.log(err.message);
            setMessage(`IPFS: ${err.message}`)
            setSeverity('error')
            setOpen(true)

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
                    setMessage(`IPFS: ${err.message}`)
                    setSeverity('error')
                    setOpen(true)

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
                <TokenBalance account={wallet} />
                <MemberCardImageDisplay tokenId={tokenId} />
                <form method="post" id="mintForm" encType="multipart/form-data" onSubmit={validateFormAndMint}>
                    <div className="form-item">
                        <TextField fullWidth={true} name="ethaddress" label="Adresse Ethereum du membre" onChange={handleWalletAddress}></TextField>
                    </div>
                    <div className="form-item">
                        <TextField fullWidth={true} name="firstname" label="Prénom" onChange={handleFirstNameChange}></TextField>
                    </div>
                    <div className="form-item">
                        <TextField fullWidth={true} name="lastname" label="Nom" onChange={handleLastNameChange}></TextField>
                    </div>
                    <div className="form-item">
                        <TextField fullWidth={true} name="startdate" label="Date de début d'adhésion" onChange={handleStartDateChange}></TextField>
                    </div>
                    <div className="form-item">
                        <InputLabel>Photo</InputLabel>
                        <TextField fullWidth={true} name="picture" type="file" onChange={handlePictureChange} />
                    </div>
                    <div className="form-item" style={{textAlign: 'center'}}>
                        <Button variant="contained" type="submit" disabled={minting || walletBalance > 0}>
                            Générer la carte de membre
                        </Button>
                    </div>
                </form>
                <MemberCardImageGenerator cardInfos={cardInfos} cardDataUrl={cardDataUrl} />
            </div>
            <SnackbarAlert open={open} setOpen={setOpen} message={message} severity={severity} />

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

export default MemberCardGenerator;
