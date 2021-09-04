//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LPToken is ERC20 {
    address owner;

    constructor() ERC20("LP token", "LPT") {
        owner = msg.sender;
    }

    function mint(address _account, uint256 _amount) public {
        require(msg.sender == owner);
        _mint(_account, _amount);
    }
}

contract MatchingFund {
    string greeting;
    ERC20 private token;
    LPToken private lptoken;
    uint256 expiration;
    address[] whitelistedDonors;
    address[] whitelistedRecipients;
    address[] funders;
    address owner;
    uint256 minimumDonationForLP;

    constructor(
        address _tokenAddr,
        uint16 _duration, // duration in seconds
        uint256 _minimumDonationForLP,
        address[] memory _whitelistedDonors,
        address[] memory _whitelistedRecipients
    ) public {
        require(_whitelistedRecipients.length > 0, "please provide at least one whitelisted recipient for this fund");
        owner = msg.sender;
        expiration = block.timestamp + _duration;
        minimumDonationForLP = _minimumDonationForLP;
        token = ERC20(_tokenAddr);
        lptoken = new LPToken();
        funders.push(msg.sender);
        whitelistedDonors = _whitelistedDonors;
        whitelistedRecipients = _whitelistedRecipients;
    }

    event newDonation(
        address _from,
        address _to,
        uint256 _amount,
        uint256 _totalDonation
    );

    function contains(address[] memory array, address addr)
        internal
        view
        returns (bool)
    {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == addr) {
                return true;
            }
        }
        return false;
    }

    function removeAddressFromArray(address addr, address[] storage array)
        internal
    {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == addr) {
                array[i] = array[array.length - 1];
                array.pop();
                return;
            }
        }
    }

    function getBalance() public view returns (uint256 balance) {
        return token.balanceOf(address(this));
    }

    function isWhitelistedDonor(address _donor) public view returns (bool) {
        return contains(whitelistedDonors, _donor);
    }

    function isWhitelistedRecipient(address _recipient)
        public
        view
        returns (bool)
    {
        return contains(whitelistedRecipients, _recipient);
    }

    function addFunds(uint256 _amount) public returns (uint256 newBalance) {
        require(
            _amount >= minimumDonationForLP,
            "Donation must be higher to become an LP"
        );
        token.transferFrom(msg.sender, address(this), _amount);
        if (!contains(funders, msg.sender)) {
            funders.push(msg.sender);
        }
        lptoken.mint(msg.sender, _amount);
        return token.balanceOf(address(this));
    }

    function addDonor(address _donor) public returns (bool success) {
        require(
            !contains(whitelistedDonors, _donor),
            "donor is already in the whitelist"
        );
        whitelistedDonors.push(_donor);
        return true;
    }

    function removeDonor(address _donor) public returns (bool success) {
        require(
            contains(whitelistedDonors, _donor),
            "donor is not in the whitelist"
        );
        removeAddressFromArray(_donor, whitelistedDonors);
        return true;
    }

    function addRecipient(address _recipient) public returns (bool success) {
        require(
            !contains(whitelistedRecipients, _recipient),
            "recipient is already in the whitelist"
        );
        whitelistedRecipients.push(_recipient);
        return true;
    }

    function removeRecipient(address _recipient) public returns (bool success) {
        require(
            contains(whitelistedRecipients, _recipient),
            "recipient is not in the whitelist"
        );
        removeAddressFromArray(_recipient, whitelistedRecipients);
        return true;
    }

    function donate(address _recipient, uint256 _amount) public {
        require(
            _amount <= token.balanceOf(address(this)),
            "Insufficient funds to match this donation"
        );
        if (whitelistedDonors.length > 0) {
            require(
                contains(whitelistedDonors, msg.sender),
                "You are not allowed to use this matching fund"
            );
        }
        if (whitelistedRecipients.length > 0) {
            require(
                contains(whitelistedRecipients, _recipient),
                "You are not allowed to donate to this address with this matching fund"
            );
        }
        token.transferFrom(msg.sender, _recipient, _amount);
        token.transfer(_recipient, _amount);
        emit newDonation(msg.sender, _recipient, _amount, 2 * _amount);
    }

    modifier onlyOwner {
        require(msg.sender == owner, "must be owner");
        _;
    }

    function closeFund() public onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        if (funders.length == 1) {
            token.transfer(funders[0], token.balanceOf(address(this)));
            return;
        }
        for (uint256 i = 0; i < funders.length; i++) {
            uint256 totalDonated = lptoken.balanceOf(funders[i]);
            uint256 amountToTransfer = (balance * totalDonated) /
                lptoken.totalSupply();
            token.transfer(funders[i], amountToTransfer);
        }
        balance = token.balanceOf(address(this));
    }
}
