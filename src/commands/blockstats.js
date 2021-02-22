const { Command, flags } = require('@oclif/command')
const ValidatorAddressesCommand = new (require('./validator-addresses'))

const util = require('util')
const exec = util.promisify(require('child_process').exec)

const { performance, PerformanceObserver } = require("perf_hooks")

// const valDict = JSON.parse(fs.readFileSync('/home/valregen/regenscripts/cozval/src/data/validators-genesis.json', 'utf8'));

// util fx
const range = (endAt = 10, startAt = 0, l = (1 + endAt - startAt)) => [...Array(l).keys()].map(i => i + startAt)

class BlockstatsCommand extends Command {
  static args = [
    {name: 'endAt'},
    {name: 'startAt'},
  ]

  async run() {
    const { args } = this.parse(BlockstatsCommand)
    const endAt = Number(args.endAt) || 10,
      startAt = Number(args.startAt) || 0

    this.log('block:', startAt,'=>', endAt)
    let perf1 = performance.now()
    const { valMapHEX } = await ValidatorAddressesCommand.getValidatorMaps()
    let perf2 = performance.now()
    
    // this.log(valMapHEX)

    let res, blocksChecked = endAt - startAt + 1
    for (const eachHeight of range(endAt, startAt)) {

      try {
        const { stdout, stderr } = await exec(`regen query block ${eachHeight}`);
        // console.log('stdout:', stdout);
        // console.log('stderr:', stderr);

        res = JSON.parse(stdout)
        if(res.block.last_commit.signatures && res.block.last_commit.signatures.length){
          for (const eachSig of res.block.last_commit.signatures) {
            const valhex = eachSig.validator_address.toUpperCase()
            const valInfo = valMapHEX.get(valhex)
            if (valInfo) {
              valInfo.blocks ?
                valInfo.blocks.push(eachHeight) :
                valInfo.blocks = [eachHeight]
              if(eachHeight === endAt) {
                valInfo.blocksChecked = blocksChecked
                valInfo.blocksMissed = blocksChecked - valInfo.blocks.length
              } else {
                // this.log(eachHeight, endAt)
              }
            }
          } // for eachSig per block
        }
      } catch (e) {
        console.error(e); // should contain code (exit code) and signal (that caused the termination).
      }
      
    } // for eachHeight

    let fVals = Array.from(valMapHEX.values()).filter(eachVal => eachVal.blocks)
    this.log(fVals)
    
    let perf3 = performance.now()
    this.log('block:', startAt,'=>', endAt)
    this.log('getValidatorMaps took',perf2-perf1,'ms')
    this.log('block checking took',perf3-perf2,'ms')

  }
}

BlockstatsCommand.description = `Output 
...
Extra documentation goes here
`

BlockstatsCommand.flags = {
  node: flags.string({ char: 'n', description: 'node to query' }),
}

module.exports = BlockstatsCommand
