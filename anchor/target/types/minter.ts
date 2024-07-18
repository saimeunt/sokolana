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
    },
    {
      "name": "setData",
      "discriminator": [
        223,
        114,
        91,
        136,
        197,
        78,
        153,
        153
      ],
      "accounts": [
        {
          "name": "nftAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "data",
          "type": "u32"
        }
      ]
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
