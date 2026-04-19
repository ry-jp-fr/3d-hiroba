import { NextResponse } from "next/server";
import { getInstagramPosts } from "@/lib/instagram";

export const revalidate = 3600;

export async function GET() {
  const result = await getInstagramPosts();
  return NextResponse.json(result);
}
