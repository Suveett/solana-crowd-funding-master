
use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;
use anchor_lang::solana_program::program::{invoke /* , invoke_signed */};
use anchor_lang::solana_program::system_instruction;
use anchor_lang::solana_program::program_error::ProgramError;
declare_id!("HwHzMftiyTEYy6w8K6E3AipuF3vgswS1d7c6T6hUeRxf");


#[program]
pub mod solanacrowdfundingproject {
    use super::*;
    
    // `seeds` and `bump` tell us that our `writing_account` is a PDA that can be derived from their respective values
    pub fn initialize(ctx: Context<Initialize>, writing_account_bump: u8) -> ProgramResult {
        let writing_account = &mut ctx.accounts.writing_account;
        let authority = &mut ctx.accounts.authority;
        
        writing_account.bump = writing_account_bump;
        writing_account.count = 0;
        writing_account.authority = *authority.key; 
        writing_account.campaign_details = Vec::new();
        writing_account.withdraw_request = Vec::new();
        
        Ok(())
    }

    
    pub fn create_campaign
    (
        ctx : Context<CreateCampaign>, 
        name : String, 
        description : String, 
        image_link: String,      
    ) 
        -> ProgramResult {
               
        let writing_account = &mut ctx.accounts.writing_account;
        let authority = &mut ctx.accounts.authority;
        
        if name.len()  > 30 || description.len() > 50 {
            return Err(ErrorCode::NameOrDescriptionTooLong.into())
        }

        let campaign_data = CampaignDetails {
            admin : *authority.key,
            name : name.to_string(),
            description : description.to_string(),
            image_link : image_link.to_string(),
            amount_donated : 0,       
        };

        writing_account.count += 1;
        writing_account.campaign_details.push(campaign_data);
        
        Ok(())
    }
    
    
    pub fn withdraw(ctx : Context<Withdraw>, amount : u64) -> ProgramResult {
        let writing_account = &mut ctx.accounts.writing_account;
        let authority = &mut ctx.accounts.authority;
        
        
        let withdraw_data = WithdrawRequest {
            amount_withdrawn : amount,
            admin : *authority.to_account_info().key,
        };

        writing_account.withdraw_request.push(withdraw_data);
         
         **writing_account.to_account_info().try_borrow_mut_lamports()? -= amount;
         **authority.to_account_info().try_borrow_mut_lamports()? += amount;
        
        Ok(())

    }

    
    pub fn donate(ctx : Context<Donate>, amount : u64, donator_program_account_bump : u8) -> ProgramResult {
       
        let writing_account = &mut ctx.accounts.writing_account;
        let donator_program_account = &mut ctx.accounts.donator_program_account;
        let authority = &mut ctx.accounts.authority;

        donator_program_account.amount_donated = amount;
        donator_program_account.bump = donator_program_account_bump;
        

       let transfer_ix = system_instruction::transfer(
            &authority.to_account_info().key(),
            &donator_program_account.to_account_info().key(),
            amount,
       );

       #[warn(unused_must_use)]
       invoke(
           &transfer_ix, 
           &[
               authority.to_account_info(),
               donator_program_account.to_account_info(),
           ],
       )?;

        let mut campaign_data = CampaignDetails::try_from_slice(*writing_account.to_account_info().try_borrow_mut_data()?)
        .expect("Error deserializing data");
        campaign_data.amount_donated += **donator_program_account.to_account_info().lamports.borrow();

        **writing_account.to_account_info().try_borrow_mut_lamports()? += **donator_program_account.to_account_info().lamports.borrow();
        **donator_program_account.to_account_info().try_borrow_mut_lamports()? = 0;
        *donator_program_account.to_account_info().try_borrow_mut_data()? = &mut []; 
       
        Ok(())
    }


    #[derive(Accounts)]
    #[instruction(writing_account_bump : u8)]
    pub struct Initialize<'info> {
        #[account(init, 
            seeds = [b"please_______initialise!!".as_ref(), authority.key().as_ref()], 
            bump = writing_account_bump, 
            payer = authority, 
            space = 9000)]
            pub writing_account : Account<'info, CampaignState>,
            #[account(mut)]
            pub authority : Signer<'info>,
            #[account(address = system_program::ID)]
            pub system_program : AccountInfo<'info>,
            
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
    #[instruction(donator_program_account_bump : u8)]
    pub struct Donate<'info> {
        #[account(mut)]
        pub writing_account : Account<'info, CampaignState>,
        #[account(mut)]
        pub authority : Signer<'info>,
        #[account(init,
            seeds = [b"donate_______now!!".as_ref(), authority.key().as_ref()], 
            bump = donator_program_account_bump, 
            payer = authority, 
            space = 100)]
        pub donator_program_account : Account<'info, DonatorProgramAccount>,
        #[account(address = system_program::ID)]
        pub system_program : AccountInfo<'info>,
    }

    

    #[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
    pub struct CampaignDetails  {
        pub admin: Pubkey,
        pub name: String,
        pub description: String,
        pub image_link: String,
        pub amount_donated: u64,          
    }



    #[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
    pub struct WithdrawRequest {
        pub amount_withdrawn : u64,
        pub admin : Pubkey,        
    }


    #[account]
    pub struct CampaignState {    
       pub campaign_details : Vec<CampaignDetails>,
       pub bump : u8,
       pub count : u8,
       pub authority: Pubkey,  
       pub withdraw_request : Vec<WithdrawRequest>,         
    }

    
    #[account]
    pub struct DonatorProgramAccount {
        pub amount_donated : u64,
        pub bump : u8,
    }
   
    
    #[error]
    pub enum ErrorCode {    
       
        #[msg("Name cannot be more than 30 charecters and Description cannot be more than 50 charecters")]
            NameOrDescriptionTooLong,
    }



}
