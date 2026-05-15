// Midtrans Payment Integration Service
// This service handles payment processing with Midtrans

interface MidtransTransactionDetails {
  order_id: string;
  gross_amount: number;
}

interface MidtransCustomerDetails {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
}

interface MidtransItemDetails {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

interface MidtransTransactionRequest {
  transaction_details: MidtransTransactionDetails;
  customer_details: MidtransCustomerDetails;
  item_details: MidtransItemDetails[];
}

export const midtransService = {
  // Generate Snap token for payment
  async getSnapToken(transactionData: MidtransTransactionRequest): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      // Call backend API to get Snap token from Midtrans
      const response = await fetch('/api/midtrans/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to get Snap token from backend');
      }
      
      const data = await response.json();
      
      if (!data.token) {
        throw new Error('No token returned from backend');
      }
      
      return {
        success: true,
        token: data.token,
      };
    } catch (error: any) {
      console.error('Error getting Snap token:', error);
      return {
        success: false,
        error: error.message || 'Failed to get Snap token. Please ensure the backend API is configured.',
      };
    }
  },

  // Initialize Snap payment popup
  initializeSnap(token: string, onSuccess: (result: any) => void, onPending: (result: any) => void, onError: (result: any) => void): void {
    // Load Midtrans Snap script dynamically
    const script = document.createElement('script');
    script.src = 'https://app.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'Mid-client-production-key');
    script.onload = () => {
      // @ts-ignore - Midtrans Snap is loaded globally
      window.snap.pay(token, {
        onSuccess: onSuccess,
        onPending: onPending,
        onError: onError,
        onClose: () => {
          console.log('Customer closed the popup without finishing the payment');
        },
      });
    };
    document.body.appendChild(script);
  },

  // Create transaction data for subscription
  createSubscriptionTransaction(
    orderId: string,
    amount: number,
    packageName: string,
    customerEmail: string,
    customerName: string,
    duration: number
  ): MidtransTransactionRequest {
    return {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customerName.split(' ')[0],
        last_name: customerName.split(' ').slice(1).join(' ') || '',
        email: customerEmail,
      },
      item_details: [
        {
          id: `pkg-${packageName.toLowerCase().replace(/\s+/g, '-')}`,
          price: amount,
          quantity: 1,
          name: `${packageName} - ${duration} Bulan`,
        },
      ],
    };
  },

  // Format currency for Midtrans (in IDR, no decimals)
  formatAmount(amount: number): number {
    return Math.round(amount);
  },
};
