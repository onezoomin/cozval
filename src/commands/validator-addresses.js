const { Command, flags } = require('@oclif/command')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
var fs = require('fs')
let { bech32, bech32m } = require('bech32')
const CryptoJS = require('crypto-js')
const { SHA256 } = CryptoJS
const cosmos = require('cosmos-lib')
const { createAddress } = require('@tendermint/sig')


// TODO internalize this mapping
// jq '.app_state.genutil.gen_txs | [ .[] | { 
//   moniker:.body.messages[0].description.moniker, 
//   peer_node: .body.memo, 
//   peer_id: (.body.memo | split("@") | .[0]), 
//   peer_add: (.body.memo | split("@") | .[1]), 
//   valoper:.body.messages[0].validator_address, 
//   regen:.body.messages[0].delegator_address, 
//   secp256k1:.auth_info.signer_infos[0].public_key.key,
//   ed25519:.body.messages[0].pubkey.key
// } ] ' genesis.json > validators-genesis.json
const valDict = JSON.parse(fs.readFileSync('/home/valregen/regenscripts/cozval/src/data/validators-genesis.json', 'utf8'));

const valMapPK = new Map(valDict.map(eachVal => [eachVal.ed25519, eachVal]))



class ValidatorAddressesCommand extends Command {
  async run() {
    const { flags, argv } = this.parse(ValidatorAddressesCommand)

    // const { valMapHEX, valMapPK } = await this.getValidatorMaps()
    // this.log(valMapHEX)

    this.getValconsAndHex()

  }
  async getValidatorMaps() {
    // Add valcons to genesis map
    let res, address, valMapHEX, nonGenesis = 0

    try {
      const { stdout, stderr } = await exec(`regen query tendermint-validator-set 10000`);
      // console.log('stdout:', stdout);
      // console.log('stderr:', stderr);

      res = JSON.parse(stdout)
      // this.log(res)

      for (const eachVal of res.validators) {
        // this.log(eachVal.pub_key.value) // log all pub keys
        const valInfo = valMapPK.get(eachVal.pub_key.value)
        if (valInfo) {
          valInfo.valcons = eachVal.address
          const bytes20 = cosmos.address.getBytes(valInfo.valcons)
          valInfo.hex = bytes20.toString('hex').toUpperCase()
        } else {
          nonGenesis++
        }
      }

      valMapHEX = new Map(valDict.map(eachVal => {
        const valWithHex = valMapPK.get(eachVal.ed25519)
        return [valWithHex.hex, valWithHex]
      }))

      // this.log(valMapHEX)
      // this.log('mapped validators:', valMapHEX.size)
      // this.log(`nonGenesis validators at block 10000: ${nonGenesis}`)

      return { valMapHEX, valMapPK }
    } catch (e) {
      console.error(e); // should contain code (exit code) and signal (that caused the termination).
    }
  }
  async getValconsAndHex() {
    const { flags, argv } = this.parse(ValidatorAddressesCommand)


    // example ////////////////
    // https://aplikigo.regen.aneka.io/validators/regen:valoper1xq3aq5ctyj3knu32usn66df9a67n0sf7ts5qdn
    ///////////////////////////
    const begreen = {
      //// have from genesis 
      moniker: "begreen-ny",
      peer_node: "8025c3ec311463045d86c68f1875396a37587b51@valregen.ny.begreen.nu:26656", // genesis
      peer_id: "8025c3ec311463045d86c68f1875396a37587b51",              // genesis, logs:INF Vote ignored
      peer_add: "valregen.ny.begreen.nu:26656",                         // genesis
      valoper: "regen:valoper1xq3aq5ctyj3knu32usn66df9a67n0sf7ts5qdn",  // genesis, explorer
      regen: "regen:1xq3aq5ctyj3knu32usn66df9a67n0sf78uwl9k",           // genesis, explorer
      secp256k1: "A3Zz4JM1OjBDM5Kn9J86u5NS1rxR6A+TQ+Zg52uGzU7Z",        // genesis
      ed25519: "iARPJIXVwen//D6qB5CoQT1KrTK7ffGOkIstFF3KIgk=",          //  genesis, query tendermint-validator-set, 
      /// wanted:
      valcons: "regen:valcons14y3uv3g3fp5k473qtdenmn5cv89y2s5nz7cshu",  // query tendermint-validator-set, 
      hex: "A923C6451148696AFA205B733DCE9861CA454293",                  // explorer, query block, valcons->bytes->hex
      valconsPub: "regen:valconspub1zcjduepq3qzy7fy96hq7nllu864q0y9ggy754tfjhd7lrr5s3vk3ghw2ygyspmhej4",
    }

    //////// working secp256k1->buffer->createAddress
    let prefix = 'regen:',
      pubkeybuf = Buffer.from(begreen.secp256k1, 'base64')
    let address = createAddress(pubkeybuf, prefix); // const { createAddress } = require('@tendermint/sig') accepts Buffer or Uint8Array
    this.log(address, "?= begreen.regen:  ", (address == begreen.regen),"\n")
    
    prefix = 'regen:valoper'
    address = createAddress(pubkeybuf, prefix); 
    this.log(address, "?= begreen.valoper:  ", (address == begreen.valoper),"\n")

    pubkeybuf = Buffer.from(begreen.ed25519, 'base64')
    prefix = 'regen:valcons'
    address = createAddress(pubkeybuf, prefix); 
    this.log(address, "?= begreen.valcons:  ", (address == begreen.valcons),"\n")


    //////// working valcons->bytes->hex
    let bytes20 = cosmos.address.getBytes(begreen.valcons), // const cosmos = require('cosmos-lib')
    hex = (bytes20.toString('hex').toUpperCase())
    this.log(hex, "?= begreen.hex:  ", (hex == begreen.hex),"\n") // true


    //////// WANTED regen or valoper address or ed25519 -> valcons
    ///   https://github.com/tendermint/sig/blob/289972cf4d9894559f8b1c485a69cc4d0111de74/src/core.ts#L137
    ///   https://github.com/cosmos/cosmjs/blob/8a00b4d6df9bc58e72e50b0e10ee362b68816c9e/packages/launchpad/src/pubkey.ts
    ///   https://github.com/cosmos/cosmos-sdk/blob/v0.40.0-rc3/crypto/keys/ed25519/ed25519.go#L227
    /// 

    // let calcAdd = SHA256(begreen.val)
    // // this.log(calcAdd)
    // this.log(calcAdd.toString(CryptoJS.enc.Hex))
    // this.log("=?")


    // const valdec = bech32.decode(begreen.val)
    // // this.log(valdec)
    // let address = cosmos.address.getAddress(Buffer.from(valdec.words), prefix)
    // this.log(address)


    // const bytes = cosmos.address.getBytes(begreen.pubkey); 
    // address = cosmos.address.getAddressFromBytes(bytes, prefix);
    




    // let words = bech32.toWords(Buffer.from(begreen.hex, 'hex'))

    // let decSig = bech32.encode('regen:valconspub', words)
    // this.log(decSig)

    // let words2 = bech32.toWords(Buffer.from(begreen.pubkey, 'base64'))
    // let decSig2 = bech32.encode('regen:valconspub', words2)
    // this.log(decSig2)
    // this.log(Buffer.from(begreen.pubkey, 'base64').toString('hex'))

  }
}
ValidatorAddressesCommand.description = `Create map of all addresses 
...
Extra documentation goes here
`

ValidatorAddressesCommand.flags = {
  node: flags.string({ char: 'n', description: 'node to query' }),
}


module.exports = ValidatorAddressesCommand
