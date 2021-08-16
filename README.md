# Matching Fund

Smart contract to set up a matching fund to support a cause.
Work in progress.

## Motivation

Instead of donating money directly to a cause, you can leverage your network by creating a matching fund.
For every token donated, the matching fund can match it, effectively doubling the amount raised.

Use cases:

- An individual wants to start a matching fund to donate to a cause (e.g. https://twitter.com/sacca/status/825431544022102016)
- A DAO wants to incentivize their core contributors to donate some tokens to a whitelist of causes (e.g. Apple matching fund program for their employees to give to various 501c3 non profits)

### Features

- Can hold any ERC20 token (donate ETH, DAI, USDC, USDT or any of your own tokens)
- Allow anyone to increase the balance of your matching fund
- Set a whitelist of recipients
- Set a whitelist of donors

### How it works

Every Matching Fund has its own smart contract.
You can define a whitelist of recipients and a whitelist of donors (e.g. if you'd like to limit this matching fund to your core contributors)

You can opt in to let anyone increase the balance of the fund and join you as a co-funder.

When someone wants to donate to a whitelisted recipient, they need to give the Matching Fund an allowance for the amount they wish to donate then execute the donate function.

This will transfer the desired amount of token from the donor's address and it will execute the same transfer out of the Matching Fund balance.

This ensures that both the donor and the Matching Fund are considered as donors of the recipient organisation.

### Contribute

Join the crypto channel on https://discord.allforclimate.earth
