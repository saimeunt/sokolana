/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solver.json`.
 */
export type Solver = {
  "address": "Dxz9KW7PbRBfcyymgNVR59jJe8cscrhgkJixHYg9eGB1",
  "metadata": {
    "name": "solver",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claim",
      "discriminator": [
        62,
        198,
        214,
        193,
        213,
        159,
        108,
        210
      ],
      "accounts": [
        {
          "name": "game",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "gameState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  71,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "idNft"
              }
            ]
          }
        },
        {
          "name": "otherData"
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "idNft",
          "type": "u32"
        }
      ]
    },
    {
      "name": "solve",
      "discriminator": [
        54,
        180,
        237,
        134,
        55,
        139,
        94,
        208
      ],
      "accounts": [
        {
          "name": "game",
          "writable": true
        },
        {
          "name": "otherData"
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "directions",
          "type": "bytes"
        }
      ],
      "returns": "bool"
    }
  ],
  "accounts": [
    {
      "name": "gameState",
      "discriminator": [
        144,
        94,
        208,
        172,
        248,
        99,
        134,
        120
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "indexOutOfBounds",
      "msg": "Index out of bounds."
    },
    {
      "code": 6001,
      "name": "unknownDirection",
      "msg": "Unknown direction."
    },
    {
      "code": 6002,
      "name": "initialisationFailed",
      "msg": "Wrong data."
    },
    {
      "code": 6003,
      "name": "invalidAccount",
      "msg": "Invalid Account."
    },
    {
      "code": 6004,
      "name": "notAuthorized",
      "msg": "Not Authorized."
    },
    {
      "code": 6005,
      "name": "unknownNft",
      "msg": "Unknown NFT."
    },
    {
      "code": 6006,
      "name": "wrongNftId",
      "msg": "Wrong NFT Id."
    }
  ],
  "types": [
    {
      "name": "gameState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "idNft",
            "type": "u32"
          },
          {
            "name": "solved",
            "type": "bool"
          },
          {
            "name": "bestSoluce",
            "type": "bytes"
          },
          {
            "name": "leader",
            "type": "pubkey"
          },
          {
            "name": "nftOwner",
            "type": "pubkey"
          },
          {
            "name": "ownerRewardBalance",
            "type": "u64"
          },
          {
            "name": "leaderRewardBalance",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
