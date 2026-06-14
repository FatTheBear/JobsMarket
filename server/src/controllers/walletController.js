const WalletModel = require('../models/Wallet');
const CoinExchangeFeeModel = require('../models/CoinExchangeFee');
const { paypalClient } = require('../config/paypal');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const crypto = require('crypto');

const walletController = {
  getWalletInfo: async (req, res) => {
    try {
      const userId = req.user.id;
      const wallet = await WalletModel.getWalletInfo(userId);
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "Failed to load wallet data", error: error.message });
    }
  },

  getTransactions: async (req, res) => {
    try {
      const userId = req.user.id;
      const list = await WalletModel.getTransactions(userId);
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: "Failed to load transaction history", error: error.message });
    }
  },

  getActiveFees: async (req, res) => {
    try {
      const fees = await CoinExchangeFeeModel.getActive();
      res.json(fees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fee packages", error: error.message });
    }
  },

  createPayPalOrder: async (req, res) => {
    try {
      const userId = req.user.id;
      const { feeId } = req.body;

      if (!feeId) {
        return res.status(400).json({ message: "feeId is required" });
      }

      const fee = await CoinExchangeFeeModel.getById(feeId);
      if (!fee || !fee.is_active) {
        return res.status(400).json({ message: "Invalid or inactive fee package" });
      }

      // Lấy tỉ giá cố định từ env, nếu không có mặc định là 25000
      const vndToUsdRate = parseFloat(process.env.VND_TO_USD_RATE || 25000);
      let usdAmount = (fee.price_vnd / vndToUsdRate).toFixed(2);

      // Nếu dưới mức tối thiểu của paypal thì set mức tối thiểu
      if(usdAmount < 0.01) {
        usdAmount = "0.01";
      }

      const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: usdAmount
          },
          description: fee.label || `Recharge ${fee.coins} coins`
        }]
      });

      const order = await paypalClient().execute(request);
      
      const refCode = `TXN-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`;

      await WalletModel.createPendingTransaction(userId, {
        coins: fee.coins,
        amountFiat: fee.price_vnd,
        refCode: refCode,
        paypalOrderId: order.result.id,
        feeId: fee.id
      });

      res.json({ id: order.result.id });

    } catch (error) {
      console.error("PayPal Create Order Error:", error);
      res.status(500).json({ message: "Failed to create order", error: error.message });
    }
  },

  capturePayPalOrder: async (req, res) => {
    try {
      const { orderID } = req.body;
      const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
      request.requestBody({});

      const capture = await paypalClient().execute(request);

      if (capture.result.status === 'COMPLETED') {
         const result = await WalletModel.completePayPalTransaction(orderID);
         res.json({ message: "Payment successful!", result });
      } else {
         res.status(400).json({ message: "Payment not completed" });
      }

    } catch (error) {
      console.error("PayPal Capture Order Error:", error);
      res.status(500).json({ message: "Failed to capture payment", error: error.message });
    }
  }
};

module.exports = walletController;
