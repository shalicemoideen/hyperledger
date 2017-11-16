#!/bin/bash
cd /home/ubuntu/go/src/github.com/hyperledger/fabric-samples/fabcar;
docker rm -f $(docker ps -aq);
docker network prune -f;
docker rmi dev-peer0.org1.example.com-fabcar-1.0-5c906e402ed29f20260ae42283216aa75549c571e2e380f3615826365d8269ba;
cd /home/ubuntu/go/src/github.com/hyperledger/fabric-samples/fabcar;
npm install;
bash startFabric.sh node &