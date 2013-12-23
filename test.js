"use strict";

var PayOnline = require('./index');

var payOnline = new PayOnline({
	processingUrl: "https://secure.payonlinesystem.loc",
	merchantId: "16",
	privateSecurityKey: "65fa8628-7a13-4c59-932d-524899f50623",
	strictSSL: false
});

var callback = function (err, result) {
	console.log("err");
	console.log(err);
	console.log("result");
	console.log(result);
};

payOnline.auth({
		"OrderId": "TestOrderIdFromConsole",
		"Amount": "2.00",
		"Currency": "RUB",
		"Email": "test@test.test",
		"CardHolderName": "TEST PERSON",
		"CardNumber": "4111111111111111",
		"CardExpDate": "1220",
		"CardCvv": "123",
		"Country": "RU",
		"City": "Moscow",
		"Address": "Test address",
		"Zip": "123456",
		"Phone": "+74951234567",
		"Issuer": "TEST BANK"
}, callback);

payOnline.getPaymentUrl({
		"OrderId": "TestOrderIdFromConsole",
		"Amount": "3.00",
		"Currency": "RUB"
}, callback);

payOnline.parseResponse(
	"lang=ru&City=test&Code=1999&SecurityKey=f8b190d7b5b77f44bcdbcddc4f099686&Zip=&Country=US&PaymentAmount=3.00&ECI=7&DateTime=2013-12-23+15%3A57%3A43&ErrorCode=3&Currency=RUB&Amount=3.00&CardNumber=%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A1111&OrderId=TestOrderIdFromConsole&CardHolder=TEST+CARD&Provider=Card&PaymentCurrency=RUB&ContentType=text&TransactionID=5923442", 
	callback
);

payOnline.parseResponse(
	"lang=ru&City=test&Code=1999&SecurityKey=08b190d7b5b77f44bcdbcddc4f099686&Zip=&Country=US&PaymentAmount=3.00&ECI=7&DateTime=2013-12-23+15%3A57%3A43&ErrorCode=3&Currency=RUB&Amount=3.00&CardNumber=%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A1111&OrderId=TestOrderIdFromConsole&CardHolder=TEST+CARD&Provider=Card&PaymentCurrency=RUB&ContentType=text&TransactionID=5923442", 
	callback
);

payOnline.parseResponse(
	"OrderId=TestOrderIdFromConsole&City=Moscow&SecurityKey=ea42deedf4b6cc3e80eaa69bc6a49544&Zip=123456&Country=RU&PaymentAmount=2.00&ECI=7&DateTime=2013-12-23+15%3A57%3A23&Currency=RUB&Amount=2.00&CardNumber=%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A1111&CardHolder=TEST+PERSON&Provider=Card&PaymentCurrency=RUB&ContentType=text&TransactionID=5923441",
	callback
);

var payOnline2 = new PayOnline({
	processingUrl: "https://secure.payonlinesystem.loc",
	merchantId: "16",
	privateSecurityKey: "65fa8628-7a13-4c59-932d-524899f50623",
	strictSSL: false
});
