

const assert = require('assert');
const anchor = require('@project-serum/anchor');
const { PublicKey, Connection } = require("@solana/web3.js");
const cluster = "http://localhost:8899";
//const cluster = "https://api.devnet.solana.com";
const connection = new Connection(cluster, "confirmed");
const { SystemProgram /*, Keypair, SYSVAR_RENT_PUBKEY*/ } = anchor.web3;
const { Buffer } = require('buffer');



// Specify provider environment. 
const provider = anchor.Provider.env();
//Set provider.
anchor.setProvider(provider);
//Specify the workspace 
const program = anchor.workspace.Solanacrowdfundingproject;
//const programID = await connection.programID(program);
const programID = new PublicKey("Br3pwYVUCP8iafhtoqRSFYjZ4QsreqaZffVT6GtaoiUR");




describe('Solanacrowdfundingproject', () => {

  console.log("🚀 Starting tests...");
  try {
    it('gets the Campaign Writing Account initialized', async () => {
      const { writingAccount, bump } = await getProgramDerivedCampaignWritingAccountAddress();
      

      let tx = await program.rpc.initializeCampaign(new anchor.BN(bump),  {
        accounts: {
          writingAccount: writingAccount,
          authority: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,

        },

      });
      //Console.log the Transaction signature of the Initialization procedure. 
      console.log("Campaign Writing Account Initialization signature : ", tx);

      //Console logs
      const account = await program.account.campaignState.fetch(writingAccount);
      console.log("👀 Created A New Campaign Writing Account : ", account);
      console.log("👀 Writing Account's Campaign count is :", account.count);

      //Asserts
      assert.equal(account.authority.toBase58(), provider.wallet.publicKey.toBase58());
      //assert.ok(account.count.eq(new anchor.BN(0)));
      //console.log('👀 Account Authority pubKey : ', account.authority.toBase58());
      
    });
  } catch (error) {
    console.log(error);
  }


  try {
    it('gets the Donator Account initialized', async () => {
      const { donatorProgramAccount, bump } = await getProgramDerivedDonatorProgramAccountAddress();
      
      let tx = await program.rpc.initializeDonation(new anchor.BN(bump),  {
        accounts: {
          authority: provider.wallet.publicKey,
          donatorProgramAccount : donatorProgramAccount,
          systemProgram: SystemProgram.programId,

        },

      });
      //Console.log the Transaction signature of the Initialization procedure. 
      console.log("Donation Account Initialization signature : ", tx);

      //Console.log the accounts created:
      const account = await program.account.donation.fetch(donatorProgramAccount);
      console.log("👀 Created a New Donator Program Account : ", account);
      
      //Asserts
      assert.equal(account.authority.toBase58(), provider.wallet.publicKey.toBase58());
      
    });
  } catch (error) {
    console.log(error);
  }


  try {
    it('Creates a campaign', async () => {

      const { writingAccount, bump } = await getProgramDerivedCampaignWritingAccountAddress();

      //Lets invocate the createCampaign function using provider.wallet.publicKey
      let tx = await program.rpc.createCampaign("Suveett", "Blockchain Speaker", "Enter a fancy giflink for Campaign", new anchor.BN(bump),
        {
          accounts: {
            writingAccount: writingAccount,
            authority: provider.wallet.publicKey,

          },
          
        });
      
      //Console.log the Transaction signature of the Initialization procedure. 
      console.log("Your CreateCampaign transaction signature", tx);
      //Console Logs
      let account = await program.account.campaignState.fetch(writingAccount);
      console.log("Writing Account after Campaign Creation :", account);
      //console.log("This Writing account's address is : ", account.key().toBase58());
      //console.log("This writing Account's owner is the Executing Program : ", account.owner().toBase58());
      console.log("This Writing account's admin is : ", account.campaignDetails[0].admin.toBase58());
      console.log("This Writing account's Campaign Details contains `name` :", account.campaignDetails[0].name);
      console.log("This Writing account's Campaign Details contains `description` :", account.campaignDetails[0].description);
      //Asserts
      //assert.ok(account.count.eq(new anchor.BN(1)));

    });

  } catch (error) {
    console.log(error);
  }



  try {
    it('Can Make a Donation', async () => {

      const { writingAccount } = await getProgramDerivedCampaignWritingAccountAddress();
      const { donatorProgramAccount, bump } = await getProgramDerivedDonatorProgramAccountAddress();


      let balanceOfCampaignAccountPreDonation = await connection.getBalance(writingAccount);
      console.log("Balance of Campaign before Donation : ", balanceOfCampaignAccountPreDonation);

      let balanceOfDonatorPreDonation = await connection.getBalance(provider.wallet.publicKey);
      console.log("Balance of Donator before Donation : ", balanceOfDonatorPreDonation);

      let balanceOfDonatorProgramAccountPreDonation = await connection.getBalance(donatorProgramAccount);
      console.log("Balance of Donator before Donation : ", balanceOfDonatorProgramAccountPreDonation);
     
        let donateTx = await program.rpc.donate(new anchor.BN(100), new anchor.BN(bump),
        {
          accounts: {
            writingAccount: writingAccount,
            donatorProgramAccount: donatorProgramAccount,
            authority: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,   

          },
         
        });

      //Console Logs
      //Console.log the Transaction signature of the Donation procedure. 
      
      console.log("👀 Your Donation transaction signature is : ", donateTx);

      let balanceOfCampaignAccountPostDonation = await connection.getBalance(writingAccount);
      console.log("Balance of Campaign after Donation : ", balanceOfCampaignAccountPostDonation);

      let balanceOfDonatorPostDonation = await connection.getBalance(provider.wallet.publicKey);
      console.log("Balance of Donator post Donation : ", balanceOfDonatorPostDonation);

      let balanceOfDonatorProgramAccountPostDonation = await connection.getBalance(donatorProgramAccount);
      console.log("Balance of Donator post Donation : ", balanceOfDonatorProgramAccountPostDonation);


    });
  } catch (error) {
    console.log(error);
  }



  try {
    it('Can Make a Withdrawal', async () => {
      const { writingAccount , bump } = await getProgramDerivedCampaignWritingAccountAddress();
      const signature = await connection.requestAirdrop(writingAccount, 1000000000);
      await connection.confirmTransaction(signature);
      let balanceOfCampaignAccountPreWithdrawal = await connection.getBalance(writingAccount);
      console.log("Balance of Campaign before Withdrawal: ", balanceOfCampaignAccountPreWithdrawal);

      let withdrawTx = await program.rpc.withdraw(new anchor.BN(500000000), new anchor.BN(bump),
        {
          accounts: {
            writingAccount: writingAccount,
            authority: provider.wallet.publicKey,

          }

        });
      //Console Logs
      //Console.log the Transaction signature of the Withdrawal procedure.
      console.log("Your Withdrawal transaction signature", withdrawTx);
      let balanceOfCampaignAccountPostWithdrawal = await connection.getBalance(writingAccount);
      console.log("Balance of Campaign after Withdrawal: ", balanceOfCampaignAccountPostWithdrawal);


    });
  } catch (error) {
    console.log(error);
  }


});



async function getProgramDerivedCampaignWritingAccountAddress() {
  const [writingAccount, bump] = await PublicKey.findProgramAddress(
    [Buffer.from('upOnlyCrypto!'), provider.wallet.publicKey.toBuffer()],
    programID
  );

  console.log(`Got ProgramDerivedWritingAccountAddress: bump: ${bump}, pubkey: ${writingAccount.toBase58()}`);
  return { writingAccount, bump };

};


async function getProgramDerivedDonatorProgramAccountAddress() {
  const [donatorProgramAccount, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(anchor.utils.bytes.utf8.encode('shutUpAndDance!')) , provider.wallet.publicKey.toBuffer() ],
    programID
  );

  console.log(`Got ProgramDerivedDonatorProgramAccountAddress: bump: ${bump}, pubkey: ${donatorProgramAccount.toBase58()}`);
  return { donatorProgramAccount, bump };

};

