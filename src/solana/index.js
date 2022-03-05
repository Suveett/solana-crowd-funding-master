import { Connection, PublicKey, /*Transaction, TransactionInstruction,*/ clusterApiUrl/*, lamports*/ } from '@solana/web3.js';
import {deserialize} from 'borsh';
import idl from '../idl.json';

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);
const cluster = "http://localhost:8899";
const connection = new Connection(cluster, "confirmed");



class CampaignDetails {
    constructor(properties) {
        Object.keys(properties).forEach((key) => {
            this[key] = properties[key];
        });
    }
    static schema = new Map([[CampaignDetails,
        {
            kind: 'struct',
            fields: [
                ['admin', [32]],
                ['name', 'string'],
                ['description', 'string'],
                ['image_link', 'string'],
                ['amount_donated', 'u64']]
        }]]);
}

export async function getAllCampaigns() {
    
    let accounts = await connection.getProgramAccounts(programID);
    let campaigns = [];
    
    accounts.forEach((e) => {
        try {
            let campData = deserialize(CampaignDetails.schema, CampaignDetails, e.account.data);
            campaigns.push({
                pubId: e.pubkey,
                name: campData.name,
                description: campData.description,
                image_link: campData.image_link,
                amount_donated: campData.amount_donated,
                admin: campData.admin,
            });
        } catch (err) {
            console.log(err);
        }
    });
    
    return campaigns;
}




class WithdrawRequest {
    constructor(properties) {
        Object.keys(properties).forEach((key) => {
            this[key] = properties[key];
        });
    }
    static schema = new Map([[WithdrawRequest,
        {
            kind: 'struct',
            fields: [
                ['amount', 'u64'],
            ]
        }]]);

}

export async function getWithdrawalData() {
    
    let accounts = await connection.getProgramAccounts(programID);
    let withdrawals= [];
    
    accounts.forEach((e) => {
        try {
            let withdrawData = deserialize(WithdrawRequest.schema, WithdrawRequest, e.account.data);
            withdrawals.push({
                pubId: e.pubkey,
                amount : withdrawData.amount,
            });
        } catch (err) {
            console.log(err);
        }
    });
    
    return withdrawals;
}









// import { Buffer } from 'buffer';

// import {
//     Connection,
//     SystemProgram,
//     Transaction,
//     PublicKey,
//     TransactionInstruction, 
//     Keypair
// } from "@solana/web3.js";
// import { deserialize, serialize } from "borsh";
// import { /*Program, web3,*/ Provider } from '@project-serum/anchor';
// import { connectWallet } from "../App"

// const cluster = "https://api.devnet.solana.com";
// const connection = new Connection(cluster, "confirmed");
// //const wallet = /*new Wallet("https://www.sollet.io", cluster);*/ await connectWallet();
// const programId = new PublicKey(
//     "9k8UKKiDrFbaej9k4U963f5xq14v9RERrQp7BpCmcq6i"
// );
// // Controls how we want to acknowledge when a transaction is "done".
// // const opts = {
// //     preflightCommitment: "processed"
// //   }



// export async function setPayerAndBlockhashTransaction(instructions) {
//     const provider = getProvider();
//     const transaction = new Transaction();
//     instructions.forEach(element => {
//         transaction.add(element);
//     });
//     transaction.feePayer = provider.wallet.publicKey;
//     let hash = await connection.getRecentBlockhash();
//     transaction.recentBlockhash = hash.blockhash;
//     return transaction;
// }

// export async function signAndSendTransaction(transaction) {
//     const provider = getProvider();
//     try {
//         console.log("start signAndSendTransaction");
//         let signedTrans = await provider.wallet.signTransaction(transaction);
//         console.log("signed transaction");
//         let signature = await connection.sendRawTransaction(
//             signedTrans.serialize()
//         );
//         console.log("end signAndSendTransaction");
//         return signature;
//     } catch (err) {
//         console.log("signAndSendTransaction error", err);
//         throw err;
//     }
// }

// class CampaignDetails {
//     constructor(properties) {
//         Object.keys(properties).forEach((key) => {
//             this[key] = properties[key];
//         });
//     }
//     static schema = new Map([[CampaignDetails,
//         {
//             kind: 'struct',
//             fields: [
//                 ['admin', [32]],
//                 ['name', 'string'],
//                 ['description', 'string'],
//                 ['image_link', 'string'],
//                 ['amount_donated', 'u64']]
//         }]]);
// }



// export async function createCampaign(
//     name, description, image_link
// ) {

//     await connectWallet();
//     window.Buffer = Buffer;
//     const provider = getProvider();
//     const SEED = "skmapcdef" + Math.random().toString();

//     let newAccount = await PublicKey.createWithSeed(
//         provider.wallet.publicKey,
//         SEED,
//         programId
//     );
//      //This below code is not working : Msg from console : Cannot read property of undefined : pubkey
//     //let newAccount = await Keypair.generate();

