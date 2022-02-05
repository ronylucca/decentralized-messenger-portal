import { ethers } from "ethers";
import React, {useEffect, useState} from "react";
import './App.css';
import {contractAddress} from './utils/constants';
import abi from "./utils/Messenger.json";


const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * ConnectWallet
  */
   const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async() => {
    try{
      const{ethereum} = window;

      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const messengerPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await messengerPortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        //Call the Contract counter
        const messageTxn = await messengerPortalContract.wave();
        console.log('Transaction is mining...');
        await messageTxn.wait();
        console.log('Transaction mined - message sent.' , messageTxn.hash);
        count = await messengerPortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

      }else{
        console.log("Ethereum object does not exist!");
      }
    }catch(err){
      console.log(err);
    }
  }
  
    /*
    * This runs our function when the page loads.
    */
    useEffect(() => {
      checkIfWalletIsConnected();
    }, [])
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
        Hey, I am Rony. Your preferred blockchain dev. Connect your Ethereum wallet and wave at me!
        </div>

        <button disabled={!currentAccount} className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {/*
        * If not cnnected render this Btn
        */}
        
        <button className="waveButton" onClick={connectWallet}>
          { currentAccount? `Connected as ${currentAccount}`:`Connect Wallet`}
        </button>
        
      </div>
    </div>
  );
};
export default App;
