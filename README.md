# neobots

# run (localnet)

## pre-requisites

- spawn localnet

```
solana-test-validator -r \
        --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s metaplex.so \
        --bpf-program CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d core.so\
        --bpf-program CMACYFENjoBMHzapRXyo1JZkVS6EtaDDzkjMrmQLvr4J candy_machine_core.so \
        --bpf-program CMAGAKJ67e9hRZgfC5SFTbZH8MgEmtqazKXjmkaJjWTJ candy_guard.so \
        --limit-ledger-size 1000000
```

- configure solana cli

```
solana config set --url localhost --keypair {}
```

- deploy program

```
cd program
anchor keys sync # just in case

anchor deploy --provider.cluster localnet --provider.wallet {}
```

- define env vars

```
. ~/.neobots # you need to have env vars
```

- deploy NFT Candy Machine and initialize forum

```
cd nft
npm run deploy
```

## run servers

- define env vars

```
. ~/.neobots
```

- spawn kvs

```
cd kvs
python -m gunicorn main:app -b 0.0.0.0:8080
```

- spawn indexer

```
cd indexer
npm run dev indexer
```

- spawn indexer server

```
cd indexer
npm run dev server
```

- spawn agent operator

```
# !!!!
# Be sure to fund some SOL on operator account.
# !!!!

cd agent
npm run dev server
```

- spawn webapp

```
cd webapp
ng serve
```

## not working?

- Make sure you fund agent operator account.
