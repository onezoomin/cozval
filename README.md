cozval
======

cosmos validator utils

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/cozval.svg)](https://npmjs.org/package/cozval)
[![Downloads/week](https://img.shields.io/npm/dw/cozval.svg)](https://npmjs.org/package/cozval)
[![License](https://img.shields.io/npm/l/cozval.svg)](https://github.com/gotjoshua/cozval/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g cozval
$ cozval COMMAND
running command...
$ cozval (-v|--version|version)
cozval/0.0.1c linux-x64 node-v12.20.2
$ cozval --help [COMMAND]
USAGE
  $ cozval COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`cozval blockstats [ENDAT] [STARTAT]`](#cozval-blockstats-endat-startat)
* [`cozval help [COMMAND]`](#cozval-help-command)
* [`cozval validator-addresses`](#cozval-validator-addresses)

## `cozval blockstats [ENDAT] [STARTAT]`

Output 

```
USAGE
  $ cozval blockstats [ENDAT] [STARTAT]

OPTIONS
  -n, --node=node  node to query

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/blockstats.js](https://github.com/gotjoshua/cozval/blob/v0.0.1c/src/commands/blockstats.js)_

## `cozval help [COMMAND]`

display help for cozval

```
USAGE
  $ cozval help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `cozval validator-addresses`

Create map of all addresses 

```
USAGE
  $ cozval validator-addresses

OPTIONS
  -n, --node=node  node to query

DESCRIPTION
  ...
  getValidatorMaps() returns two maps of validator objects:
  {
     //// get from genesis 
     moniker: "begreen-ny",
     peer_node: "8025c3ec311463045d86c68f1875396a37587b51@valregen.ny.begreen.nu:26656", // genesis
     peer_id: "8025c3ec311463045d86c68f1875396a37587b51",              // genesis, logs:INF Vote ignored
     peer_add: "valregen.ny.begreen.nu:26656",                         // genesis
     valoper: "regen:valoper1xq3aq5ctyj3knu32usn66df9a67n0sf7ts5qdn",  // genesis, explorer
     regen: "regen:1xq3aq5ctyj3knu32usn66df9a67n0sf78uwl9k",           // genesis, explorer
     secp256k1: "A3Zz4JM1OjBDM5Kn9J86u5NS1rxR6A+TQ+Zg52uGzU7Z",        // genesis
     ed25519: "iARPJIXVwen//D6qB5CoQT1KrTK7ffGOkIstFF3KIgk=",          //  genesis, query tendermint-validator-set, 
     /// adds:
     valcons: "regen:valcons14y3uv3g3fp5k473qtdenmn5cv89y2s5nz7cshu",  // query tendermint-validator-set, 
     hex: "A923C6451148696AFA205B733DCE9861CA454293",                  // explorer, query block, valcons->bytes->hex
     // valconsPub: "regen:valconspub1zcjduepq3qzy7fy96hq7nllu864q0y9ggy754tfjhd7lrr5s3vk3ghw2ygyspmhej4", // TODO
  }
```

_See code: [src/commands/validator-addresses.js](https://github.com/gotjoshua/cozval/blob/v0.0.1c/src/commands/validator-addresses.js)_
<!-- commandsstop -->
