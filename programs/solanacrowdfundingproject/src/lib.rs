

use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::{invoke /* , invoke_signed */ };
use anchor_lang::solana_program::system_instruction;
use anchor_lang::solana_program::program_error::ProgramError;
use anchor_lang::solana_program::pubkey::Pubkey;

declare_id!("Br3pwYVUCP8iafhtoqRSFYjZ4QsreqaZffVT6GtaoiUR");


#[program]
pub mod solanacrowdfundingproject {
    use super::*;
    

    // `seeds` and `bump` tell us that our `writing_account` is a PDA that can be derived from their respective values

    pub fn initialize_campaign(ctx: Context<InitializeCampaign>, writing_account_bump: u8) -> ProgramResult {
        let writing_account = &mut ctx.accounts.writing_account;
        let authority = &mut ctx.accounts.authority;
         
        writing_account.bump = writing_account_bump;
        writing_account.count = 0;
        writing_account.authority = *authority.key; 
        writing_account.campaign_details = Vec::new();
        writing_account.withdraw_request = Vec::new();
        writing_account.donation_received = Vec::new();

        
        Ok(())
    }

    pub fn initialize_donation(ctx: Context<InitializeDonation>, donator_program_account_bump : u8) -> ProgramResult {
        let donator_program_account = &mut ctx.accounts.donator_program_account;
        let authority = &mut ctx.accounts.authority;

        donator_program_account.bump = donator_program_account_bump;
        donator_program_account.authority = *authority.key; 

        Ok(())

    }

    pub fn create_campaign
    (
        ctx : Context<CreateCampaign>, 
        name : String, 
        description : String, 
        image_link: String,
        writing_account_bump : u8
        
        
    ) 
        -> ProgramResult {
            
        let writing_account = &mut ctx.accounts.writing_account;
        let authority = &mut ctx.accounts.authority;
        
             
        let (pda, bump ) = Pubkey::find_program_address(
        &[b"upOnlyCrypto!", &*authority.key().as_ref()], &self::ID
        );

        if pda != writing_account.key()  {                         // Confirm if passed in PDA address is the same
            return Err(ProgramError::Custom(1))
        };

        if bump != writing_account_bump {
            return Err(ProgramError::Custom(2))
        };

        if name.len()  > 30 || description.len() > 50 {
            return Err(ErrorCode::NameOrDescriptionTooLong.into())
        }


        let campaign_data = CampaignDetails {
            admin : *authority.key,
            name : name.to_string(),
            description : description.to_string(),
            image_link : image_link.to_string(),
               
        };

        writing_account.count += 1;
        writing_account.campaign_details.push(campaign_data);

        
        Ok(())
    }



    
    pub fn withdraw
    (
        ctx : Context<Withdraw>, 
        amount : u64,
        writing_account_bump : u8
        

    ) -> ProgramResult {
       
        let writing_account = &mut ctx.accounts.writing_account;
        let authority = &mut ctx.accounts.authority;

        let (pda, bump ) = Pubkey::find_program_address(
            &[b"upOnlyCrypto!", &*authority.key().as_ref()], &self::ID
            );
    
            if pda != writing_account.key()  {                         // Confirm if passed in PDA address is the same
                return Err(ProgramError::Custom(1))
            };
    
            if bump != writing_account_bump {
                return Err(ProgramError::Custom(2))
            };
      
         **writing_account.to_account_info().try_borrow_mut_lamports()? -= amount;
         **authority.to_account_info().try_borrow_mut_lamports()? += amount;

        let withdraw_data = WithdrawRequest {
            amount_withdrawn : amount,
            admin : *authority.to_account_info().key,
        };

        writing_account.withdraw_request.push(withdraw_data);
         
        Ok(())

    }

    


