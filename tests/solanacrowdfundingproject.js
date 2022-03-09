

// const assert = require('assert');
// const anchor = require('@project-serum/anchor');
// const { PublicKey, Connection } = require("@solana/web3.js");
// //const cluster = "http://localhost:8899";
// const cluster = "https://api.devnet.solana.com";
// const connection = new Connection(cluster, "confirmed");
// const { SystemProgram, Keypair, /*SYSVAR_RENT_PUBKEY*/ } = anchor.web3; 
// const { Buffer } = require('buffer');



// // Specify provider environment. 
// const provider = anchor.Provider.env();
// //Set provider.
// anchor.setProvider(provider);
// //Specify the workspace 
// const program = anchor.workspace.Solanacrowdfundingproject;
// //const programID = await connection.programID(program);
// const programID = new PublicKey("HwHzMftiyTEYy6w8K6E3AipuF3vgswS1d7c6T6hUeRxf");
// // const otherUser (i.e Donator)
// const donator = Keypair.generate();



// describe('Solanacrowdfundingproject', () => {

//   console.log("🚀 Starting tests...");
//   try {
//     it('gets initialized', async () => {
//       const { writingAccount, bump } = await getProgramDerivedCampaignWritingAccountAddress();
//       let tx = await program.rpc.initialize(new anchor.BN(bump), {
//         accounts: {
//           writingAccount: writingAccount,
//           authority: provider.wallet.publicKey,
//           systemProgram: SystemProgram.programId,
          
//         },

//       });
//       //Console.log the Transaction signature of the Initialization procedure. 
//       console.log("Initialization transaction signature : ", tx);

//       //Asserts and console.logs
//       const account = await program.account.campaignState.fetch(writingAccount);
//       console.log("👀 Created A Writing Account : ", account);
//       assert.equal(account.authority.toBase58(), provider.wallet.publicKey.toBase58());
//       console.log("👀 Account's count is :", account.count);
//     });
//   } catch (error) {
//     console.log(error);
//   }


//   try {
//     it('Creates a campaign', async () => {

//       const { writingAccount } = await getProgramDerivedCampaignWritingAccountAddress();
//       //Lets invocate the createCampaign function using provider.wallet.publicKey
//       let tx = await program.rpc.createCampaign("Suveett", "Blockchain Speaker", "Enter a fancy giflink for Campaign",
//         {
//           accounts: {
//             writingAccount: writingAccount,
//             authority: provider.wallet.publicKey,
            

//           },

//         });
//       //Asserts and Console Logs
//       //Console.log the Transaction signature of the Initialization procedure. 
//       console.log("Your CreateCampaign transaction signature", tx);
//       let account = await program.account.campaignState.fetch(writingAccount);
//       console.log("Writing Account after Campaign Creation :", account);
//       console.log("This Writing account's address is : ", writingAccount.toBase58());
//       console.log("This Writing account's admin is : ", account.campaignDetails[0].admin.toBase58());
//       console.log("This Writing account's Campaign Details contains `name` :", account.campaignDetails[0].name);
//       console.log("This Writing account's Campaign Details contains `description` :", account.campaignDetails[0].description);
//       assert.equal(account.authority.toBase58(), provider.wallet.publicKey.toBase58());
      

//     });

//   } catch (error) {
//     console.log(error);
//   }



//   try {
//     it('Can Make a Donation', async () => {
//       const signature = await connection.requestAirdrop(donator.publicKey, 1000000000);
//       await connection.confirmTransaction(signature);
//       console.log("Airdrop confirmed :", await connection.getBalance(donator.publicKey));
//       const { writingAccount } = await getProgramDerivedCampaignWritingAccountAddress();
//       const { donatorProgramAccount, bump } = await getProgramDerivedDonatorProgramAccountAddress();
      
      
//       let balanceOfCampaignCreatorPreDonation = await connection.getBalance(writingAccount);
//       console.log("Balance of Campaign before Donation : ", balanceOfCampaignCreatorPreDonation);
      
//       let donateTx = await program.rpc.donate(new anchor.BN(1000000), new anchor.BN(bump),
//         {
//           accounts: {
//             writingAccount: writingAccount,
//             authority: donator.publicKey,
//             donatorProgramAccount: donatorProgramAccount,
//             systemProgram: SystemProgram.programId,
            
           
//           },
//            signers: [donator],
//         });
//       //Asserts and Console Logs
//       //Console.log the Transaction signature of the Donation procedure. 
//       let account = await program.account.donatorProgramAccount.fetch(donatorProgramAccount);
//       console.log("👀 Created a New Donator Program Account : ", account);
//       console.log("👀 Your Donation transaction signature is : ", donateTx);
     
//       let balanceOfCampaignCreatorPostDonation = await connection.getBalance(writingAccount);
//       console.log("Balance of Campaign after Donation : ", balanceOfCampaignCreatorPostDonation);

//     });
//   } catch (error) {
//     console.log(error);
//   }



//   try {
//     it('Can Make a Withdrawal', async () => {
//       const { writingAccount } = await getProgramDerivedCampaignWritingAccountAddress();

//       let withdrawTx = await program.rpc.withdraw(new anchor.BN(50000),
//         {
//           accounts: {
//             writingAccount: writingAccount,
//             authority: provider.wallet.publicKey,
            
//           }

//         });
//       //Asserts and Console Logs
//       //Console.log the Transaction signature of the Withdrawal procedure.
//       console.log("Your Withdrawal transaction signature", withdrawTx);
//       let balanceOfCampaignCreator = await connection.getBalance(writingAccount);
//       console.log("Balance of Campaign after Withdrawal: ", balanceOfCampaignCreator);


//     });
//   } catch (error) {
//     console.log(error);
//   }


// });



// async function getProgramDerivedCampaignWritingAccountAddress() {
//   const [writingAccount, bump] = await PublicKey.findProgramAddress(
//     [Buffer.from('please_______initialise!!'), provider.wallet.publicKey.toBuffer()],
//     programID
//   );

//   console.log(`Got ProgramDerivedWritingAccountAddress: bump: ${bump}, pubkey: ${writingAccount.toBase58()}`);
//   return { writingAccount, bump };

// };


// async function getProgramDerivedDonatorProgramAccountAddress() {
//   const [donatorProgramAccount, bump] = await PublicKey.findProgramAddress(
//     [Buffer.from('donate_______now!!'), donator.publicKey.toBuffer()],
//     programID
//   );

//   console.log(`Got ProgramDerivedDonatorProgramAccountAddress: bump: ${bump}, pubkey: ${donatorProgramAccount.toBase58()}`);
//   return { donatorProgramAccount, bump };

// };
