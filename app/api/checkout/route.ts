import Stripe from "stripe";
import { NextResponse } from "next/server";
import { findMasechta, ENTIRE_SHAS_PRICE } from "@/constants/shasData";
import { getActiveSponsorships } from "@/lib/sponsors";

export const dynamic = "force-dynamic";

const secretKey = process.env.STRIPE_SECRET_KEY;

interface CheckoutBody {
  // Names of the masechtot to sponsor (must match shasData names).
  items?: string[];
  // When true, ignore `items` and sponsor the entire Shas at the fixed price.
  entireShas?: boolean;
}

type LineItem = Stripe.Checkout.SessionCreateParams.LineItem;

export async function POST(request: Request) {
  if (!secretKey) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Please contact us directly." },
      { status: 503 }
    );
  }

  const stripe = new Stripe(secretKey);

  try {
    const body = (await request.json()) as CheckoutBody;

    // Resolve the origin so success/cancel URLs point back at this site,
    // whether it's localhost, a preview deploy, or production.
    const origin =
      request.headers.get("origin") || new URL(request.url).origin;

    let lineItems: LineItem[];

    if (body.entireShas) {
      lineItems = [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: ENTIRE_SHAS_PRICE * 100,
            product_data: { name: "Sponsor the Entire Shas" },
          },
        },
      ];
    } else {
      const names = Array.isArray(body.items) ? body.items : [];

      // Don't let two people sponsor the same masechta — drop any that already
      // have an active sponsorship. Failing open (treating none as sponsored)
      // is fine; the worst case is a duplicate the admin can sort out.
      let alreadySponsored = new Set<string>();
      try {
        const active = await getActiveSponsorships();
        alreadySponsored = new Set(active.map((s) => s.masechta));
      } catch (err) {
        console.error("Could not load active sponsorships:", err);
      }

      // Price every selected masechta from server-side data — never trust the
      // client for amounts. Unknown or already-sponsored names are dropped.
      lineItems = names
        .map((name) => findMasechta(name))
        .filter((m): m is NonNullable<typeof m> => Boolean(m))
        .filter((m) => !alreadySponsored.has(m.name))
        .map((m) => ({
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: m.price * 100,
            product_data: { name: `Sponsor Masechta ${m.name} (${m.hebrewName})` },
          },
        }));

      if (lineItems.length === 0) {
        return NextResponse.json(
          {
            error:
              "Those masechtot are no longer available — they may have just been sponsored.",
          },
          { status: 400 }
        );
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      billing_address_collection: "auto",
      // Let the sponsor dedicate the learning at checkout (optional).
      custom_fields: [
        {
          key: "dedication",
          label: {
            type: "custom",
            custom: "Dedicate this learning to (optional)",
          },
          type: "text",
          optional: true,
        },
      ],
      success_url: `${origin}/?sponsored=success`,
      cancel_url: `${origin}/#shas`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
