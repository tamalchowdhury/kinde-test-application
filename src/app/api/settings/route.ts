import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

async function verifyKindeToken(token: string): Promise<boolean> {
  const issuerUrl = process.env.KINDE_ISSUER_URL;
  if (!issuerUrl) {
    return false;
  }

  try {
    // Use Kinde's userinfo endpoint to verify the token
    const userinfoUrl = `${issuerUrl}/oauth2/v2/user_profile`;
    const response = await fetch(userinfoUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function PATCH(request: NextRequest) {
  // Check for Bearer token in Authorization header (case-insensitive)
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Fallback to session-based auth
    const { isAuthenticated } = getKindeServerSession();

    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    // Extract token from Bearer header
    const token = authHeader.substring(7).trim();

    // Validate token is not empty
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token with Kinde's userinfo endpoint
    const isValid = await verifyKindeToken(token);
    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  // Validate theme if provided
  if (body.theme && !["light", "dark"].includes(body.theme)) {
    return NextResponse.json(
      { error: "Invalid theme value. Must be 'light' or 'dark'" },
      { status: 400 }
    );
  }

  // In a real application, you would save the settings to a database here
  // For now, we'll just return success
  return NextResponse.json({
    message: "Settings updated successfully",
    theme: body.theme,
  });
}
