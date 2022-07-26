import { ethers } from "./ethers-5.6.esm.min.js"
import { contractAddress, abi } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        connectButton.innerHTML = "Connected!"
    } else {
        console.log("I dont see a Metamask connected")
        connectButton.innerHTML = "Not Connected!"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenTxnMine(transactionResponse, provider)
            console.log("Done!!")
        } catch (error) {
            console.log(error)
        }
    }
}

async function fund(ethAmount) {
    ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}`)
    if (typeof window.ethereum !== "undefined") {
        //Provider of connection
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            //wait for this txn to complete
            await listenTxnMine(transactionResponse, provider)
            console.log("Done!!")
        } catch (error) {
            console.log(error)
        }
        //Signer/Wallet
        //Address and ABI of the contract
    }
}

function listenTxnMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    //create a listener for the blockchain
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}
