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
cozval/0.0.1 linux-x64 node-v12.20.2
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

_See code: [src/commands/blockstats.js](https://github.com/gotjoshua/cozval/blob/v0.0.1/src/commands/blockstats.js)_

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
  Extra documentation goes here
```

_See code: [src/commands/validator-addresses.js](https://github.com/gotjoshua/cozval/blob/v0.0.1/src/commands/validator-addresses.js)_
<!-- commandsstop -->
