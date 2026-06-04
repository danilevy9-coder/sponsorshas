import Stripe from "stripe";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Stripe needs the raw request body to verify the signature, so this route
// must run on the Node runtime and never be statically optimized.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const secretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function formatAmount(cents: number | null, currency: string | null): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  }).format(cents / 100);
}

async function emailAdmin(session: Stripe.Checkout.Session, stripe: Stripe) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Gmail not configured — skipping sponsorship notification.");
    return;
  }

  // Pull the line items (what was sponsored) — not included on the event by default.
  let itemsHtml = "<li>(could not load line items)</li>";
  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
    });
    itemsHtml = lineItems.data
      .map(
        (li) =>
          `<li>${li.quantity} × ${li.description} — ${formatAmount(
            li.amount_total,
            li.currency
          )}</li>`
      )
      .join("");
  } catch (err) {
    console.error("Failed to list line items:", err);
  }

  const email = session.customer_details?.email || "Not provided";
  const name = session.customer_details?.name || "Not provided";
  const dedication =
    session.custom_fields?.find((f) => f.key === "dedication")?.text?.value ||
    "—";
  const amount = formatAmount(session.amount_total, session.currency);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"SponsorShas Website" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    replyTo: session.customer_details?.email || undefined,
    subject: `🎉 New Shas Sponsorship — ${amount}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;">
        <h2 style="color:#D4AF37;">New Sponsorship Received</h2>
        <hr style="border:1px solid #eee;" />
        <p><strong>Amount:</strong> ${amount}</p>
        <p><strong>Sponsor:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Dedication:</strong> ${dedication}</p>
        <hr style="border:1px solid #eee;" />
        <p><strong>Sponsored:</strong></p>
        <ul>${itemsHtml}</ul>
        <hr style="border:1px solid #eee;" />
        <p style="color:#888;font-size:12px;">Stripe session: ${session.id}</p>
      </div>
    `,
  });
}

export async function POST(request: Request) {
  if (!secretKey || !webhookSecret) {
    console.error("Stripe webhook not configured (missing secret).");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const stripe = new Stripe(secretKey);
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Verify the event came from Stripe using the raw body + signing secret.
  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await emailAdmin(session, stripe);
    } catch (err) {
      // Log but still 200 — Stripe shouldn't retry forever over an email hiccup.
      console.error("Failed to send sponsorship notification:", err);
    }
  }

  return NextResponse.json({ received: true });
}
