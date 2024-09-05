import { CheckoutRequestType, WebhookType, WebhookDataType, CheckoutResponseDataType, PaymentLinkDataType } from "./type";
declare class PayOS {
    private readonly clientId;
    private readonly apiKey;
    private readonly checksumKey;
    private readonly partnerCode?;
    /**
     * Create a payOS object to use payment channel methods. Credentials are fields provided after creating a payOS payment channel
     * @param {string} clientId Client ID of the payOS payment channel
     * @param {string} apiKey Api Key of the payOS payment channel
     * @param {string} checksumKey Checksum Key of the payOS payment channel
     * @param {string} partnerCode Your partner code
     */
    constructor(clientId: string, apiKey: string, checksumKey: string, partnerCode?: string);
    /**
     * Create a payment link for the order data passed in the parameter
     * @param {CheckoutRequestType} paymentData Payment data
     */
    createPaymentLink(paymentData: CheckoutRequestType): Promise<CheckoutResponseDataType>;
    /**
     * Get payment information of an order that has created a payment link
     * @param {number | string} orderId Order Id
     */
    getPaymentLinkInformation(orderId: string | number): Promise<PaymentLinkDataType>;
    /**
     * Validate the Webhook URL of a payment channel and add or update the Webhook URL for that Payment Channel if successful.
     * @param {string} webhookUrl Your Webhook URL
     */
    confirmWebhook(webhookUrl: string): Promise<string>;
    /**
     * Cancel the payment link of the order
     * @param {number | string} orderId Order ID
     * @param {string} cancellationReason Reason for canceling payment link (optional)
     */
    cancelPaymentLink(orderId: string | number, cancellationReason?: string): Promise<PaymentLinkDataType>;
    /**
     * Verify data received via webhook after payment
     * @param webhookBody Request body received from webhook
     * @return {WebhookDataType} Payment data if payment data is valid, otherwise returns null
     */
    verifyPaymentWebhookData(webhookBody: WebhookType): WebhookDataType;
}
export = PayOS;
