import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { orderId, grossAmount, customerName, email, packageName } = await req.json();

    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const authString = Buffer.from(`${serverKey}:`).toString('base64');

    // URL Production Midtrans
    const midtransUrl = 'https://app.midtrans.com/snap/v1/transactions';

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: customerName,
        email: email,
      },
      item_details: [{ id: 'PKG', price: grossAmount, quantity: 1, name: packageName }]
    };

    const response = await fetch(midtransUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
