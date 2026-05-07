import { list, del } from "@vercel/blob";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get("folder") || undefined;

    const result = await list({ prefix });
    return NextResponse.json(result);
  } catch (error) {
    console.error("List error:", error);
    return NextResponse.json(
      { error: String(error), blobs: [] },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { url } = await request.json();
    await del(url);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
