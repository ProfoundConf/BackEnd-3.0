const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  contactId: {type: mongoose.Types.ObjectId, ref: 'ContactsNew'},
  result: { type: String, },
  payment_id: { type: Number},
  action: { type: String, },
  status: { type: String, },
  version: { type: Number, },
  type: { type: String, },
  paytype: { type: String, },
  public_key: { type: String, },
  acq_id: { type: Number, },
  order_id: { type: String, },
  liqpay_order_id: { type: String, },
  description: { type: String, },
  sender_card_mask2: { type: String, },
  sender_card_bank: { type: String, },
  sender_card_type: { type: String, },
  sender_card_country: { type: Number, },
  ip: { type: String, },
  amount: { type: Number, },
  currency: { type: String, },
  sender_commission: { type: Number, },
  receiver_commission: { type: Number, },
  agent_commission: { type: Number, },
  amount_debit: { type: Number, },
  amount_credit: { type: Number, },
  commission_debit: { type: Number, },
  commission_credit: { type: Number, },
  currency_debit: { type: String, },
  currency_credit: { type: String, },
  sender_bonus: { type: Number, },
  amount_bonus: { type: Number, },
  mpi_eci: { type: String, },
  is_3ds: { type: Boolean, },
  language: { type: String, },
  create_date: { type: Date, },
  end_date: { type: Date, },
  transaction_id: { type: Number }
}, { timestamps: true });

const Payment = mongoose.model('Payment', PaymentSchema);
module.exports = Payment;