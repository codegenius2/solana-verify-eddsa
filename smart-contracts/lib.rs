use solana_program::{
    account_info::next_account_info, account_info::AccountInfo, entrypoint,
    entrypoint::ProgramResult, pubkey::Pubkey,
};

pub mod error;
pub mod instruction;
pub mod verify_signature_processor;

use instruction::Instruction; // channel instruction

// Entry point is a function call process_instruction
entrypoint!(process_instruction);

// Inside lib.rs
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Unpack called
    let instruction = Instruction::unpack(instruction_data)?;
    // Match against the data struct returned into `instruction` variable
    match instruction {
        Instruction::VerifySignature {
            signer,
            message,
            sig,
        } => {
            // Get Account iterator
            let account_info_iter = &mut accounts.iter();

            // Get accounts
            let sysvar_account = next_account_info(account_info_iter)?;
            let _system_program = next_account_info(account_info_iter)?;

            verify_signature_processor::verify_ed25519(
                sysvar_account,
                signer,
                message.as_bytes().to_vec(),
                sig,
            )
        }
    }
}
