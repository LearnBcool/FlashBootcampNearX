// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

  

import "forge-std/Script.sol";

import "../src/TaskManager.sol";

  

contract TaskManagerScript is Script {

function run() external {

vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

// Deploy the TaskManager contract

TaskManager taskManager = new TaskManager();

  

console.log("TaskManager contract deployed at:", address(taskManager));

vm.stopBroadcast();

}

}