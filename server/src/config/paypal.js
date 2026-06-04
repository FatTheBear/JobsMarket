const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

function environment() {
    let clientId = process.env.PAYPAL_CLIENT_ID || 'your-client-id';
    let clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'your-client-secret';

    if (process.env.PAYPAL_MODE === 'live') {
        return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
    }
    
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

function paypalClient() {
    return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

module.exports = { paypalClient };
