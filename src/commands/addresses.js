const { Command, flags } = require('@oclif/command')
const axios = require('axios')

// const util = require('util')
// const exec = util.promisify(require('child_process').exec)
// var fs = require('fs')

const { sha256 } = require("@cosmjs/crypto")
const { Bech32, fromBase64 } = require("@cosmjs/encoding")
const { encodeBech32Pubkey } = require("@cosmjs/launchpad")
const cosmos = require('cosmos-lib')
const { createAddress: createTendermintAddress } = require('@tendermint/sig')


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
// const valDict = JSON.parse(fs.readFileSync('./src/data/validators-genesis.json', 'utf8'));
// const valMapPK = new Map(valDict.map(eachVal => [eachVal.ed25519, eachVal]))


class AddressesCommand extends Command {

  async run() {
    const { flags, argv } = this.parse(AddressesCommand)
    const { genesisURL, test } = flags

    if (test) {
      this.testValconsAndHex()
    } else {
      // const { valMapHEX, valMapPK } = await AddressesCommand.getValidatorMaps()
      this.log(await AddressesCommand.valMapHEX)
    }

  }

  static async getValidatorMaps(genesisURL = 'https://raw.githubusercontent.com/regen-network/testnets/master/aplikigo-1/genesis.json', force = false) {
    if (!force && AddressesCommand._valMapPK && AddressesCommand._valMapHEX) {
      return {
        valMapPK: AddressesCommand._valMapPK,
        valMapHEX: AddressesCommand._valMapHEX,
      }
    }

    let res, valMapHEX, valMapPK, genesisJSON, genesisRAW, nonGenesis = 0

    try {
      genesisJSON = (await axios.get(genesisURL)).data
      // this.log(genesisJSON)
    } catch (e) {
      console.error('fetching: ', e); // should contain code (exit code) and signal (that caused the termination).
    }

    try {
      const gen_txs = genesisJSON.app_state.genutil.gen_txs

      const valARR = gen_txs.map(eachTx => ({
        moniker: eachTx.body.messages[0].description.moniker,
        peer_node: eachTx.body.memo,
        peer_id: eachTx.body.memo.split("@")[0],
        peer_add: eachTx.body.memo.split("@")[1],
        valoper: eachTx.body.messages[0].validator_address,
        regen: eachTx.body.messages[0].delegator_address,
        secp256k1: eachTx.auth_info.signer_infos[0].public_key,
        ed25519: eachTx.body.messages[0].pubkey
      }))
      valMapPK = new Map(valARR.map(eachVal => {
        // const pubkey = {
        //   type: "tendermint/PubKeyEd25519",
        //   value: "iARPJIXVwen//D6qB5CoQT1KrTK7ffGOkIstFF3KIgk=",
        // };
        eachVal.ed25519.type = "tendermint/PubKeyEd25519"
        eachVal.ed25519.value = eachVal.ed25519.key
        const ed25519PubkeyRaw = fromBase64(eachVal.ed25519.key)

        eachVal.valcons = Bech32.encode("regen:valcons", sha256(ed25519PubkeyRaw).slice(0, 20))

        eachVal.hex = (cosmos.address.getBytes(eachVal.valcons).toString('hex').toUpperCase())

        eachVal.valconspub = encodeBech32Pubkey(eachVal.ed25519, "regen:valconspub")

        return [eachVal.ed25519.key, eachVal]
      }))

      valMapHEX = new Map(valARR.map(eachVal => {
        const valWithHex = valMapPK.get(eachVal.ed25519.key)
        return [valWithHex.hex, valWithHex]
      }))

      AddressesCommand._valMapPK = valMapPK
      // console.log(valMapPK)
      AddressesCommand._valMapHEX = valMapHEX
      return { valMapHEX, valMapPK }
    } catch (e) {
      console.error('mapping: ', e); // should contain code (exit code) and signal (that caused the termination).
    }

    try {
      // const { stdout, stderr } = await exec(`regen query tendermint-validator-set 10000`);
      // // console.log('stdout:', stdout);
      // // console.log('stderr:', stderr);

      // res = JSON.parse(stdout)
      // // this.log(res)

      // for (const eachVal of res.validators) {
      //   // this.log(eachVal.pub_key.value) // log all pub keys
      //   const valInfo = valMapPK.get(eachVal.pub_key.value)
      //   if (valInfo) {
      //     valInfo.valcons = eachVal.address
      //     const bytes20 = cosmos.address.getBytes(valInfo.valcons)
      //     valInfo.hex = bytes20.toString('hex').toUpperCase()
      //   } else {
      //     nonGenesis++
      //   }
      // }

      // valMapHEX = new Map(valDict.map(eachVal => {
      //   const valWithHex = valMapPK.get(eachVal.ed25519)
      //   return [valWithHex.hex, valWithHex]
      // }))

      // this.log(valMapHEX)
      // this.log('mapped validators:', valMapHEX.size)
      // this.log(`nonGenesis validators at block 10000: ${nonGenesis}`)


    } catch (e) {
      console.error(e); // should contain code (exit code) and signal (that caused the termination).
    }
    
  }

