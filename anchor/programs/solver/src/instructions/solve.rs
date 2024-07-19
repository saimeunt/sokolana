use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::errors::ErrorCode;
use crate::state::{GameState, NftAccount};




#[derive(Accounts)]
pub struct Solve<'info> {

    #[account(mut)]
    pub game: Account<'info, GameState>,
  
    /// CHECK: We do not own this account so
    // we must be very cautious with how we
    // use the data
    other_data: UncheckedAccount<'info>, 

    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}







/*
#[derive(Accounts)]
pub struct GetData<'info> {
    #[account(mut)]
    pub game: Account<'info, GameState>,
    pub nft_account: Account<'info, NftAccount>,
    pub minter_program: Program<'info, Minter>,
}

impl<'info> GetData<'info> {
    pub fn set_data_ctx(&self) -> CpiContext<'_, '_, '_, 'info, GetNftData<'info>> {
        let cpi_program = self.minter_program.to_account_info();
        let cpi_accounts = GetNftData {
            nft_account: self.nft_account.to_account_info()
        };


        CpiContext::new(cpi_program, cpi_accounts) 
    }
}
*/





/*
pub fn set_id(ctx: Context<GetData>, data: u32) -> Result<()> {
    let cpi_program = ctx.accounts.minter_program.to_account_info();
    let cpi_accounts = GetNftData {
        nft_account: ctx.accounts.nft_account.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    minter::cpi::set_data(cpi_ctx, data)
}

pub fn set_id(ctx: Context<GetData>, data: u32) -> Result<()> {

    // ctx.accounts.game.test = ctx.accounts.nft_account.id; 
    minter::cpi::set_data(ctx.accounts.set_data_ctx(), data)
}
*/



pub fn solve(ctx: Context<Solve>, directions: Vec<u8>) -> Result<bool> {
   
    //Paiement des fees pour la cagnotte du NFT et son créateur 
    let lamports_to_transfer:u64 = 1_000_000;

    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.signer.to_account_info(),
            to: ctx.accounts.game.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, lamports_to_transfer)?;

    let game_account = &mut ctx.accounts.game;
    game_account.owner_reward_balance += lamports_to_transfer / 2;
    game_account.leader_reward_balance += lamports_to_transfer / 2;
    

    
    //Récupération des données du NFT
    let nft_data = &ctx.accounts.other_data;

    require!(!nft_data.data_is_empty(), ErrorCode::UnknownNFT);
    

    let mut data_slice: &[u8] = &nft_data.data.borrow();

    let data_struct:NftAccount = 
        AccountDeserialize::try_deserialize(
            &mut data_slice,
        )?;
    
    require!(data_struct.id == game_account.id_nft, ErrorCode::UnknownNFT);
    
    let width:u8 = data_struct.width;
    let height:u8 = data_struct.height;
    let map_data:Vec<u8> = data_struct.data.clone();
        
    
   
   
    if verify(map_data, width, height, &directions)? {
        game_account.solved = true;
        game_account.last_request_result = 2;
        if directions.len() < game_account.best_soluce.len() || game_account.best_soluce.len() == 0  {
            game_account.best_soluce = directions.clone();
            game_account.leader = ctx.accounts.signer.key(); 
            game_account.last_request_result = 3;
        }
        
        return Ok(true);
    }

    game_account.last_request_result = 1;
    return Ok(false);
}


pub fn verify(map_data:Vec<u8>, width:u8, height:u8, directions:&Vec<u8>) -> Result<bool> {

    let mut map_data = map_data.clone();
    let mut player_position:u16 = (width+1).into();

    for (i, &_value) in map_data.iter().enumerate() {
         if map_data[i as usize] == 2 || map_data[ i as usize] == 6 {
             player_position = i as u16;
             break;
         }
    }

    for i in directions {
        let _ = move_to(&mut map_data, width, height, &mut player_position, *i)?; 
    }   
   
    for i in 0..width*height{
        if map_data[i as usize] == 3 {
            return Ok(false);
        }
    }
   
    return Ok(true);
}


pub fn move_to(map_data:&mut Vec<u8>, width:u8, height:u8, player_position:&mut u16, direction: u8) -> Result<()> {
       
    //Détermination de la case d'arrivée du joueur
    let  inc: i8;
    
    match direction {
        1 => inc = -(width as i8),       // Vers le haut
        2 => inc = 1,                    // Vers la droite
        3 => inc = width as i8,          // Vers le bas
        4 => inc = -1,                   // Vers la gauche
        _ => return Err(ErrorCode::UnknownDirection.into()),               // Direction invalide
    }
   
    // Calculer la nouvelle position du joueur
     let new_position = (*player_position as i32) + inc as i32;

    //Le joueur est sur une position d'arrivée 
    let mut reset = 0;
    if map_data[*player_position as usize] == 6 {
        reset = 4;
    }
   
    //Vérification de la possibilité du mouvement 
    require!(new_position >= 0 && new_position < (width as i32) * (height as i32), ErrorCode::IndexOutOfBounds);
        
    
   

    // Vérifier de la présence d'un le mur
    if map_data[new_position as usize] == 1 {
        return Ok(());
    }

   
    // Vérifier la présence d'une caisse
    if map_data[ new_position as usize] == 3 || map_data[ new_position as usize] == 5 {
        let new_position2 = new_position + inc as i32;

        require!( new_position2 >= 0, ErrorCode::IndexOutOfBounds);
        

        // La caisse ne peut pas bouger car bloquer par un mur ou une caisse
        if map_data[ new_position2 as usize] != 0 && map_data[ new_position2 as usize] != 4 {
            return Ok(());
        }


        // Déplacement du player  
        map_data[*player_position as usize] = reset;
        *player_position = new_position as u16;
        if map_data[new_position as  usize] == 5 {
            map_data[new_position as usize] = 6;
        } else {
            map_data[new_position as usize] = 2;
        }

        //Déplacement de la caisse 
        if map_data[new_position2 as  usize] == 0 {
            map_data[new_position2 as usize] = 3;
        } else {
            map_data[new_position2 as usize] = 5;
        }
        return Ok(());
    }


    // Vérifier si la case est une position d'arrivée ou une case vide
    if map_data[new_position as usize] == 4 ||  map_data[new_position as usize] == 0 {
       
        map_data[*player_position as usize] = reset;
        *player_position = new_position as u16;            
        if map_data[new_position as usize] == 4 {
            map_data[new_position as usize] = 6  
        }
        else { 
            map_data[new_position as usize] = 2
        };

        return Ok(());
    }

    return Ok(());
}




    
    // 0 vide
    // 1 wall
    // 2 player 
    // 3 caisse 
    // 4 position d'arrivée
    // 5 caisse + position d'arrivée
    // 6 bonhomme + position d'arrivée 