//     let campaign = new CampaignDetails({
//         name: name,
//         description: description,
//         image_link: image_link,
//         admin: provider.wallet.publicKey.toBuffer(),
//         amount_donated: 0
//     })

//     let data = serialize(CampaignDetails.schema, campaign);
//     let data_to_send = new Uint8Array([0, ...data]);

//     const lamports = (await connection.getMinimumBalanceForRentExemption(data.length));

//     const createProgramAccount = SystemProgram.createAccountWithSeed({
//         fromPubkey: provider.wallet.publicKey,
//         basePubkey: provider.wallet.publicKey,
//         seed: SEED,
//         newAccountPubkey: newAccount,
//         lamports: lamports,
//         space: data.length,
//         programId: programId,
//     });

//     const instructionTOOurProgram = new TransactionInstruction({
//         keys: [
//             { pubkey: newAccount, isSigner: false, isWritable: true },
//             { pubkey: provider.wallet.publicKey, isSigner: true, isWritable: false },
//         ],
//         programId: programId,
//         data: data_to_send,
//     });

//     const trans = await setPayerAndBlockhashTransaction(
//         [createProgramAccount,
//             instructionTOOurProgram]
//     );
//     const signature = await signAndSendTransaction(trans);

//     const result = await connection.confirmTransaction(signature);
//     console.log("Campaign created with result :", result);

// }




// export async function getAllCampaigns() {
//     let accounts = await connection.getProgramAccounts(programId);
//     let campaigns = []
//     accounts.forEach((e) => {
//         try {
//             let campData = deserialize(CampaignDetails.schema, CampaignDetails, e.account.data);
//             campaigns.push({
//                 pubId: e.pubkey,
//                 name: campData.name,
//                 description: campData.description,
//                 image_link: campData.image_link,
//                 amount_donated: campData.amount_donated,
//                 admin: campData.admin,
//             });
//         } catch (err) {
//             console.log(err);
//         }
//     });
//     return campaigns;
// }

// export async function donateToCampaign(campaignPubKey, amount) {

//     await connectWallet();
//     const provider = getProvider();

//     //This below code is for generating keypair for the Client.
//     const SEED = "abcdef" + Math.random().toString();
//     let newAccount = await PublicKey.createWithSeed(
//         provider.wallet.publicKey,
//         SEED,
//         programId
//     );
//     //let newAccount = await Keypair.generate();

//     const createProgramAccount = SystemProgram.createAccountWithSeed(
//         {
//             fromPubkey: provider.wallet.publicKey,
//             basePubkey: provider.wallet.publicKey,
//             seed: SEED,
//             newAccountPubkey: newAccount,
//             lamports: amount,
//             space: 1,
//             programId: programId,
//         }
//     );
//     const instructionTOOurProgram = new TransactionInstruction({
//         keys: [
//             { pubkey: campaignPubKey, isSigner: false, isWritable: true },
//             { pubkey: newAccount, isSigner: false, isWritable : true},
//             { pubkey: provider.wallet.publicKey, isSigner: true, isWritable : false }
//         ],
//         programId: programId,
//         data: new Uint8Array([2])
//     });

//     const trans = await setPayerAndBlockhashTransaction(
//         [createProgramAccount, instructionTOOurProgram]
//     );
//     const signature = await signAndSendTransaction(trans);
//     const result = await connection.confirmTransaction(signature);
//     console.log("Donation sent with result :", result);

// }




// class WithdrawRequest {
//     constructor(properties) {
//         Object.keys(properties).forEach((key) => {
//             this[key] = properties[key];
//         });
//     }
//     static schema = new Map([[WithdrawRequest,
//         {
//             kind: 'struct',
//             fields: [
//                 ['amount', 'u64'],
//             ]
//         }]]);

// }

// export async function withdraw(
//     campaignPubKey, amount
// ) {
//     //await checkWallet();
//     await connectWallet();
//     const provider = getProvider();
//     let withdrawRequest = new WithdrawRequest({ amount: amount });
//     let data = serialize(WithdrawRequest.schema, withdrawRequest);
//     let data_to_send = new Uint8Array([1, ...data]);

//     const instructionTOOurProgram = new TransactionInstruction({
//         keys: [
//             { pubkey: campaignPubKey, isSigner: false, isWritable: true },
//             { pubkey: provider.wallet.publicKey, isSigner: true, isWritable : false }
//         ],
//         programId: programId,
//         data: data_to_send
//     });

//     const trans = await setPayerAndBlockhashTransaction(
//         [instructionTOOurProgram]
//     );
//     const signature = await signAndSendTransaction(trans);
//     const result = await connection.confirmTransaction(signature);
//     console.log("Withdrawn with Success : ", result);

// }


// const getProvider = () => {
//     const connection = new Connection(cluster, opts.preflightCommitment);

//     const provider = new Provider(
//       connection, window.solana, opts.preflightCommitment,
//     );
//     return provider;
//   }