    pub fn donate
    (
        ctx : Context<Donate>, 
        amount : u64, 
        donator_program_account_bump : u8


    ) -> ProgramResult {
 
    let writing_account = &mut ctx.accounts.writing_account;
    let donator_program_account = &mut ctx.accounts.donator_program_account;
    let authority = &mut ctx.accounts.authority;

    let (pda, bump ) = Pubkey::find_program_address(
    &[b"shutUpAndDance!", &*authority.key().as_ref()], &self::ID
    );

    if pda != donator_program_account.key()  {                         // Confirm if passed in PDA address is the same
        return Err(ProgramError::Custom(1))
    };

    if bump != donator_program_account_bump {
        return Err(ProgramError::Custom(2))
    };

   let transfer_ix = system_instruction::transfer(
        &authority.to_account_info().key(),
        &donator_program_account.to_account_info().key(),
        amount,
   );

   invoke(
       &transfer_ix, 
       &[
           authority.to_account_info(),
           donator_program_account.to_account_info(),
        ],
    )?;

     
    **writing_account.to_account_info().try_borrow_mut_lamports()? += **donator_program_account.to_account_info().lamports.borrow();
    **donator_program_account.to_account_info().try_borrow_mut_lamports()? = 0;
    

    let donation = DonationMade {
        amount_donated : amount,
    };

    writing_account.donation_received.push(donation);
   
    Ok(())

    }


    #[derive(Accounts)]
    #[instruction(writing_account_bump : u8)]
    pub struct InitializeCampaign<'info> {
        #[account(init, 
            seeds = [b"upOnlyCrypto!".as_ref(), authority.key().as_ref()], 
            bump = writing_account_bump, 
            payer = authority, 
            space = 9000)]
            pub writing_account : Account<'info, CampaignState>,

            #[account(mut)]
            pub authority : Signer<'info>,
            pub system_program : Program<'info, System>,
            
    }
    

    #[derive(Accounts)]
    #[instruction(donator_program_account_bump : u8)]
    pub struct InitializeDonation<'info> {
        #[account(init, 
            seeds = [b"shutUpAndDance!".as_ref(), authority.key().as_ref()], 
            bump = donator_program_account_bump, 
            payer = authority, 
            space = 50)]
            pub donator_program_account : Account<'info, Donation>,

            #[account(mut)]
            pub authority : Signer<'info>,
            pub system_program : Program<'info, System>,
            
    }

    
    #[derive(Accounts)] 
    pub struct CreateCampaign<'info> {
       #[account(mut, has_one = authority)]
        pub writing_account  : Account<'info, CampaignState>,
        #[account(mut)]
        pub authority : Signer<'info>,      
             
    }

   
    #[derive(Accounts)] 
    pub struct Withdraw<'info> {
        #[account(mut, has_one = authority)]
        pub writing_account : Account<'info, CampaignState>,
        #[account(mut)]
        pub authority : Signer<'info>,  
          
    }

   
    #[derive(Accounts)]
    pub struct Donate<'info> {
        #[account(mut, has_one = authority)]
        pub donator_program_account : Account<'info, Donation>,
        #[account(mut)]
        pub writing_account : Account<'info, CampaignState>,
        #[account(mut)]
        pub authority : Signer<'info>,
        pub system_program : Program<'info, System>,
    }


    #[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
    pub struct CampaignDetails  {
        pub admin: Pubkey,
        pub name: String,
        pub description: String,
        pub image_link: String,       
             
    }

    #[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
    pub struct WithdrawRequest {
        pub amount_withdrawn : u64,
        pub admin : Pubkey,        
    }

    #[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
    pub struct DonationMade {
        pub amount_donated: u64,
           
    }


    #[account]
    pub struct CampaignState {    
       pub campaign_details : Vec<CampaignDetails>,
       pub bump : u8,
       pub count : u8,
       pub authority: Pubkey,  
       pub withdraw_request : Vec<WithdrawRequest>, 
       pub donation_received : Vec<DonationMade>,        
    }

    #[account]
    pub struct Donation {
        
        pub bump : u8,
        pub authority : Pubkey,
    }
   
    #[error]
    pub enum ErrorCode {    
       
        #[msg("Name cannot be more than 30 charecters and Description cannot be more than 50 charecters")]
            NameOrDescriptionTooLong,
    }



}

