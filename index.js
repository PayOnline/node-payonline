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
				return callback("Unable to parse body");
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

	var voidTransaction = function (transactionId, callback) {
		return query("/payment/transaction/void/", {
			"TransactionId": transactionId
		}, [
			"MerchantId",
			"TransactionId",
			"PrivateSecurityKey"
		], callback);
	};

	var partialConfirm = function (transactionId, partialAmount, callback) {
		return query("/payment/transaction/complete/", {
			"TransactionId": transactionId,
			"Amount": partialAmount
		}, [
			"MerchantId",
			"TransactionId",
			"Amount",
			"PrivateSecurityKey"
		], callback);
	};

	var confirm = function (transactionId, callback) {
		return query("/payment/transaction/complete/", {
			"TransactionId": transactionId
		}, [
			"MerchantId",
			"TransactionId",
			"PrivateSecurityKey"
		], callback);
	};

	var getPaymentUrl = function (params, callback) {
		var signedParams = sign(params, [
			"MerchantId",
			"OrderId",
			"Amount",
			"Currency",
			"PrivateSecurityKey"
		]);
		process.nextTick(callback.bind(null, null, options.processingUrl + "/ru/payment/?" + querystring.stringify(signedParams)));
	};

	var parseResponse = function (body, callback) {
		var inputParams = querystring.parse(body),
			signedParams = sign(inputParams, [
				"DateTime",
				"TransactionID",
				"OrderId",
				"Amount",
				"Currency",
				"PrivateSecurityKey"
			]);

		if (inputParams.SecurityKey !== signedParams.SecurityKey) {
			return process.nextTick(callback.bind(null, "Security key mismatch"));
		}

		return process.nextTick(callback.bind(null, null, inputParams));
	};

	this.auth = auth;
	this.void = voidTransaction;
	this.partialConfirm = partialConfirm;
	this.confirm = confirm;
	this.getPaymentUrl = getPaymentUrl;
	this.parseResponse = parseResponse;
};
