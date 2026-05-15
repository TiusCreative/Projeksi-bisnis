export const sendWhatsAppWebhook = async (message: string, targetPhone?: string) => {
  try {
    // Ganti URL Webhook ini dengan endpoint dari provider API WhatsApp Anda
    // Contoh provider: Make.com, Zapier, Fonnte, Wati, atau endpoint backend custom Anda.
    const WEBHOOK_URL = process.env.NEXT_PUBLIC_WA_WEBHOOK_URL || "https://hook.us1.make.com/ganti-dengan-webhook-anda";

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        phone: targetPhone || "", // Opsional: Target nomor WA (tergantung setup Webhook Anda)
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error("Gagal menembak Webhook WhatsApp");
    }
  } catch (error) {
    console.error("Terjadi kesalahan pada integrasi Webhook WhatsApp:", error);
  }
};
