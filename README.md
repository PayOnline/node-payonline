node-payonline
==============

This is a thin wrapper library that makes using PayOnline API a bit easier, doing all the signing/checking job for you.

> **Note that v0.1 is planned to be backwards-incompatible, reflecting forthcoming overhaul of PayOnline API**

Getting started
---------------

```
npm install payonline
```

```js
var PayOnline = require('payonline');

var payOnlineClient = new PayOnline({
	merchantId: "put your id here",
	privateSecurityKey: "put your security key here"
});

payOnlineClient.getPaymentUrl({
	"OrderId": "TestOrderId",
	"Amount": "2.00",
	"Currency": "RUB"
}, function (err, url) {
	console.log("Payment url: " + url);
});

payOnlineClient.parseCallback(
	"DateTime=2008-12-31 23:59:59&TransactionID=1234567&OrderId=56789&Amount=9.99&Currency=USD&SecurityKey=8e22a392a71f19a0cab54834e5ed062f",
	function (err, result) {
		console.log("Transaction ID: " + result.TransactionID);
		console.log("Order ID: " + result.OrderId);
	}
);

payOnlineClient.void(123, function (err, result) {
	if (result.Result !== "Ok") {
		console.log("Unable to void transaction");
	}
});

payOnlineClient.confirm(124, function (err, result) {
	if (result.Result !== "Ok") {
		console.log("Unable to confirm transaction");
	}
});

payOnlineClient.partialConfirm(125, 1.50, function (err, result) {
	if (result.Result !== "Ok") {
		console.log("Unable to confirm transaction");
	}
});
```
