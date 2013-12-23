"use strict";

var _ = require('underscore'),
	crypto = require('crypto'),
	request = require('request'),
	querystring = require('querystring');

module.exports = function (inputOptions) {
	if (!this) {
		return new module.exports(inputOptions);
	}

	var options = _.defaults(inputOptions, {
		processingUrl: "https://secure.payonlinesystem.com",
		merchantId: "-1",
		privateSecurityKey: "SECURITY-KEY-IS-NOT-SET",
		strictSSL: true
	});

	var sign = function (params, requestSignatureParams) {
		var unsignedRequestParams = _.extend({}, params, {"MerchantId": options.merchantId, "ContentType": "text"}),
			signatureParams = _.extend({}, unsignedRequestParams, {'PrivateSecurityKey': options.privateSecurityKey}),
			signatureContent = _.map(requestSignatureParams, function (key) { return key + '=' + signatureParams[key]; }).join('&'),
			signature = crypto.createHash('md5').update(signatureContent).digest('hex'),
			requestParams = _.extend({}, unsignedRequestParams, {'SecurityKey': signature});

		return requestParams;
	};

	var query = function (relativeUrl, params, requestSignatureParams, callback) {
		var /*actualOptions = _.defaults(options, {
			params: {},
			securityKey: '',
			signatureParamsList: [],
			callbackServer: {
				ip: '127.0.0.100',
				port: 8443,
				https: { //if not set, http listener will be used
					pfx: null, //expects binary contents of the pfx file
					passphrase: '*'
				}
			},
			url: 'https://secure.payonlinesystem.loc/somepath'
		}),
		params = actualOptions.params,*/
		requestParams = sign(params, requestSignatureParams),
		responseHandler = function (err, res, body) {
			if (err) {
				return callback(err);
			}

			if (!body) {
				return callback("Body is empty");
			}

			var result = querystring.parse(body);
			if (!result) {
				return callback("Unable to parse body")
			}

			return callback(null, result);
		};
		request({
			url: options.processingUrl + relativeUrl,
			method: 'POST',
			form: requestParams,
			strictSSL: options.strictSSL
		}, responseHandler);
	};

	var auth = function (params, callback) {
		return query("/payment/transaction/auth/", params, [
			"MerchantId",
			"OrderId",
			"Amount",
			"Currency",
			"PrivateSecurityKey"
		], callback);
	};

	var getPaymentUrl = function (params, callback) {
		var query = sign(params, [
			"MerchantId",
			"OrderId",
			"Amount",
			"Currency",
			"PrivateSecurityKey"
		]);
		process.nextTick(callback.bind(null, null, options.processingUrl + "/ru/payment/?" + querystring.stringify(query)));
	};

	var parseResponse = function (body, callback) {
//lang=ru&City=test&Code=1999&SecurityKey=f8b190d7b5b77f44bcdbcddc4f099686&Zip=&Country=US&PaymentAmount=3.00&ECI=7&DateTime=2013-12-23+15%3A57%3A43&ErrorCode=3&Currency=RUB&Amount=3.00&CardNumber=%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A1111&OrderId=TestOrderIdFromConsole&CardHolder=TEST+CARD&Provider=Card&PaymentCurrency=RUB&ContentType=text&TransactionID=5923442
		var inputParams = querystring.parse(body),
			signedParams = sign(inputParams, [
				"DateTime",
				"TransactionId",
				"OrderId",
				"Amount",
				"Currency",
				"PrivateSecurityKey"
			]);

		if (inputParams["SecurityKey"] !== signedParams["SecurityKey"]) {
			console.log(inputParams["SecurityKey"] + "!=" + signedParams["SecurityKey"]);
			return process.nextTick(callback.bind(null, "Security key mismatch"));
		}

		return process.nextTick(callback.bind(null, null, inputParams));
	};

	this.auth = auth;
	this.getPaymentUrl = getPaymentUrl;
	this.parseResponse = parseResponse;
};
