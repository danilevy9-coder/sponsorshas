import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { findMasechta } from "@/constants/shasData";
import {
  getActiveSponsorships,
  addSponsorships,
  removeSponsorship,
  SPONSORSHIP_MONTHS,
} from "@/lib/sponsors";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// GET — public. Returns the currently-active sponsorships (expired ones are
// filtered out). Consumed by the homepage to mark sponsored masechtot.
export async function GET() {
  try {
    const data = await getActiveSponsorships();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}

// POST — admin. Manually add (or refresh) a sponsorship for one masechta.
// Body: { masechta: string, sponsor?: string, permanent?: boolean, months?: number }
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const masechta = String(body.masechta || "").trim();
    const sponsor = String(body.sponsor || "").trim();

    if (!masechta) {
      return NextResponse.json({ error: "Masechta is required" }, { status: 400 });
    }
    if (!findMasechta(masechta)) {
      return NextResponse.json({ error: "Unknown masechta" }, { status: 400 });
    }

    // Default to a two-month sponsorship; allow pinning permanently or a custom
    // number of months from the admin UI.
    let months: number | null = SPONSORSHIP_MONTHS;
    if (body.permanent === true) months = null;
    else if (typeof body.months === "number" && body.months > 0) months = body.months;

    const all = await addSponsorships([masechta], sponsor, months);
    return NextResponse.json({ all });
  } catch (error) {
    console.error("Add sponsor error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// DELETE — admin. Remove a sponsorship by id or masechta name.
export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id, masechta } = await request.json();
    if (!id && !masechta) {
      return NextResponse.json(
        { error: "Provide an id or masechta" },
        { status: 400 }
      );
    }
    const all = await removeSponsorship({ id, masechta });
    return NextResponse.json({ all });
  } catch (error) {
    console.error("Remove sponsor error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
