class StripeCardTokenValue {
	evaluate(context) {
		const num = encodeURIComponent(this.cardNumber);
		const eMonth = encodeURIComponent(this.cardExpMonth);
		const eYear = encodeURIComponent(this.cardExpYear);
		const cvc = encodeURIComponent(this.cardCvc);

		if (!this.stripeKey)
			throw new Error('Stripe API Key is missing');

		const request = new NetworkHTTPRequest();
		request.requestTimeout = 5000;
		request.requestMethod = 'POST';
		request.requestUrl = 'https://api.stripe.com/v1/tokens';
		request.setRequestHeader('Authorization', `Bearer ${this.stripeKey}`);
		request.requestBody = `card[number]=${num}&card[exp_month]=${eMonth}&card[exp_year]=${eYear}&card[cvc]=${cvc}`;

		if (!request.send())
			throw new Error('Stripe request failed');

		const status = request.responseStatusCode;
		let body;

		try {
			body = JSON.parse(request.responseBody);
		} catch (e) {}

		if (status < 400) {
			if (!body)
				throw new Error('Stripe returned invalid data');

			return body.id;
		}

		if (!body || !body.error)
			throw new Error(`Stripe returned an unknown error (${status})`);

		const code = body.error.code ? ` ${body.error.code}` : '';

		throw new Error(`Stripe returned an error (${status}): ${body.error.type} ${code}`);
	}
}

StripeCardTokenValue.identifier = 'com.jamesbillingham.StripeCardTokenValue';
StripeCardTokenValue.title = 'Stripe Card Token';

StripeCardTokenValue.inputs = [
	InputField('stripeKey', 'Stripe API Key', 'String', {
		persisted: true,
		placeholder: 'pk_test_blah',
	}),
	InputField('cardNumber', 'Card Number', 'String', {
		persisted: true,
		defaultValue: '4242 4242 4242 4242',
	}),
	InputField('cardExpMonth', 'Card Expiry Month', 'Number', {
		persisted: true,
		defaultValue: 12,
		float: false,
		minValue: 1,
		maxValue: 12,
	}),
	InputField('cardExpYear', 'Card Expiry Year', 'Number', {
		persisted: true,
		defaultValue: new Date().getUTCFullYear() + 1,
		float: false,
		minValue: new Date().getUTCFullYear(),
		maxValue: new Date().getUTCFullYear() + 100,
	}),
	InputField('cardCvc', 'Card CVC', 'String', {
		persisted: true,
		defaultValue: '123',
	}),
];

registerDynamicValueClass(StripeCardTokenValue);
