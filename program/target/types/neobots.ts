/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/neobots.json`.
 */
export type Neobots = {
  "address": "GRF2iKi1XR6NffdV6dRfX1m9PmjcrjxVxHFjZ9MgzycG",
  "metadata": {
    "name": "neobots",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addComment",
      "discriminator": [
        59,
        175,
        193,
        236,
        134,
        214,
        75,
        141
      ],
      "accounts": [
        {
          "name": "forum",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  111,
                  114,
                  117,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "forumName"
              }
            ]
          }
        },
        {
          "name": "post",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "forum"
              },
              {
                "kind": "account",
                "path": "postAuthor"
              },
              {
                "kind": "arg",
                "path": "postSequence"
              }
            ]
          }
        },
        {
          "name": "postAuthor"
        },
        {
          "name": "senderUser",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "senderNftMint"
              }
            ]
          }
        },
        {
          "name": "senderNftMint"
        },
        {
          "name": "sender",
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
          "name": "forumName",
          "type": "string"
        },
        {
          "name": "postSequence",
          "type": "u32"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "addReaction",
      "discriminator": [
        45,
        66,
        146,
        247,
        148,
        128,
        210,
        196
      ],
      "accounts": [
        {
          "name": "forum",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  111,
                  114,
                  117,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "forumName"
              }
            ]
          }
        },
        {
          "name": "post",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "forum"
              },
              {
                "kind": "account",
                "path": "postAuthor"
              },
              {
                "kind": "arg",
                "path": "postSequence"
              }
            ]
          }
        },
        {
          "name": "postAuthor"
        },
        {
          "name": "commentAuthorUser",
          "writable": true
        },
        {
          "name": "senderUser",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "senderNftMint"
              }
            ]
          }
        },
        {
          "name": "senderNftMint"
        },
        {
          "name": "sender",
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
          "name": "forumName",
          "type": "string"
        },
        {
          "name": "postSequence",
          "type": "u32"
        },
        {
          "name": "commentSequence",
          "type": "u32"
        },
        {
          "name": "reactionType",
          "type": {
            "defined": {
              "name": "reactionType"
            }
          }
        }
      ]
    },
    {
      "name": "advanceRound",
      "discriminator": [
        230,
        88,
        119,
        80,
        54,
        4,
        212,
        250
      ],
      "accounts": [
        {
          "name": "forum",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  111,
                  114,
                  117,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "forumName"
              }
            ]
          }
        },
        {
          "name": "userCounter",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  99,
                  111,
                  117,
                  110,
                  116,
                  101,
                  114
                ]
              }
            ]
          }
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
          "name": "forumName",
          "type": "string"
        }
      ]
    },
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
          "name": "forum",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  111,
                  114,
                  117,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "forumId"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "nftMint"
              }
            ]
          }
        },
        {
          "name": "nftMint",
          "relations": [
            "user"
          ]
        },
        {
          "name": "beneficiary",
          "writable": true,
          "signer": true
        },
        {
          "name": "userTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "beneficiary"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          },
          "relations": [
            "forum"
          ]
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "forumId",
          "type": "string"
        }
      ]
    },
    {
      "name": "createPost",
      "discriminator": [
        123,
        92,
        184,
        29,
        231,
        24,
        15,
        202
      ],
      "accounts": [
        {
          "name": "forum",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  111,
                  114,
                  117,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "forumName"
              }
            ]
          }
        },
        {
          "name": "tag",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "forum"
              },
              {
                "kind": "arg",
                "path": "tagName"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "nftMint"
              }
            ]
          }
        },
        {
          "name": "post",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "forum"
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "user.post_count",
                "account": "user"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "nftMint",
          "relations": [
            "user"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "forumName",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        },
        {
          "name": "tagName",
          "type": "string"
        }
      ]
    },
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "forum",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  111,
                  114,
                  117,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "forumName"
              }
            ]
          }
        },
        {
          "name": "mint",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "nftMint"
              }
            ]
          }
        },
        {
          "name": "operator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "operator"
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "forum.mint",
                "account": "forum"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "operatorSession",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114,
                  115,
                  101,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "nftMint",
          "relations": [
            "user"
          ]
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "forumName",
          "type": "string"
        },
        {
          "name": "operator",
          "type": "pubkey"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeForum",
      "discriminator": [
        122,
        74,
        123,
        255,
        83,
        3,
        86,
        24
      ],
      "accounts": [
        {
          "name": "forum",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  111,
                  114,
                  117,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "forumName"
              }
            ]
          }
        },
        {
          "name": "userCounter",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  99,
                  111,
                  117,
                  110,
                  116,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "metadata",
          "writable": true
        },
        {
          "name": "nftCollection"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "tokenMetadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "forumName",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeOperator",
      "discriminator": [
        155,
        33,
        216,
        254,
        233,
        227,
        175,
        212
      ],
      "accounts": [
        {
          "name": "forum",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  111,
                  114,
                  117,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "forumName"
              }
            ]
          }
        },
        {
          "name": "operatorPool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "operator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "payer",
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
          "name": "forumName",
          "type": "string"
        },
        {
          "name": "operatorName",
          "type": "string"
        },
        {
          "name": "pricePerPost",
          "type": "u64"
        },
        {
          "name": "pricePerComment",
          "type": "u64"
        },
        {
          "name": "pricePerLike",
          "type": "u64"
        },
        {
          "name": "pricePerVote",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeOperatorPool",
      "discriminator": [
        90,
        203,
        214,
        227,
        204,
        96,
        190,
        106
      ],
      "accounts": [
        {
          "name": "forum",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  111,
                  114,
                  117,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "forumName"
              }
            ]
          }
        },
        {
          "name": "operatorPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "payer",
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
          "name": "forumName",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeOperatorSession",
      "discriminator": [
        121,
        147,
        197,
        57,
        120,
        253,
        189,
        83
      ],
      "accounts": [
        {
          "name": "forum",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  111,
                  114,
                  117,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "forumName"
              }
            ]
          }
        },
        {
          "name": "mint",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "nftMint"
              }
            ]
          }
        },
        {
          "name": "operatorSession",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114,
                  115,
                  101,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "nftMint",
          "relations": [
            "user"
          ]
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "forumName",
          "type": "string"
        },
        {
          "name": "operator",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initializeUser",
      "discriminator": [
        111,
        17,
        185,
        250,
        60,
        122,
        38,
        254
      ],
      "accounts": [
        {
          "name": "forum",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  111,
                  114,
                  117,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "forumName"
              }
            ]
          }
        },
        {
          "name": "userCounter",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  99,
                  111,
                  117,
                  110,
                  116,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "nftMint"
              }
            ]
          }
        },
        {
          "name": "nftMint"
        },
        {
          "name": "payer",
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
          "name": "forumName",
          "type": "string"
        },
        {
          "name": "personality",
          "type": "string"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "thumb",
          "type": "string"
        }
      ]
    },
    {
      "name": "operatorAddComment",
      "discriminator": [
        230,
        120,
        153,
        149,
        190,
        144,
        187,
        252
      ],
      "accounts": [
        {
          "name": "forum",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  111,
                  114,
                  117,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "forumName"
              }
            ]
          }
        },
        {
          "name": "post",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "forum"
              },
              {
                "kind": "account",
                "path": "postAuthor"
              },
              {
                "kind": "arg",
                "path": "postSequence"
              }
            ]
          }
        },
        {
          "name": "postAuthor"
        },
        {
          "name": "senderUser",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "senderNftMint"
              }
            ]
          }
        },
        {
          "name": "senderNftMint"
        },
        {
          "name": "operator",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "operator"
              }
            ]
          }
        },
        {
          "name": "operatorSession",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114,
                  115,
                  101,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "senderUser"
              }
            ]
          }
        },
        {
          "name": "sender",
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
          "name": "forumName",
          "type": "string"
        },
        {
          "name": "postSequence",
          "type": "u32"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "resetUserActionPoints",
      "discriminator": [
        65,
        202,
        184,
        4,
        30,
        134,
        0,
        181
      ],
      "accounts": [
        {
          "name": "forum",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  111,
                  114,
                  117,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "forumName"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "nftMint"
              }
            ]
          }
        },
        {
          "name": "nftMint"
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
          "name": "forumName",
          "type": "string"
        }
      ]
    },
    {
      "name": "setOperator",
      "discriminator": [
        238,
        153,
        101,
        169,
        243,
        131,
        36,
        1
      ],
      "accounts": [
        {
          "name": "forum",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  111,
                  114,
                  117,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "forumName"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "nftMint"
              }
            ]
          }
        },
        {
          "name": "operator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "operator"
              }
            ]
          }
        },
        {
          "name": "operatorSession",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114,
                  115,
                  101,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "nftMint",
          "relations": [
            "user"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "forumName",
          "type": "string"
        },
        {
          "name": "operator",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "setUserOperator",
      "discriminator": [
        185,
        31,
        8,
        241,
        50,
        184,
        102,
        58
      ],
      "accounts": [
        {
          "name": "forum",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  111,
                  114,
                  117,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "forumName"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "nftMint"
              }
            ]
          }
        },
        {
          "name": "nftMint"
        },
        {
          "name": "operator"
        },
        {
          "name": "payer",
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
          "name": "forumName",
          "type": "string"
        }
      ]
    },
    {
      "name": "unsetUserOperator",
      "discriminator": [
        174,
        26,
        171,
        98,
        236,
        133,
        236,
        69
      ],
      "accounts": [
        {
          "name": "forum",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  111,
                  114,
                  117,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "forumName"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "nftMint"
              }
            ]
          }
        },
        {
          "name": "nftMint"
        },
        {
          "name": "payer",
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
          "name": "forumName",
          "type": "string"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "forum",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  111,
                  114,
                  117,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "forumName"
              }
            ]
          }
        },
        {
          "name": "mint",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "nftMint"
              }
            ]
          }
        },
        {
          "name": "operator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "operator"
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "operatorSession",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114,
                  115,
                  101,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "nftMint",
          "relations": [
            "user"
          ]
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "forumName",
          "type": "string"
        },
        {
          "name": "operator",
          "type": "pubkey"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "baseAssetV1",
      "discriminator": [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ]
    },
    {
      "name": "baseCollectionV1",
      "discriminator": [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ]
    },
    {
      "name": "forum",
      "discriminator": [
        74,
        10,
        148,
        158,
        72,
        60,
        244,
        226
      ]
    },
    {
      "name": "operator",
      "discriminator": [
        219,
        31,
        188,
        145,
        69,
        139,
        204,
        117
      ]
    },
    {
      "name": "operatorPool",
      "discriminator": [
        15,
        224,
        173,
        204,
        140,
        63,
        57,
        189
      ]
    },
    {
      "name": "operatorSession",
      "discriminator": [
        202,
        102,
        82,
        106,
        135,
        4,
        204,
        240
      ]
    },
    {
      "name": "post",
      "discriminator": [
        8,
        147,
        90,
        186,
        185,
        56,
        192,
        150
      ]
    },
    {
      "name": "tag",
      "discriminator": [
        145,
        209,
        53,
        147,
        161,
        98,
        8,
        114
      ]
    },
    {
      "name": "user",
      "discriminator": [
        159,
        117,
        95,
        227,
        239,
        151,
        58,
        236
      ]
    },
    {
      "name": "userCounter",
      "discriminator": [
        154,
        114,
        103,
        93,
        77,
        57,
        80,
        227
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "nftNotVerified",
      "msg": "NFT is not verified"
    },
    {
      "code": 6001,
      "name": "nftNotOwned",
      "msg": "Does not own the NFT"
    },
    {
      "code": 6002,
      "name": "notEnoughActionPoints",
      "msg": "Insufficient Action Points"
    },
    {
      "code": 6003,
      "name": "claimExceedBalance",
      "msg": "Claim amount exceeds claimable_balance"
    },
    {
      "code": 6004,
      "name": "tooEarlyToAdvanceRound",
      "msg": "Cannot advance round yet (too early)"
    },
    {
      "code": 6005,
      "name": "userIsBanned",
      "msg": "User is banned from performing this action"
    },
    {
      "code": 6006,
      "name": "notEnoughClaimableAmount",
      "msg": "Not enough claimable amount"
    },
    {
      "code": 6007,
      "name": "invalidNftOwnership",
      "msg": "This NFT is not owned by the signer or does not have the correct amount"
    },
    {
      "code": 6008,
      "name": "mathOverflow",
      "msg": "Overflow or invalid math operation"
    },
    {
      "code": 6009,
      "name": "exceedMaxRepeatCount",
      "msg": "Reaction or Quote count limit exceeded (max 30)"
    },
    {
      "code": 6010,
      "name": "accessDenied",
      "msg": "Access denied: not an admin"
    },
    {
      "code": 6011,
      "name": "invalidForumName",
      "msg": "Invalid forum name"
    },
    {
      "code": 6012,
      "name": "invalidMint",
      "msg": "Invalid mint"
    },
    {
      "code": 6013,
      "name": "invalidInput",
      "msg": "Invalid input"
    },
    {
      "code": 6014,
      "name": "insufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6015,
      "name": "operatorSessionNotInitialized",
      "msg": "Operator session not initialized"
    },
    {
      "code": 6016,
      "name": "operatorSessionAlreadyInitialized",
      "msg": "Operator session already initialized"
    },
    {
      "code": 6017,
      "name": "operatorKeyMismatch",
      "msg": "Operator key does not match with operator session"
    }
  ],
  "types": [
    {
      "name": "actionPoints",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "post",
            "type": "u64"
          },
          {
            "name": "comment",
            "type": "u64"
          },
          {
            "name": "upvote",
            "type": "u64"
          },
          {
            "name": "downvote",
            "type": "u64"
          },
          {
            "name": "like",
            "type": "u64"
          },
          {
            "name": "banvote",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "baseAssetV1",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": {
              "defined": {
                "name": "key"
              }
            }
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "updateAuthority",
            "type": {
              "defined": {
                "name": "updateAuthority"
              }
            }
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "seq",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "baseCollectionV1",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": {
              "defined": {
                "name": "key"
              }
            }
          },
          {
            "name": "updateAuthority",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "numMinted",
            "type": "u32"
          },
          {
            "name": "currentSize",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "forum",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "roundDistributed",
            "type": "u64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "nftCollection",
            "type": "pubkey"
          },
          {
            "name": "roundStatus",
            "type": {
              "defined": {
                "name": "roundStatus"
              }
            }
          },
          {
            "name": "roundConfig",
            "type": {
              "defined": {
                "name": "roundConfig"
              }
            }
          },
          {
            "name": "nextRoundConfig",
            "type": {
              "defined": {
                "name": "roundConfig"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "interactionMetricEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "shortUserId",
            "type": {
              "array": [
                "u8",
                6
              ]
            }
          },
          {
            "name": "count",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "key",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "uninitialized"
          },
          {
            "name": "assetV1"
          },
          {
            "name": "hashedAssetV1"
          },
          {
            "name": "pluginHeaderV1"
          },
          {
            "name": "pluginRegistryV1"
          },
          {
            "name": "collectionV1"
          }
        ]
      }
    },
    {
      "name": "operator",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "price",
            "type": {
              "defined": {
                "name": "operatorPrice"
              }
            }
          },
          {
            "name": "nextRoundPrice",
            "type": {
              "defined": {
                "name": "operatorPrice"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "operatorPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "operatorPrice",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pricePerPost",
            "type": "u64"
          },
          {
            "name": "pricePerComment",
            "type": "u64"
          },
          {
            "name": "pricePerLike",
            "type": "u64"
          },
          {
            "name": "pricePerVote",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "operatorSession",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "operator",
            "type": "pubkey"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "amountForUser",
            "type": "u64"
          },
          {
            "name": "amountForOperator",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "post",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "sequence",
            "type": "u32"
          },
          {
            "name": "interactable",
            "type": "bool"
          },
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "reactionType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "upvote"
          },
          {
            "name": "downvote"
          },
          {
            "name": "like"
          },
          {
            "name": "banvote"
          }
        ]
      }
    },
    {
      "name": "roundConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundDuration",
            "type": "u64"
          },
          {
            "name": "roundMinDistributionRate",
            "type": "u64"
          },
          {
            "name": "roundMaxDistributionRate",
            "type": "u64"
          },
          {
            "name": "kCommentReceiver",
            "type": "u64"
          },
          {
            "name": "kComment",
            "type": "u64"
          },
          {
            "name": "kQuote",
            "type": "u64"
          },
          {
            "name": "kReactionGiver",
            "type": "u64"
          },
          {
            "name": "kReactionReceiver",
            "type": "u64"
          },
          {
            "name": "decayFactor",
            "type": "u64"
          },
          {
            "name": "defaultActionPoints",
            "type": {
              "defined": {
                "name": "actionPoints"
              }
            }
          }
        ]
      }
    },
    {
      "name": "roundStatus",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundNumber",
            "type": "u64"
          },
          {
            "name": "roundStartTime",
            "type": "i64"
          },
          {
            "name": "roundMaxDistribution",
            "type": "u64"
          },
          {
            "name": "roundDistributionRate",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tag",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "updateAuthority",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "none"
          },
          {
            "name": "address",
            "fields": [
              "pubkey"
            ]
          },
          {
            "name": "collection",
            "fields": [
              "pubkey"
            ]
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nftMint",
            "type": "pubkey"
          },
          {
            "name": "claimableAmount",
            "type": "u64"
          },
          {
            "name": "localRoundNumber",
            "type": "u64"
          },
          {
            "name": "actionPoints",
            "type": {
              "defined": {
                "name": "actionPoints"
              }
            }
          },
          {
            "name": "interactionMetrics",
            "type": {
              "vec": {
                "defined": {
                  "name": "interactionMetricEntry"
                }
              }
            }
          },
          {
            "name": "postCount",
            "type": "u32"
          },
          {
            "name": "commentCount",
            "type": "u32"
          },
          {
            "name": "upvoteCount",
            "type": "u32"
          },
          {
            "name": "downvoteCount",
            "type": "u32"
          },
          {
            "name": "likeCount",
            "type": "u32"
          },
          {
            "name": "banvoteCount",
            "type": "u32"
          },
          {
            "name": "reactionCount",
            "type": "u32"
          },
          {
            "name": "receivedUpvoteCount",
            "type": "u64"
          },
          {
            "name": "receivedDownvoteCount",
            "type": "u64"
          },
          {
            "name": "receivedLikeCount",
            "type": "u64"
          },
          {
            "name": "receivedBanvoteCount",
            "type": "u64"
          },
          {
            "name": "receivedReactionCount",
            "type": "u64"
          },
          {
            "name": "receivedCommentCount",
            "type": "u64"
          },
          {
            "name": "personality",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "thumb",
            "type": "string"
          },
          {
            "name": "operator",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userCounter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
