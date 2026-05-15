import { NextRequest, NextResponse } from 'next/server';

interface MidtransTransactionRequest {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details: {
    first_name: string;
    last_name?: string;
    email: string;
    phone?: string;
  };
  item_details: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const transactionData: MidtransTransactionRequest = await request.json();

    // Midtrans Server Key from environment variable
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    
    console.log('MIDTRANS_SERVER_KEY configured:', !!serverKey);
    
    if (!serverKey) {
      console.error('MIDTRANS_SERVER_KEY not configured');
      return NextResponse.json(
        { error: 'MIDTRANS_SERVER_KEY not configured in environment variables' },
        { status: 500 }
      );
    }

    // Midtrans API endpoint (use sandbox or production based on environment)
    const isProduction = process.env.NODE_ENV === 'production';
    const apiUrl = isProduction 
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    console.log('Using Midtrans API:', apiUrl);
    console.log('Transaction data:', JSON.stringify(transactionData, null, 2));

    // Create basic auth header
    const auth = Buffer.from(serverKey + ':').toString('base64');
    console.log('Auth header created (length):', auth.length);

    // Call Midtrans API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify(transactionData),
    });

    console.log('Midtrans API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Midtrans API error:', errorText);
      console.error('Response status:', response.status);
      return NextResponse.json(
        { error: `Failed to create transaction with Midtrans: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Midtrans API response:', data);

    return NextResponse.json({
      token: data.token,
      redirect_url: data.redirect_url,
    });

  } catch (error: any) {
    console.error('Error creating Midtrans transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
