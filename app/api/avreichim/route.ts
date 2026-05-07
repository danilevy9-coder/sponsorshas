import { put, list, del } from "@vercel/blob";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export interface Avreich {
  id: string;
  name: string;
  imageUrl: string;
}

const DATA_PREFIX = "avreichim/data";

// In-memory cache of the last-saved data to avoid CDN staleness
let memoryCache: Avreich[] | null = null;

async function getData(): Promise<Avreich[]> {
  // Return in-memory data if available (guaranteed fresh after saves)
  if (memoryCache !== null) return memoryCache;

  try {
    // Find the latest data blob
    const result = await list({ prefix: DATA_PREFIX });
    const dataBlobs = result.blobs
      .filter((b) => b.pathname.startsWith(DATA_PREFIX))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    if (dataBlobs.length === 0) return [];

    const latest = dataBlobs[0];
    const res = await fetch(latest.downloadUrl, { cache: "no-store" });
    const data = await res.json();
    memoryCache = data;
    return data;
  } catch (err) {
    console.error("getData error:", err);
    return [];
  }
}

async function saveData(data: Avreich[]): Promise<Avreich[]> {
  // Save with random suffix so we get a unique, uncached URL
  const result = await put(
    `${DATA_PREFIX}-${Date.now()}.json`,
    JSON.stringify(data),
    { access: "public", contentType: "application/json" }
  );
  console.log("saveData: saved", data.length, "entries to", result.url);

  // Update in-memory cache immediately
  memoryCache = data;

  // Clean up old data blobs (keep only the latest)
  try {
    const all = await list({ prefix: DATA_PREFIX });
    const old = all.blobs
      .filter((b) => b.pathname.startsWith(DATA_PREFIX) && b.url !== result.url)
    if (old.length > 0) {
      await del(old.map((b) => b.url));
    }
  } catch {}

  return data;
}

// GET — list all avreichim
export async function GET() {
  try {
    const data = await getData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}

// POST — add one OR many avreichim (bulk)
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // ── JSON bulk upload (photos already uploaded, just names + urls) ──
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const entries: { name: string; imageUrl: string }[] = body.entries;
      if (!Array.isArray(entries) || entries.length === 0) {
        return NextResponse.json({ error: "No entries" }, { status: 400 });
      }

      const data = await getData();
      const newAvreichim: Avreich[] = entries.map((e, i) => ({
        id: (Date.now() + i).toString(),
        name: e.name || "",
        imageUrl: e.imageUrl || "",
      }));
      data.push(...newAvreichim);
      const saved = await saveData(data);

      return NextResponse.json({ all: saved, added: newAvreichim });
    }

    // ── Single FormData upload ──
    const formData = await request.formData();
    const name = (formData.get("name") as string) || "";
    const file = formData.get("file") as File | null;

    if (!name && (!file || file.size === 0)) {
      return NextResponse.json({ error: "Provide a name or photo" }, { status: 400 });
    }

    let imageUrl = "";
    if (file && file.size > 0) {
      const blob = await put(`avreichim/photos/${Date.now()}-${file.name}`, file, {
        access: "public",
      });
      imageUrl = blob.url;
    }

    const data = await getData();
    const newAvreich: Avreich = {
      id: Date.now().toString(),
      name,
      imageUrl,
    };
    data.push(newAvreich);
    const saved = await saveData(data);

    return NextResponse.json({ all: saved, added: newAvreich });
  } catch (error) {
    console.error("Add avreich error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// PATCH — update an avreich's name
export async function PATCH(request: Request) {
  try {
    const { id, name } = await request.json();
    const data = await getData();
    const idx = data.findIndex((a) => a.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    data[idx].name = name ?? data[idx].name;
    const saved = await saveData(data);
    return NextResponse.json({ all: saved, updated: data[idx] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// DELETE — remove an avreich by id
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const data = await getData();
    const avreich = data.find((a) => a.id === id);

    if (avreich?.imageUrl) {
      try { await del(avreich.imageUrl); } catch {}
    }

    const filtered = data.filter((a) => a.id !== id);
    const saved = await saveData(filtered);

    return NextResponse.json({ all: saved, success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
