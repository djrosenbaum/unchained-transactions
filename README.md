# Gods Unchained 0x Protocol Subgraph

[Try out the demo](https://djrosenbaum.github.io/unchained-transactions/)

This project was built for [The Graph](https://thegraph.com/) hackathon [Indexing the New Economy](https://thegraph.com/hackathons/2019/12)

This project includes a **subgraph** and a **demo**

## Subgraph

**Description:** This subgraph listens to and stores event data broadcasted from the [0x Exchange v2.1 contract](https://etherscan.io/address/0x080bf510fcbf18b91105470639e9561022937712) and events broadcasted from the [Gods Unchained ERC-721 token contract](https://etherscan.io/address/0x0e3a2a1f2146d86a604adc220b4967a898d7fe07)

The subgraph is hosted here 
https://thegraph.com/explorer/subgraph/djrosenbaum/unchained-marketplace

Try out a sample query
```
// Show me the latest 50 transactions for Avatar of War including the price and timestamp of the transaction

{
  transactions(first: 50, orderBy: timestamp, orderDirection: asc, where:{proto: 260, quality: 4, market_not: null}) {
    price
    timestamp
  }
}
```

## Demo

The demo provides an interface for viewing transactional data by **card name** and **quality**

Simply select a Card and Quality from the dropdowns to view historical transactional data