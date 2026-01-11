import { api } from "../api/api-client";

export interface PaymentRecord {
    id: string;
    type: "QUOTATION" | "INVOICE" | "RECEIPT";
    documentNumber: string;
    applicationId: string;
    amount: number;
    status: string;
    createdAt: string;
    paidAt?: string;
    serviceType?: string; // APPLICATION_FEE, AUDIT_FEE
}

export const PaymentService = {
    /**
     * Fetch user's payments and map to frontend model
     */
    async getMyPayments(): Promise<PaymentRecord[]> {
        const result = await api.get<any[]>("/payments/my");
        if (!result.success || !result.data) return [];

        const invoices = Array.isArray(result.data) ? result.data : (result.data as any).data || [];

        return invoices.map((inv: any) => {
            // Map status
            let status = "PENDING";
            if (inv.status === "paid") status = "APPROVED";
            else if (inv.status === "payment_verification_pending") status = "PENDING_APPROVAL";
            else if (inv.status === "pending") status = "PENDING";
            else if (inv.status === "overdue") status = "PENDING"; // Treat overdue as pending for now

            // Determine Type (Receipt if paid? Or just Invoice with Paid status?)
            // UI distinguishes INVOICE vs RECEIPT. 
            // If Paid, maybe show as Receipt? Or keep as Invoice but Paid?
            // The UI filters: PAID -> p.type === "RECEIPT".
            // Let's generate a "Receipt" record if paid, or just map Invoice to Receipt if status is paid.
            // Simplified: If paid, type = RECEIPT. Else INVOICE.

            const type = inv.status === 'paid' ? 'RECEIPT' : 'INVOICE';

            return {
                id: inv.id,
                type: type,
                documentNumber: inv.invoiceNumber,
                applicationId: inv.application?.applicationNumber || inv.applicationId,
                amount: inv.totalAmount,
                status: status,
                createdAt: inv.createdAt,
                paidAt: inv.paidAt,
                serviceType: inv.serviceType
            } as PaymentRecord;
        });
    },

    /**
     * Upload payment slip to confirm payment
     */
    async uploadPaymentSlip(invoiceId: string, file: File, transactionId?: string): Promise<boolean> {
        const formData = new FormData();
        formData.append("invoiceId", invoiceId);
        formData.append("slipImage", file);
        if (transactionId) formData.append("transactionId", transactionId);

        const result = await api.post("/payments/confirm", formData);
        return result.success;
    },

    async payWithKsher(invoiceId: string) {
        return await api.post<{ payment_url: string }>("/payments/ksher", { invoiceId });
    },

    /**
     * Trigger PDF download
     */
    async downloadInvoicePdf(invoiceId: string, invoiceNumber: string) {
        // Direct link approach or blob fetch?
        // Since we need auth headers, we should use fetch/blob approach if simple link doesn't work with headers.
        // Our api-client attaches headers.

        try {
            const response = await api.get<Blob>(`/invoices/${invoiceId}/pdf`, {
                headers: { 'Accept': 'application/pdf' }
            });

            // api-client usually returns JSON parsed. We need blob.
            // The api-client `request` method parses JSON by default: 
            // const data = await response.json(); 
            // This is a problem for binary data.

            // WORKAROUND: Use direct fetch with auth token for this specific binary call
            // OR modify api-client to handle blobs (too risky given context).

            // Let's use direct native fetch here using AuthService token
            const { AuthService } = require('../services/auth-service'); // Lazy import to avoid cycle if any
            const token = AuthService.getToken();

            const res = await fetch(`/api/invoices/${invoiceId}/pdf`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Download failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${invoiceNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            return true;
        } catch (e) {
            console.error('Download error', e);
            return false;
        }
    }
};
