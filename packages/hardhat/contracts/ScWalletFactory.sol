// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./ScWallet.sol";

contract ScWalletFactory {
  ScWallet[] public scWallets;
  mapping(address => bool) existsScWallet;

  event Create(
    uint indexed contractId,
    address indexed contractAddress,
    address creator,
    address[] owners,
    uint signaturesRequired
  );

  event Owners(
    address indexed contractAddress,
    address[] owners,
    uint256 indexed signaturesRequired
  );


  constructor() {}

  modifier onlyRegistered() {
    require(existsScWallet[msg.sender], "caller not registered to use logger");
    _;
  }

  function emitOwners(
    address _contractAddress,
    address[] memory _owners,
    uint256 _signaturesRequired
  ) external onlyRegistered {
    emit Owners(_contractAddress, _owners, _signaturesRequired);
  }

  function create(
    uint256 _chainId,
    address[] memory _owners,
    uint _signaturesRequired
  ) public payable {
    uint id = numberOfScWallets();

    ScWallet scWallet = (new ScWallet){value: msg.value}(_chainId, _owners, _signaturesRequired, address(this));
    scWallets.push(scWallet);
    existsScWallet[address(scWallet)] = true;

    emit Create(id, address(scWallet), msg.sender, _owners, _signaturesRequired);
    emit Owners(address(scWallet), _owners, _signaturesRequired);
  }

  function numberOfScWallets() public view returns(uint) {
    return scWallets.length;
  }

  function getScWallet(uint256 _index)
    public
    view
    returns (
      address scWalletAddress,
      uint signaturesRequired,
      uint balance
    ) {
      ScWallet scWallet = scWallets[_index];
      return (address(scWallet), scWallet.signaturesRequired(), address(scWallet).balance);
    }
}
