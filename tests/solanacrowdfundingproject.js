const assert = require('assert');
const anchor = require('@project-serum/anchor');
const { PublicKey, Connection } = require("@solana/web3.js");
const cluster = "http://localhost:8899";
const connection = new Connection(cluster, "confirmed");
const { SystemProgram, Keypair } = anchor.web3;
const { Buffer } = require('buffer');
//const { decode } = require('borsh');


// Specify provider environment. 
const provider = anchor.Provider.env();
//Set provider.
anchor.setProvider(provider);

//Specify the workspace 
const program = anchor.workspace.Solanacrowdfundingproject;
//const programID = await connection.programID(program);
const programID = new PublicKey("F7nnL8QeG9ELnu8CUJfQxtYaVEGTecd7ULrnV2ojxFCw");


describe('Solanacrowdfundingproject', () => {

  console.log("🚀 Starting tests...");
  try {
    it('gets initialized', async () => {
      const { writingAccount, bump } = await getProgramDerivedCampainWritingAccountAddress();


      let tx = await program.rpc.initialize(new anchor.BN(bump), {
        accounts: {
          writingAccount: writingAccount,
          authority: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        
      });
      //Console.log the Transaction signature of the Initialization procedure. 
      console.log("Initialization transaction signature : ", tx);

      //Asserts and console.logs
      const account = await program.account.campaignState.fetch(writingAccount);
      console.log("👀 Created A Writing Account : ", account);
      assert.equal(account.authority.toBase58(), provider.wallet.publicKey.toBase58());
      //assert.ok(account.count.eq(new anchor.BN(0)));
      console.log('👀 Account Authority pubKey : ', account.authority.toBase58());
      //console.log("👀 Account count is :", account.count.toNumber());
    });
  } catch (error) {
    console.log(error);
  }


  try {
    it('Creates a campaign', async () => {
      const { writingAccount } = await getProgramDerivedCampainWritingAccountAddress();

      //Lets invocate/ initialise the createCampaign fn using provider.wallet.publicKey
      let tx = await program.rpc.createCampaign("Suveett", "Blockchain Speaker", "Enter a fancy giflink for Campaign",
        {
          accounts: {
            writingAccount: writingAccount,
            authority: provider.wallet.publicKey,
            
          },
          
        });
      //Asserts and Console Logs
      //Console.log the Transaction signature of the Initialization procedure. 
      console.log("Your CreateCampaign transaction signature", tx);
      let account = await program.account.campaignState.fetch(writingAccount);
      console.log("Writing Account after Campaign Creation :", account);
      console.log("This Writing account's address is : ", writingAccount.toBase58());
      console.log("This Writing account's admin is : ", account.campaignDetails[0].admin.toBase58());
      console.log("This Writing account's Campaign Details contains `name` :", account.campaignDetails[0].name);
      console.log("This Writing account's Campaign Details contains `description` :", account.campaignDetails[0].description);
      assert.equal(account.authority.toBase58(), provider.wallet.publicKey.toBase58());
      //assert.ok(account.count.eq(new anchor.BN(1)));

    });

  } catch (error) {
    console.log(error);
  }



  try {
    it('Can Make a Donation', async () => {
      const { writingAccount } = await getProgramDerivedCampainWritingAccountAddress();
      const { donatorProgramAccount, bump } = await getProgramDerivedCampainDonatorProgramAccountAddress();
     

      let donateTx = await program.rpc.donate(new anchor.BN(1000), new anchor.BN(bump), "slug" , 
        {
          accounts: {
            writingAccount: writingAccount,
            authority: provider.wallet.publicKey,
            donatorProgramAccount: donatorProgramAccount,
            systemProgram: SystemProgram.programId,
          },
          
        });
      //Asserts and Console Logs
      //Console.log the Transaction signature of the Donation procedure. 
      console.log("Your Donation transaction signature", donateTx);
      let account = await program.account.donation.fetch(donatorProgramAccount);
      console.log("👀 Created a New Donator Program Account : ", account);
      let balanceOfCampaignCreator = await connection.getBalance(writingAccount);
      console.log("Balance of Campaign after Donation : ", balanceOfCampaignCreator.toNumber());

    });
  } catch (error) {
    console.log(error);
  }



  try {
    it('Can Make a Withdrawal', async () => {
      const { writingAccount } = await getProgramDerivedCampainWritingAccountAddress();
      
      let withdrawTx = await program.rpc.withdraw(new anchor.BN(500),
        {
          accounts: {
            writingAccount: writingAccount,
            authority: provider.wallet.publicKey,
          }

        });
      //Asserts and Console Logs
      //Console.log the Transaction signature of the Withdrawal procedure.
      console.log("Your Withdrawal transaction signature", withdrawTx);
      // let account = await program.account.writingAccount.fetch(writingAccount);
      let balanceOfCampaignCreator = await connection.getBalance(writingAccount);
      console.log("Balance of Campaign after Withdrawal: ", balanceOfCampaignCreator.toNumber());


    });
  } catch (error) {
    console.log(error);
  }


});



async function getProgramDerivedCampainWritingAccountAddress() {
  const [writingAccount, bump] = await PublicKey.findProgramAddress(
    [Buffer.from('____profit'), provider.wallet.publicKey.toBuffer()],
    programID
  );

  console.log(`Got ProgramDerivedWritingAccountAddress: bump: ${bump}, pubkey: ${writingAccount.toBase58()}`);
  return { writingAccount, bump };

};

async function getProgramDerivedCampainDonatorProgramAccountAddress() {
  const [donatorProgramAccount, bump] = await PublicKey.findProgramAddress(
    [Buffer.from('____donation'), Buffer.from('slug'), provider.wallet.publicKey.toBuffer()],
    programID
  );
  console.log(`Got ProgramDerivedDonatorProgramAccountAddress: bump: ${bump}, pubkey: ${donatorProgramAccount.toBase58()}`);
  return { donatorProgramAccount, bump };

}