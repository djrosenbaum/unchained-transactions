import { log } from "@graphprotocol/graph-ts"
import {
  Contract,
  Fill,
} from "../generated/Contract/Contract"
import { Transaction, Token, Buyer, Seller, Market } from "../generated/schema"

export function handleFill(event: Fill): void {
  let makerAssetData = event.params.makerAssetData;

  // Check for Gods Unchained Token Address
  // 0x0e3a2a1f2146d86a604adc220b4967a898d7fe07
  if (makerAssetData.toHexString().indexOf('0e3a2a1f2146d86a604adc220b4967a898d7fe07') < 0) {
    return;
  }

  let transactionId = event.transaction.hash.toHex();
  let transaction = new Transaction(transactionId);
  log.info('transaction filled: {}', [transactionId]);

  let feeRecipientAddress = event.params.feeRecipientAddress;
  let takerAssetFilledAmount = event.params.takerAssetFilledAmount;
  // let makerAddress = event.params.makerAddress;  

  let market = new Market(feeRecipientAddress.toHexString());
  market.save();

  // let seller = new Seller(makerAddress.toHexString())
  // seller.save();

  transaction.market = feeRecipientAddress.toHexString();
  // transaction.seller = seller;
  transaction.price = takerAssetFilledAmount;
  transaction.timestamp = event.block.timestamp.toI32();

  transaction.save();

  // let orderHash = event.params.orderHash;
  // let takerAddress = event.params.takerAddress;
  // let senderAddress = event.params.senderAddress;
  // let makerAssetFilledAmount = event.params.makerAssetFilledAmount;
  // let makerFeePaid = event.params.makerFeePaid;
  // let takerFeePaid = event.params.takerFeePaid;
}