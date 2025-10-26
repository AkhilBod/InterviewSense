import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    console.log('[VERIFY] Received token:', token ? `${token.substring(0, 8)}...` : 'MISSING');

    if (!token) {
      console.error('[VERIFY] Missing token parameter');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=missing-token`);
    }

    // Find the verification token
    console.log('[VERIFY] Searching database for token:', token);
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token: token },
      include: { user: true }
    });

    if (!verificationToken) {
      console.error('[VERIFY] Token not found. Checking all tokens in database...');
      const allTokens = await prisma.verificationToken.findMany({
        take: 5,
        orderBy: { expires: 'desc' }
      });
      console.error('[VERIFY] Recent tokens in DB:', allTokens.map(t => ({
        identifier: t.identifier,
        token: `${t.token.substring(0, 8)}...`,
        expires: t.expires
      })));
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=invalid-token`);
    }

    console.log('[VERIFY] Found verification token:', {
      identifier: verificationToken.identifier,
      expires: verificationToken.expires
    });

    // Check if token is expired
    if (new Date() > verificationToken.expires) {
      console.error('[VERIFY] Token expired at', verificationToken.expires);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=expired-token`);
    }

    // Get user from database using the identifier (email)
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier }
    });

    if (!user) {
      console.error('[VERIFY] No user found for email:', verificationToken.identifier);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=user-not-found`);
    }

    console.log('[VERIFY] Found user:', {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified
    });

    // Update user's email verification status
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    });

    // Delete the verification token
    await prisma.verificationToken.delete({
      where: { token: token }
    });
    
    console.log('[VERIFY] Email verified and token deleted');
    
    // Send welcome email to the newly verified user (non-fatal if it fails)
    try {
      await sendWelcomeEmail(user.email, user.name || 'there');
    } catch (emailError) {
      console.error('[VERIFY] Welcome email failed (non-fatal):', emailError);
      // Continue - verification is complete
    }

    // Redirect to login page with auto-login parameters
    const redirectUrl = `${process.env.NEXTAUTH_URL}/login?success=email-verified&autoLogin=true&email=${encodeURIComponent(user.email)}`;
    console.log('[VERIFY] Success, redirecting to:', redirectUrl);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('[VERIFY] Error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=verification-failed`);
  }
}
