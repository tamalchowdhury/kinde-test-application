import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

async function verifyKindeToken(
  token: string
): Promise<{ email?: string } | null> {
  const issuerUrl = process.env.KINDE_ISSUER_URL;
  if (!issuerUrl) {
    return null;
  }

  try {
    // Use Kinde's userinfo endpoint to verify the token
    const userinfoUrl = `${issuerUrl}/oauth2/v2/user_profile`;
    const response = await fetch(userinfoUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  // Check for Bearer token in Authorization header (case-insensitive)
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Fallback to session-based auth
    const { getUser, isAuthenticated } = getKindeServerSession();

    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUser();
    return NextResponse.json({ email: user?.email });
  }

  // Extract token from Bearer header
  const token = authHeader.substring(7).trim();

  // Validate token is not empty
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify token with Kinde's userinfo endpoint
  const userData = await verifyKindeToken(token);
  if (!userData || !userData.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ email: userData.email });
}
