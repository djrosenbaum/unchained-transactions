import { log } from "@graphprotocol/graph-ts"
import {
  GodsUnchained,
  Transfer,
} from "../generated/GodsUnchained/GodsUnchained"
import { Transaction, Token, Buyer, Seller, Market } from "../generated/schema"

export function handleTransfer(event: Transfer): void {
  let transactionId = event.transaction.hash.toHex();

  let transaction = Transaction.load(transactionId);
  if (transaction == null) {
    log.info('no transaction found: {}', [transactionId]);
  } else {
    log.info('transaction found: {}', [transactionId]);
  }

  transaction = new Transaction(transactionId);

  let tokenId = event.params.tokenId;
  let contract = GodsUnchained.bind(event.address);
  let details = contract.getDetails(event.params.tokenId);
  let token = new Token(tokenId.toString());
  token.index = tokenId;
  token.proto = details.value0;
  token.quality = details.value1;

  token.save();

  transaction.proto = details.value0;
  transaction.quality = details.value1;
  transaction.token = tokenId.toString();

  let buyerAddress = event.params.to.toHexString();
  let buyer = new Buyer(buyerAddress);
  buyer.save();

  transaction.buyer = buyerAddress;

  if (transaction.seller == null) {
    let sellerAddress = event.params.from.toHexString();
    let seller = new Seller(sellerAddress);
    seller.save();
    
    transaction.seller = sellerAddress;
  }

  transaction.save();
}