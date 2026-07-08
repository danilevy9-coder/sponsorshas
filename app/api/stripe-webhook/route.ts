import Stripe from "stripe";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import * as crypto from "crypto";
import { allMasechtot } from "@/constants/shasData";
import { addSponsorships } from "@/lib/sponsors";

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

/** The dedication text a sponsor entered at checkout, or their name, else Anonymous. */
function sponsorText(session: Stripe.Checkout.Session): string {
  return (
    session.custom_fields?.find((f) => f.key === "dedication")?.text?.value ||
    session.customer_details?.name ||
    "Anonymous"
  );
}

/**
 * Which masechtot a completed checkout sponsored, derived from the line-item
 * descriptions created in the checkout route ("Sponsor Masechta X (heb)" and
 * "Sponsor the Entire Shas"). "Entire Shas" expands to every masechta.
 */
function sponsoredMasechtot(lineItems: Stripe.LineItem[]): string[] {
  const names = new Set<string>();
  for (const li of lineItems) {
    const desc = li.description || "";
    if (/entire shas/i.test(desc)) {
      allMasechtot.forEach((m) => names.add(m.name));
      continue;
    }
    const match = desc.match(/^Sponsor Masechta (.+?) \(/);
    if (match) names.add(match[1]);
  }
  return [...names];
}

/** Record the paid sponsorships so they appear on the site for two months. */
async function recordSponsorships(
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[]
) {
  const names = sponsoredMasechtot(lineItems);
  if (names.length === 0) return;
  await addSponsorships(names, sponsorText(session));
}

async function emailAdmin(
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[]
) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Gmail not configured — skipping sponsorship notification.");
    return;
  }

  const itemsHtml =
    lineItems.length > 0
      ? lineItems
          .map(
            (li) =>
              `<li>${li.quantity} × ${li.description} — ${formatAmount(
                li.amount_total,
                li.currency
              )}</li>`
          )
          .join("")
      : "<li>(could not load line items)</li>";

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
    if (webhookSecret.startsWith("whsec_")) {
      // Standard Stripe signing secret — use built-in verification.
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        webhookSecret
      );
    } else {
      // Raw hex secret (e.g. from a filtered webhook endpoint).
      // Manually verify the HMAC-SHA256 signature.
      const parts = Object.fromEntries(
        signature.split(",").map((p) => {
          const [k, ...v] = p.split("=");
          return [k, v.join("=")];
        })
      );
      const timestamp = parts["t"];
      const sig = parts["v1"];
      if (!timestamp || !sig) throw new Error("Malformed stripe-signature header");

      const payload = `${timestamp}.${rawBody}`;
      const expected = crypto
        .createHmac("sha256", webhookSecret)
        .update(payload)
        .digest("hex");

      if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) {
        throw new Error("Signature mismatch");
      }

      // Reject events older than 5 minutes to prevent replay attacks.
      const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
      if (age > 300) throw new Error("Timestamp too old");

      event = JSON.parse(rawBody) as Stripe.Event;
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Line items (what was sponsored) aren't on the event by default — fetch
    // once and reuse for both recording and the notification email.
    let lineItems: Stripe.LineItem[] = [];
    try {
      const res = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 100,
      });
      lineItems = res.data;
    } catch (err) {
      console.error("Failed to list line items:", err);
    }

    // Record the sponsorships so they show on the site for two months.
    try {
      await recordSponsorships(session, lineItems);
    } catch (err) {
      console.error("Failed to record sponsorships:", err);
    }

    try {
      await emailAdmin(session, lineItems);
    } catch (err) {
      // Log but still 200 — Stripe shouldn't retry forever over an email hiccup.
      console.error("Failed to send sponsorship notification:", err);
    }
  }

  return NextResponse.json({ received: true });
}
