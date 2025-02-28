import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://api.comick.io/genre/", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching genre data:", error);
    return NextResponse.json(
      { error: "Failed to fetch genre data" },
      { status: 500 }
    );
  }
}
