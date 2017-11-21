/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {

  // The Init method is called when the Smart Contract 'fabcar' is instantiated by the blockchain network
  // Best practice is to have any Ledger initialization in separate function -- see initLedger()
  async Init(stub) {
    console.info('=========== Instantiated fabcar chaincode ===========');
    return shim.success();
  }

  // The Invoke method is called as a result of an application request to run the Smart Contract
  // 'fabcar'. The calling application program has also specified the particular smart contract
  // function to be called, with arguments
  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.error('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async queryCar(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting CarNumber ex: CAR01');
    }
    let carNumber = args[0];

    let carAsBytes = await stub.getState(carNumber); //get the car from chaincode state
    if (!carAsBytes || carAsBytes.toString().length <= 0) {
      throw new Error(carNumber + ' does not exist test: ');
    }
    console.log(carAsBytes.toString());
    return carAsBytes;
  }

  async initLedger(stub, args) {
    console.info('============= START : Initialize Ledger ===========');
    // let cars = [];
    // cars.push({
    //   make: 'Toyota',
    //   model: 'Prius',
    //   color: 'blue',
    //   owner: 'Tomoko'
    // });
    // console.info(cars);

    // var arFile = {
    //   '1' : {'hash':'12345hash1','file':'12345jpg1'},
    //   '2' : {'hash':'12345hash2','file':'12345jpg2'}
    //   };
    // console.info(arFile);
    
    // await stub.putState('shalice', Buffer.from(JSON.stringify(arFile)));
    

    // for (let i = 0; i < cars.length; i++) {
    //   cars[i].docType = 'car';
    //   await stub.putState('CAR' + i, Buffer.from(JSON.stringify(cars[i])));
    //   console.info('Added <--> ', cars[i]);
    // }
    console.info('============= END : Initialize Ledger ===========');
  }

  async createCar(stub, args) {
    console.info('============= START : Create Car ===========');
    if (args.length != 5) {
      throw new Error('Incorrect number of arguments. Expecting 5');
    }

    var car = {
      docType: 'car',
      make: args[1],
      model: args[2],
      color: args[3],
      owner: args[4]
    };

    await stub.putState(args[0], Buffer.from(JSON.stringify(car)));
    console.info('============= END : Create Car ===========');

    await stub.putState(args[1], Buffer.from(JSON.stringify(cars)));
  }


  async createFile(stub, args) {
    console.info('=========== START : Create File ==========');
    // if(args.length != 5) {
    //   throw new Error('Incorrect number of arguments, Expecting 5');
    // }
    var testfile = [];

    var userid = args[0];
    var fileid = args[1];
    var hash = args[2];
    var name = args[3];


    // let userAsBytes = await stub.getState(userid);
    // console.log("User details");
    // console.log(userAsBytes);
    
    var file = {
      hash: args[2],
      name: args[3]
    };

    console.info(JSON.stringify(file));

    // var arFile = {
    //   '12345':{
    //     '1' : {'hash':'12345hash1','file':'12345jpg1'},
    //     '2' : {'hash':'12345hash2','file':'12345jpg2'}
    //   }
    // };

    var arFile = {
      fileid : {'hash': args[2],'file': args[3] }
    };

    // var car = {
    //   docType: 'car',
    //   make: args[1],
    //   model: args[2],
    //   color: args[3],
    //   owner: args[4]
    // };
    console.info(JSON.stringify(arFile));

    await stub.putState(userid, Buffer.from(JSON.stringify(arFile)));
    console.info('============= END : Create File ===========');
  }

  async queryAllCars(stub, args) {

    let startKey = 'CAR0';
    let endKey = 'CAR999';

    let iterator = await stub.getStateByRange(startKey, endKey);

    let allResults = [];
    while (true) {
      let res = await iterator.next();
      console.log(res.value.key);
      console.log(res.value);

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        jsonRes.Key = res.value.key;
        try {
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString('utf8');
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return Buffer.from(JSON.stringify(allResults));
      }
    }
  }

  async changeCarowner(stub, args) {
    console.info('============= START : changeCarowner ===========');
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting 2');
    }

    let carAsBytes = await stub.getState(args[0]);
    let car = JSON.parse(carAsBytes);
    car.owner = args[1];

    await stub.putState(args[0], Buffer.from(JSON.stringify(car)));
    console.info('============= END : changeCarowner ===========');
  }
};

shim.start(new Chaincode());
