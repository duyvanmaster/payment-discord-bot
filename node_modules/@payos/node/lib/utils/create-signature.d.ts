import { CheckoutResponseDataType, DataType, PaymentLinkDataType, CheckoutRequestType, WebhookDataType } from "../type";
export declare function createSignatureFromObj(data: DataType<CheckoutResponseDataType | PaymentLinkDataType | WebhookDataType>, key: string): string | null;
export declare function createSignatureOfPaymentRequest(data: DataType<CheckoutRequestType>, key: string): string | null;
