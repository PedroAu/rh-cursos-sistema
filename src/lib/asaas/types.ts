// Minimal Asaas sandbox v3 shapes — only the fields this story reads/sends.
// No card fields exist here on purpose (NFR-1): Pix/Boleto never touch card data,
// and the card flow (ST2) is redirect-only via invoiceUrl.

export type AsaasBillingType = "PIX" | "BOLETO" | "CREDIT_CARD";

export type AsaasCustomerRequest = {
  name: string;
  cpfCnpj: string;
};

export type AsaasCustomer = {
  id: string; // cus_...
};

// Allowlisted charge-create body. MUST NOT ever include creditCard,
// creditCardHolderInfo, or creditCardToken (NFR-1 / FR-4.3).
export type AsaasChargeRequest = {
  customer: string; // cus_...
  billingType: AsaasBillingType;
  value: number; // REAIS, not cents (FR-5.3)
  dueDate: string; // YYYY-MM-DD
  externalReference?: string;
};

export type AsaasCharge = {
  id: string; // pay_...
  status: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
};

export type AsaasPixQrCode = {
  encodedImage: string; // base64 PNG
  payload: string; // copia-e-cola
};

export type AsaasIdentificationField = {
  identificationField: string; // linha digitável
};

export type AsaasWebhookPayment = {
  id: string; // pay_...
  status: string;
};

export type AsaasWebhookPayload = {
  id: string; // evt_...
  event: string;
  dateCreated?: string;
  payment: AsaasWebhookPayment;
};
