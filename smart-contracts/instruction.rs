use borsh::BorshDeserialize;
use solana_program::{program_error::ProgramError, pubkey::Pubkey};

pub enum Instruction {
    VerifySignature {
        signer: Pubkey,
        message: String,
        sig: [u8; 64],
    },
}

#[derive(BorshDeserialize)]
struct VerifyPayload {
    signer: Pubkey,
    message: String,
    sig: [u8; 64],
}

impl Instruction {
    // Unpack inbound buffer to associated Instruction
    // The expected format for input is a Borsh serialized vector
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        // Split the first byte of data
        let (&variant, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;

        Ok(match variant {
            0 => {
                let payload = VerifyPayload::try_from_slice(rest).unwrap();
                Self::VerifySignature {
                    signer: payload.signer,
                    message: payload.message,
                    sig: payload.sig,
                }
            }

            _ => return Err(ProgramError::InvalidInstructionData),
        })
    }
}
