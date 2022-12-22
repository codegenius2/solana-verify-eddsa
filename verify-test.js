const Web3 = require("@solana/web3.js");
const Borsh = require("@project-serum/borsh");
const connection = new Web3.Connection(Web3.clusterApiUrl('devnet')); // define type of network here
const Nacl = require("tweetnacl");
const Base58 = require("base-58");

// TEST CONFIGURATION DATA
const programAddress = 'YOUR-PROGRAM-ADDRESS-HERE';
const pkSigner = 'YOUR-BASE58-PRIVATE-KEY-HERE-FOR-TEST-PURPOSES-ONLY'
const testmsg = "TEST-MESSAGE-TO-BE-SIGNED-HERE";


const programPubKey = new Web3.PublicKey(programAddress);
const keypairSigner = Web3.Keypair.fromSecretKey(Base58.decode(pkSigner))
const signerAddress = keypairSigner.publicKey;
const message = Uint8Array.from(Buffer.from(testmsg));

const signature = Nacl.sign.detached(message, keypairSigner.secretKey);

const borshInstructionSchema = Borsh.struct([
    Borsh.u8('variant'),
    Borsh.publicKey('signer'),
    Borsh.str('message'),
    Borsh.array(Borsh.u8(), 64, 'sig')
]);

const buffer = Buffer.alloc(5000);
borshInstructionSchema.encode({ variant: 0, signer: signerAddress, message: testmsg, sig: signatureWrong }, buffer);
const instructionBuffer = buffer.slice(0, borshInstructionSchema.getSpan(buffer));

const transaction = new Web3.Transaction();

const verifyinstruction = Web3.Ed25519Program.createInstructionWithPublicKey({
    publicKey: keypairSigner.publicKey.toBytes(),
    message: message,
    signature: signature,
})

transaction.add(verifyinstruction);

const instruction = new Web3.TransactionInstruction({
    keys: [
        {
            pubkey: Web3.SYSVAR_INSTRUCTIONS_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: Web3.SystemProgram.programId,
            isSigner: false,
            isWritable: false
        }
    ],
    data: instructionBuffer,
    programId: programPubKey
})

transaction.add(instruction);

Web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [keypairSigner]
).then((tx) => {
    console.log(tx)
}
)



