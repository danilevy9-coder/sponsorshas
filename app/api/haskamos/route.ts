import { put, list, del } from "@vercel/blob";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export interface Haskama {
  id: string;
  name: string;
  title: string;
  quote: string;
  imageUrl: string;
}

const DATA_PREFIX = "haskamos/data";

let memoryCache: Haskama[] | null = null;

async function getData(): Promise<Haskama[]> {
  if (memoryCache !== null) return memoryCache;

  try {
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

async function saveData(data: Haskama[]): Promise<Haskama[]> {
  const result = await put(
    `${DATA_PREFIX}-${Date.now()}.json`,
    JSON.stringify(data),
    { access: "public", contentType: "application/json" }
  );
  console.log("saveData: saved", data.length, "haskamos to", result.url);

  memoryCache = data;

  try {
    const all = await list({ prefix: DATA_PREFIX });
    const old = all.blobs
      .filter((b) => b.pathname.startsWith(DATA_PREFIX) && b.url !== result.url);
    if (old.length > 0) {
      await del(old.map((b) => b.url));
    }
  } catch {}

  return data;
}

export async function GET() {
  try {
    const data = await getData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = (formData.get("name") as string) || "";
    const title = (formData.get("title") as string) || "";
    const quote = (formData.get("quote") as string) || "";
    const file = formData.get("file") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let imageUrl = "";
    if (file && file.size > 0) {
      const blob = await put(`haskamos/photos/${Date.now()}-${file.name}`, file, {
        access: "public",
      });
      imageUrl = blob.url;
    }

    const data = await getData();
    const entry: Haskama = {
      id: Date.now().toString(),
      name,
      title,
      quote,
      imageUrl,
    };
    data.push(entry);
    const saved = await saveData(data);

    return NextResponse.json({ all: saved, added: entry });
  } catch (error) {
    console.error("Add haskama error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string | null;
    const title = formData.get("title") as string | null;
    const quote = formData.get("quote") as string | null;
    const file = formData.get("file") as File | null;

    const data = await getData();
    const idx = data.findIndex((h) => h.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (name !== null) data[idx].name = name;
    if (title !== null) data[idx].title = title;
    if (quote !== null) data[idx].quote = quote;

    if (file && file.size > 0) {
      // Delete old image if exists
      if (data[idx].imageUrl) {
        try { await del(data[idx].imageUrl); } catch {}
      }
      const blob = await put(`haskamos/photos/${Date.now()}-${file.name}`, file, {
        access: "public",
      });
      data[idx].imageUrl = blob.url;
    }

    const saved = await saveData(data);
    return NextResponse.json({ all: saved, updated: data[idx] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const data = await getData();
    const entry = data.find((h) => h.id === id);

    if (entry?.imageUrl) {
      try { await del(entry.imageUrl); } catch {}
    }

    const filtered = data.filter((h) => h.id !== id);
    const saved = await saveData(filtered);

    return NextResponse.json({ all: saved, success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
