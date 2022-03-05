import { BN } from 'bn.js';
import { Buffer } from 'buffer';
import idl from './idl.json';
import './App.css';
//import kp from './keypair.json'
import React, { useEffect, useState } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import Header from './components/Header';
import Card from './components/Card';
import Form from './components/Form';
import { getAllCampaigns, getWithdrawalData } from "./solana";
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
require('@solana/wallet-adapter-react-ui/styles.css');

const wallets = [
  /* view list of available wallets at https://github.com/solana-labs/wallet-adapter#wallets */
  new PhantomWalletAdapter()
]
//const wallet = useWallet();

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('localnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

// const arr = Object.values(kp._keypair.secretKey)
// const secret = new Uint8Array(arr)
// const writingAccount = web3.Keypair.fromSecretKey(secret)


export async function createCampaign(names, description, image_link) {
  try {

    window.Buffer = Buffer;
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    const { writingAccount, bump } = await getProgramDerivedCampainWritingAccountAddress();

    await program.rpc.initialize(new BN(bump), {
      accounts: {
        writingAccount: writingAccount,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });

    await program.rpc.createCampaign(names, description, image_link, {
      accounts: {
        writingAccount: writingAccount,
        authority: provider.wallet.publicKey,

      },
    });

    await getAllCampaigns();
    let account = await program.account.writingAccount.fetch(writingAccount);
    console.log("Added a new Campaign with Details", account.campaignDetails[0]);

  } catch (error) {
    console.log("Error Creating Campaign :", error)
  }
}


export async function donateToCampaign(campaignPubKey, amount) {

  window.Buffer = Buffer;
  const provider = getProvider();
  const program = new Program(idl, programID, provider);
  const { donatorProgramAccount, bump } = await getProgramDerivedCampainDonatorProgramAccountAddress();

  const donateTx = await program.rpc.donate(new BN(amount), "slug", new BN(bump), {
    accounts: {
      writingAccount: campaignPubKey,
      authority: provider.wallet.publicKey,
      donatorProgramAccount: donatorProgramAccount,
      systemProgram: SystemProgram.programId,
    }

  });

  alert("Your Donation transaction signature", donateTx);
  let account = await program.account.donation.fetch(donatorProgramAccount);
  console.log("👀 Created a New Donator Program Account : ", account);
  alert("Donation Successful");
}


export async function withdraw(campaignPubKey, amount) {

  window.Buffer = Buffer;
  const provider = getProvider();
  const program = new Program(idl, programID, provider);
  await program.rpc.withdraw(amount, {
    accounts: {
      writingAccount: campaignPubKey,
      creatorAccount: provider.wallet.publicKey,
    }

  });

  let withdrawalData = await getWithdrawalData();
  console.log(withdrawalData);
  console.log("New Withdrawal Successful ! Initiated by : ", provider.wallet.publicKey);

}


async function getProgramDerivedCampainWritingAccountAddress() {
  const provider = getProvider();
  const [writingAccount, bump] = await PublicKey.findProgramAddress(
    [Buffer.from('____profit'), provider.wallet.publicKey.toBuffer()],
    programID
  );

  console.log(`Got ProgramDerivedWritingAccountAddress: bump: ${bump}, pubkey: ${writingAccount.toBase58()}`);
  return { writingAccount, bump };

};

async function getProgramDerivedCampainDonatorProgramAccountAddress() {
  const provider = getProvider();
  const [donatorProgramAccount, bump] = await PublicKey.findProgramAddress(
    [Buffer.from('____donation'), Buffer.from('slug'), provider.wallet.publicKey.toBuffer()],
    programID
  );
  console.log(`Got ProgramDerivedDonatorProgramAccountAddress: bump: ${bump}, pubkey: ${donatorProgramAccount.toBase58()}`);
  return { donatorProgramAccount, bump };

};


async function getProvider() {
  const connection = new Connection(network, opts.preflightCommitment);

  const provider = new Provider(
    connection, window.solana, opts.preflightCommitment,
  );
  return provider;
}



function App() {
  // State
  const wallet = useWallet();
  const [route, setRoute] = useState(0);
  const [cards, setCards] = useState([]);



  useEffect(() => {
    getAllCampaigns().then((val) => {
      setCards(val);
      console.log(val);
    });
  }, []);
  if (!wallet.connected) {
    /* If the user's wallet is not connected, display connect wallet button. */
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
        <WalletMultiButton />
      </div>
    )
  } else {
    return (
      <div className="ui container">

        <Header setRoute={setRoute} />
        {route === 0 ?
          <div>{
            cards.map((e, idx) => (
              <Card
                key={e.pubId.toString()}
                data={{
                  title: e.name,
                  description: e.description,
                  amount: (e.amount_donated).toString(),
                  image: e.image_link,
                  id: e.pubId,
                }}
                setCards={setCards} />
            ))
          }
          </div>
          :
          <Form setRoute={(e) => {
            setRoute(e);
            getAllCampaigns().then((val) => {
              setCards(val);
            });
          }} />
        }
      </div>
    );
  }
}

/* wallet configuration as specified here: https://github.com/solana-labs/wallet-adapter#setup */
const AppWithProvider = () => (
  <ConnectionProvider endpoint="https://api.devnet.solana.com">
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <App />
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
)

export default AppWithProvider;