  async testValconsAndHex() {
    const { flags, argv } = this.parse(AddressesCommand)

    // example ////////////////
    // https://aplikigo.regen.aneka.io/validators/regen:valoper1xq3aq5ctyj3knu32usn66df9a67n0sf7ts5qdn
    ///////////////////////////
    const begreen = {      
      //// have from genesis :
      moniker: 'begreen-ny',                                                    
      peer_node: '8025c3ec311463045d86c68f1875396a37587b51@valregen.ny.begreen.nu:26656',
      peer_id: '8025c3ec311463045d86c68f1875396a37587b51',                          // logs:INF Vote ignored
      peer_add: 'valregen.ny.begreen.nu:26656',                       
      valoper: 'regen:valoper1xq3aq5ctyj3knu32usn66df9a67n0sf7ts5qdn',              // explorer
      regen: 'regen:1xq3aq5ctyj3knu32usn66df9a67n0sf78uwl9k',                       // explorer
      secp256k1: {                                              
        '@type': '/cosmos.crypto.secp256k1.PubKey',        
        key: 'A3Zz4JM1OjBDM5Kn9J86u5NS1rxR6A+TQ+Zg52uGzU7Z'  
      },        
      ed25519: {                                                      
        '@type': '/cosmos.crypto.ed25519.PubKey',           
        key: 'iARPJIXVwen//D6qB5CoQT1KrTK7ffGOkIstFF3KIgk=',                                           
        type: 'tendermint/PubKeyEd25519',                       // added             
        value: 'iARPJIXVwen//D6qB5CoQT1KrTK7ffGOkIstFF3KIgk='   // added
      },    

      //// generated :
      valcons: 'regen:valcons14y3uv3g3fp5k473qtdenmn5cv89y2s5nz7cshu',              // query tendermint-validator-set 
      hex: 'A923C6451148696AFA205B733DCE9861CA454293',                              // explorer, query block, valcons->bytes->hex                                                                                           
      valconspub: 'regen:valconspub1zcjduepq3qzy7fy96hq7nllu864q0y9ggy754tfjhd7lrr5s3vk3ghw2ygyspmhej4'
    }

    //////// working secp256k1->buffer->createAddress
    let prefix = 'regen:',
      pubkeybuf = Buffer.from(begreen.secp256k1.key, 'base64')
    let address = createTendermintAddress(pubkeybuf, prefix); // const { createAddress } = require('@tendermint/sig') accepts Buffer or Uint8Array
    this.log(address, "?= begreen.regen:  ", (address == begreen.regen), "\n")  // true

    prefix = 'regen:valoper'
    address = createTendermintAddress(pubkeybuf, prefix);
    this.log(address, "?= begreen.valoper:  ", (address == begreen.valoper), "\n")  // true

    //////// working valcons->bytes->hex
    let bytes20 = cosmos.address.getBytes(begreen.valcons), // const cosmos = require('cosmos-lib')
      hex = (bytes20.toString('hex').toUpperCase())
    this.log(hex, "?= begreen.hex:  ", (hex == begreen.hex), "\n") // true


    ////////  ed25519 -> valcons
    ///   Solution thanks to Simon W (@webmaster128)  https://github.com/cosmos/cosmjs/wiki/What-can-CosmJS-do-for-me%3F#derive-valconspub-and-valcons-from-base64-encoded-pubkey
    ///
    ///   Related:
    ///   https://github.com/cosmos/cosmos-sdk/issues/1521
    ///   https://github.com/tendermint/sig/blob/289972cf4d9894559f8b1c485a69cc4d0111de74/src/core.ts#L137
    ///   https://github.com/cosmos/cosmjs/blob/8a00b4d6df9bc58e72e50b0e10ee362b68816c9e/packages/launchpad/src/pubkey.ts
    ///   https://github.com/cosmos/cosmos-sdk/blob/v0.40.0-rc3/crypto/keys/ed25519/ed25519.go#L227
    /// 
    /////////////////////////////

    ///////////
    // base64 encoded Ed25519 pubkey from genesis
    //     -->
    // valcons, valconspub, hex(of 1st 20 bytes of valcons)
    ///////////
    const ed25519PubkeyRaw = fromBase64(begreen.ed25519.value);  // decode base64 string key into Uint8Array

    const addressData = sha256(ed25519PubkeyRaw).slice(0, 20);
    const bech32Address = Bech32.encode("regen:valcons", addressData);
    this.log(bech32Address, "?= begreen.valcons:  ", (bech32Address == begreen.valcons) || `false: ${begreen.valcons}`, "\n") // true

    bytes20 = cosmos.address.getBytes(bech32Address), // const cosmos = require('cosmos-lib')
      hex = (bytes20.toString('hex').toUpperCase())
    this.log(hex, "?= begreen.hex:  ", (hex == begreen.hex), "\n") // true

    const valMapPK = (await AddressesCommand.valMapPK)
    // this.log('valMapPK',valMapPK)
    const begreenVal = valMapPK.get(begreen.ed25519.value)
    const fullAminoPK = begreenVal.ed25519
    const bech32Pubkey = encodeBech32Pubkey(fullAminoPK, "regen:valconspub")
    this.log(bech32Pubkey, "?= begreen.valconspub:  ", (bech32Pubkey == begreen.valconspub) || `false: ${begreen.valconspub}`, "\n") // true

    ///////////
    // failed attempts archive:
    ///////////

    // const pubkeybufstr = Buffer.from(begreen.ed25519.value, 'base64')
    // this.log(pubkeybufstr, "?= ed25519PubkeyRaw  ", (pubkeybufstr == ed25519PubkeyRaw) || `false: ${ed25519PubkeyRaw}`, "\n") // false

    // prefix = 'regen:valcons'
    // address = createAddress(pubkeybuf, prefix)
    // this.log(address, "?= begreen.valcons:  ", (address == begreen.valcons) || `false: ${begreen.valcons}`, "\n") // false

    // address = bech32.encode(prefix, bech32.toWords(pubkeybuf))
    // this.log(address, "?= begreen.valcons:  ", (address == begreen.valcons) || `false: ${begreen.valcons}`, "\n") // false

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

  static get valMapHEX() {
    if (AddressesCommand._valMapHEX) {
      return AddressesCommand._valMapHEX
    } else {
      return (async () => {
        try {
          const { valMapHEX } = await AddressesCommand.getValidatorMaps()
          return valMapHEX
        } catch (e) {
          return console.error('unset _valMapPK: ', e); // fallback value;
        }
      })()
    } // </ fetch _valMapHEX via iife
  }

  static get valMapPK() {
    if (AddressesCommand._valMapPK) {
      return AddressesCommand._valMapPK
    } else {
      return (async () => {
        try {
          const { valMapPK } = await AddressesCommand.getValidatorMaps()
          return valMapPK
        } catch (e) {
          return console.error('unset _valMapPK: ', e); // fallback value;
        }
      })()
    } // </ fetch _valMapPK via iife
  }

} // </ AddressesCommand class
AddressesCommand.description = `Create map of all addresses 
...
getValidatorMaps() returns two maps of validator objects.
valMapHEX:
'A923C6451148696AFA205B733DCE9861CA454293' => {          
  moniker: 'begreen-ny',                                                    
  peer_node: '8025c3ec311463045d86c68f1875396a37587b51@valregen.ny.begreen.nu:26656',
  peer_id: '8025c3ec311463045d86c68f1875396a37587b51', 
  peer_add: 'valregen.ny.begreen.nu:26656',                       
  valoper: 'regen:valoper1xq3aq5ctyj3knu32usn66df9a67n0sf7ts5qdn',
  regen: 'regen:1xq3aq5ctyj3knu32usn66df9a67n0sf78uwl9k',
  secp256k1: {                                          
    '@type': '/cosmos.crypto.secp256k1.PubKey',        
    key: 'A3Zz4JM1OjBDM5Kn9J86u5NS1rxR6A+TQ+Zg52uGzU7Z'  
  },        
  ed25519: {                                                      
    '@type': '/cosmos.crypto.ed25519.PubKey',           
    key: 'iARPJIXVwen//D6qB5CoQT1KrTK7ffGOkIstFF3KIgk=',                                           
    type: 'tendermint/PubKeyEd25519',                    
    value: 'iARPJIXVwen//D6qB5CoQT1KrTK7ffGOkIstFF3KIgk='
  },                                                              
  valcons: 'regen:valcons14y3uv3g3fp5k473qtdenmn5cv89y2s5nz7cshu',         
  hex: 'A923C6451148696AFA205B733DCE9861CA454293',                                                                                                                    
  valconspub: 'regen:valconspub1zcjduepq3qzy7fy96hq7nllu864q0y9ggy754tfjhd7lrr5s3vk3ghw2ygyspmhej4'
}, 

and valMapPK (same contents mapped on ed25519.value)

`

AddressesCommand.flags = {
  genesisURL: flags.string({ char: 'g', description: 'genesisURL' }),
  test: flags.boolean({ char: 't', default: false, description: 'test only' }),
}


module.exports = AddressesCommand
