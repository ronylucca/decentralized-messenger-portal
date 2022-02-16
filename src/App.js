import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import AnimatedNumbers from 'react-animated-numbers';
import './App.css';
import { contractAddress } from './utils/constants';
import abi from './utils/Messenger.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [allWaves, setAllWaves] = useState([]);
  const [num, setNum] = useState(0);

  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have metamask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const messengerPortalContract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer,
          );
          setNum(await messengerPortalContract.getTotalWaves());
          getAllWaves();
        }
      } else {
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * ConnectWallet
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const messengerPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer,
        );

        let count = await messengerPortalContract.getTotalWaves();
        console.log('Retrieved total wave count...', count.toNumber());

        //Call the Contract counter
        const messageTxn = await messengerPortalContract.wave(
          document.getElementById('messageWave').value,
        );
        console.log('Transaction is mining...');
        await messageTxn.wait();
        console.log('Transaction mined - message sent.', messageTxn.hash);
        count = await messengerPortalContract.getTotalWaves();
        console.log('Retrieved total wave count...', count.toNumber());
        setNum(count);
        getAllWaves();
      } else {
        console.log('Ethereum object does not exist!');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer,
        );

        /*
         * Call the getAllWaves method from Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        /*
         * Store data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Hey there!</div>

        <div className="bio">
          Hey, I am Rony. Your preferred blockchain dev. Connect your Ethereum
          wallet and wave at me!
        </div>

        <input className='waveButton' id="messageWave" defaultValue="Type something here..." />
        <button
          disabled={!currentAccount}
          className="waveButton"
          onClick={wave}
        >
          Wave at Me
        </button>
        {/*
         * If not cnnected render this Btn
         */}

        <button className="waveButton" onClick={connectWallet}>
          {currentAccount ? `Connected as ${currentAccount}` : `Connect Wallet`}
        </button>

        <div align="center">
          <video align="center" width="450" height="390" autoPlay muted loop>
            <source
              src="https://cdn-animation.artstation.com/p/video_sources/000/560/972/ubeejwn9ywd-576.mp4"
              type="video/mp4"
            />
          </video>
        </div>
        {/* <AnimatedNumbers
      includeComma
      animateToNumber={num}
      fontStyle={{ fontSize: 40 }}
      configs={[
        { mass: 1, tension: 220, friction: 100 },
        { mass: 1, tension: 180, friction: 130 },
        { mass: 1, tension: 280, friction: 90 },
        { mass: 1, tension: 180, friction: 135 },
        { mass: 1, tension: 260, friction: 100 },
        { mass: 1, tension: 210, friction: 180 },
      ]}
    ></AnimatedNumbers> */}

        <div className="container">
          <AnimatedNumbers
            animateToNumber={num}
            fontStyle={{ fontSize: 40 }}
            configs={(number, index) => {
              return { mass: 1, tension: 230 * (index + 1), friction: 140 };
            }}
          ></AnimatedNumbers>

          <div className="bio">&nbsp;👋&nbsp; have been sent so far!</div>
        </div>

        {allWaves.map((wave, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: 'OldLace',
                marginTop: '16px',
                padding: '8px',
              }}
            >
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default App;
