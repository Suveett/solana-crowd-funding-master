use anchor_lang::prelude::*;
use self::id as program_id;
use anchor_lang::solana_program::system_program;
declare_id!("F7nnL8QeG9ELnu8CUJfQxtYaVEGTecd7ULrnV2ojxFCw");


#[program]
pub mod solanacrowdfundingproject {
    use super::*;
    

    // `seeds` and `bump` tell us that our `writing_account` is a PDA that can be derived from their respective values

    pub fn initialize(ctx: Context<Initialize>, writing_account_bump: u8) -> ProgramResult {
        let writing_account = &mut ctx.accounts.writing_account;
        let authority = &mut ctx.accounts.authority;
        

        writing_account.owner = program_id();   
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
        
        // Now to allow transactions we want the creator account to sign the transaction.
        if !authority.to_account_info().is_signer {
            msg!("Creator should be signer");
            return Err(ProgramError::IncorrectProgramId);
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

        // Now to allow transactions we want the creator account to sign the transaction.
        if !authority.to_account_info().is_signer {
            msg!("Only Campaign Creator can withdraw");
            return Err(ProgramError::IncorrectProgramId);
        }

        let withdraw_data = WithdrawRequest {
            amount : amount,
            admin : *authority.to_account_info().key,
        };

        writing_account.withdraw_request.push(withdraw_data);
         
         **writing_account.to_account_info().try_borrow_mut_lamports()? -= amount;
         **authority.to_account_info().try_borrow_mut_lamports()? += amount;

         
        Ok(())

    }

    pub fn donate(ctx : Context<Donate>, amount : u64, donator_program_account_bump : u8, slug : String) -> ProgramResult {
        let writing_account = &mut ctx.accounts.writing_account;
        let authority = &mut ctx.accounts.authority;
        let donator_program_account = &mut ctx.accounts.donator_program_account;

        if !authority.to_account_info().is_signer {
            msg!("donator should be signer");
            return Err(ProgramError::IncorrectProgramId);
        }
        
        if slug.len() > 10  {
            return Err(ErrorCode::SlugTooLong.into())
        }

        donator_program_account.amount = amount;
        donator_program_account.bump = donator_program_account_bump;
        donator_program_account.slug = slug.to_string();
       

        let mut campaign_data = CampaignDetails::try_from_slice(*writing_account.to_account_info().data.borrow())
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
            seeds = [b"____profit".as_ref(), authority.key.as_ref()], 
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
    #[instruction(donator_program_account_bump : u8, donation : Donation)]
    pub struct Donate<'info> {
        #[account(mut, has_one = authority)]
        pub writing_account : Account<'info, CampaignState>,
        #[account(mut)]
        pub authority: Signer<'info>,
        #[account(init, 
            seeds = [b"____donation".as_ref(), writing_account.key().as_ref(), donation.slug.as_ref()],
            bump = donator_program_account_bump,
            payer = authority, 
            space = 49)]
        pub donator_program_account : Account<'info, Donation>,
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
        pub amount : u64,
        pub admin : Pubkey,        
    }


    #[account]
    pub struct CampaignState {    
       pub campaign_details : Vec<CampaignDetails>,
       pub owner : Pubkey,
       pub bump : u8,
       pub count : u8,
       pub authority: Pubkey,  
       pub withdraw_request : Vec<WithdrawRequest>,         
    }


    #[account]
    pub struct Donation {     
        pub amount : u64,
        pub bump : u8,
        pub slug : String,      
    }

   
    #[error]
    pub enum ErrorCode {    
        #[msg("Slug cannot be more than 10 characters")]
            SlugTooLong,  
    }



}
