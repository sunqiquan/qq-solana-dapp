# curd-dapp

This is a solana voting program and the app folder is the next.js webpage application

## Getting Started

### Installation

####

```shell
anchor build
```

#### deploy

```shell
anchor deploy
```

#### test

```shell
anchor test --skip-local-validator --skip-deploy
```

##### web client ts code

#### use codama to generate ts client code

```shell
npm install --save-dev codama @codama/cli @codama/renderers-js @codama/nodes-from-anchor
```

#### if don't have codama.json, run the following command to generate it at the root directory of the project.

```shell
npx codama init
```

#### The final generated JSON file is as follows, and you can modify the configuration according to your actual situation.

```json
{
  "idl": "target/idl/curd_dapp.json",
  "before": [],
  "scripts": {
    "js": {
      "from": "@codama/renderers-js",
      "args": ["clients/js"]
    },
    "rust": {
      "from": "@codama/renderers-rust",
      "args": [
        "clients/rust",
        {
          "crateFolder": "clients/rust",
          "formatCode": true
        }
      ]
    }
  }
}
```

### generate ts client code and then copy to app. import PROGRAM_ADDRESS and function from '@/../clients/ts' at where you need in you ts project. notice: my output directory is clients/js, so the command below is suitable for me. please rewrite the command output depends on your actual situation.

```shell
npx codama run js && rm -Rf app/clients && cp -Rf clients ./app
```

### Notice: if your seeds include string fields, the field length must be less than or equal 32, but using string fields as seeds is not recommanded(if necessary, please convert string to hash). if that and you use async function to get instruction, it may be get a wrong pda address. so, you need to pass the pda address caculated by yourself. for example:

```tsx
const signerPubkey = new PublicKey(signer.address);
const [journalEntryPda] = PublicKey.findProgramAddressSync(
  [Buffer.from(input.title), signerPubkey.toBuffer()],
  new PublicKey(CURD_DAPP_PROGRAM_ADDRESS)
);

const ix = await getCreateJournalEntryInstructionAsync({
  journalEntry: journalEntryPda.toBase58() as Address, // this is only for that you have string fields in your seeds.
  signer,
  title: input.title,
  content: input.content,
});

// or you can use this function to get instrutction by pass pda address, there is journalEntry.
const ix = getCreateJournalEntryInstruction({
  journalEntry: journalEntryPda.toBase58() as Address,
  signer,
  title: input.title,
  content: input.content,
});

// if you don't have string fields in your seeds.
const ix = await getCreateJournalEntryInstructionAsync({
  // journalEntry: journalEntryPda.toBase58() as Address, // this is not to be pass
  signer,
  title: input.title,
  content: input.content,
});
```
