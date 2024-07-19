/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/minter.json`.
 */
export type Minter = {
  "address": "6CicGdVrwar4djSJoQmxdsCz73SEuGuUnoNdmYiqfvAe",
  "metadata": {
    "name": "minter",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createNft",
      "discriminator": [
        231,
        119,
        61,
        97,
        217,
        46,
        142,
        109
      ],
      "accounts": [
        {
          "name": "nftAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "nftIdCounter",
          "writable": true
        },
        {
          "name": "hashStorage",
          "writable": true
        },
        {
          "name": "user",
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
          "name": "height",
          "type": "u8"
        },
        {
          "name": "width",
          "type": "u8"
        },
        {
          "name": "data",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "initializeHashStorage",
      "discriminator": [
        121,
        55,
        27,
        8,
        88,
        23,
        84,
        102
      ],
      "accounts": [
        {
          "name": "hashStorage",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
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
      "name": "initializeNftId",
      "discriminator": [
        155,
        194,
        87,
        115,
        127,
        243,
        225,
        226
      ],
      "accounts": [
        {
          "name": "nftIdCounter",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "counter",
      "discriminator": [
        255,
        176,
        4,
        245,
        188,
        253,
        124,
        25
      ]
    },
    {
      "name": "hashStorage",
      "discriminator": [
        208,
        85,
        121,
        34,
        2,
        191,
        164,
        45
      ]
    },
    {
      "name": "nftAccount",
      "discriminator": [
        33,
        180,
        91,
        53,
        236,
        15,
        63,
        97
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "dataAlreadyExists",
      "msg": "This map already exist"
    },
    {
      "code": 6001,
      "name": "wrongDymension",
      "msg": "Width * height does not mathc data.len"
    }
  ],
  "types": [
    {
      "name": "counter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "hashStorage",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dataHashes",
            "type": {
              "vec": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "nftAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "id",
            "type": "u32"
          },
          {
            "name": "height",
            "type": "u8"
          },
          {
            "name": "width",
            "type": "u8"
          },
          {
            "name": "data",
            "type": "bytes"
          }
        ]
      }
    }
  ]
};
