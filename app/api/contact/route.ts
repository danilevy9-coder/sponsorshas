import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  read: boolean;
}

const DATA_PREFIX = "contact/data";

let memoryCache: ContactSubmission[] | null = null;

async function getData(): Promise<ContactSubmission[]> {
  if (memoryCache !== null) return memoryCache;
  try {
    const result = await list({ prefix: DATA_PREFIX });
    const dataBlobs = result.blobs
      .filter((b) => b.pathname.startsWith(DATA_PREFIX))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    if (dataBlobs.length === 0) return [];
    const res = await fetch(dataBlobs[0].downloadUrl, { cache: "no-store" });
    const data = await res.json();
    memoryCache = data;
    return data;
  } catch {
    return [];
  }
}

async function saveData(data: ContactSubmission[]): Promise<ContactSubmission[]> {
  const result = await put(
    `${DATA_PREFIX}-${Date.now()}.json`,
    JSON.stringify(data),
    { access: "public", contentType: "application/json" }
  );
  memoryCache = data;

  // Clean up old blobs
  try {
    const all = await list({ prefix: DATA_PREFIX });
    const old = all.blobs.filter((b) => b.pathname.startsWith(DATA_PREFIX) && b.url !== result.url);
    if (old.length > 0) {
      const { del } = await import("@vercel/blob");
      await del(old.map((b) => b.url));
    }
  } catch {}

  return data;
}

// POST — new submission from contact form
export async function POST(request: Request) {
  const { name, email, phone, message } = await request.json();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required" },
      { status: 400 }
    );
  }

  try {
    const data = await getData();
    const submission: ContactSubmission = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || "",
      message,
      date: new Date().toISOString(),
      read: false,
    };
    data.unshift(submission); // newest first
    await saveData(data);

    // Forward to email (non-blocking — don't let email failure block the response)
    try {
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
        replyTo: email,
        subject: `New Sponsorship Inquiry from ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;">
            <h2 style="color:#D4AF37;">New Contact Form Submission</h2>
            <hr style="border:1px solid #eee;" />
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
            <hr style="border:1px solid #eee;" />
            <p><strong>Message:</strong></p>
            <p style="white-space:pre-wrap;">${message}</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Email forward failed (submission still saved):", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact save error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

// GET — list all submissions (for admin)
export async function GET() {
  try {
    const data = await getData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}

// PATCH — mark as read
export async function PATCH(request: Request) {
  try {
    const { id } = await request.json();
    const data = await getData();
    const idx = data.findIndex((s) => s.id === id);
    if (idx !== -1) data[idx].read = true;
    const saved = await saveData(data);
    return NextResponse.json({ all: saved });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// DELETE — remove a submission
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const data = await getData();
    const filtered = data.filter((s) => s.id !== id);
    const saved = await saveData(filtered);
    return NextResponse.json({ all: saved });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
