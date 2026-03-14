import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();
const APP_URL = 'https://www.interviewsense.org';
const BRAIN_IMG = 'https://i.ibb.co/qLdhbRNX/Untitled.png';

const transporter = nodemailer.createTransport({
  host: 'mail.spacemail.com', port: 465, secure: true,
  auth: { user: 'akhil@interviewsense.org', pass: '$parkY623456' },
});

async function sendOne(email: string, name: string) {
  const unsubToken = Buffer.from(email).toString('base64url');
  const unsubUrl = `${APP_URL}/unsubscribe?token=${unsubToken}`;
  const firstName = name || email.split('@')[0];

  await transporter.sendMail({
    from: 'akhil@interviewsense.org',
    to: email,
    subject: `${firstName}, you haven't practiced in a while`,
    html: `
      <!DOCTYPE html><html lang="en">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#ffffff;font-family:Helvetica,Arial,sans-serif;color:#4b4b4b;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
          <tr><td align="center" style="padding:32px 16px 0;">
            <table width="600" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding-bottom:24px;">
                <span style="font-size:20px;font-weight:700;color:#2563eb;letter-spacing:-0.5px;">InterviewSense</span>
              </td></tr>
            </table>
            <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e5e5e5;">
              <tr><td align="center" style="padding:36px 32px 0;">
                <a href="${APP_URL}/dashboard" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:0.5px;border-radius:9px;line-height:44px;width:260px;text-align:center;">START PRACTICING</a>
              </td></tr>
              <tr><td align="center" style="padding:20px 32px 0;">
                <img src="${BRAIN_IMG}" alt="Keep going!" width="220" style="display:block;margin:0 auto;max-width:100%;"/>
              </td></tr>
              <tr><td align="center" style="padding:16px 32px 0;">
                <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a1a;text-align:center;">Practice your interview skills!</h1>
                <p style="margin:0;font-size:15px;color:#6b6b6b;text-align:center;line-height:1.5;">When you skip a session, your competition doesn't.</p>
              </td></tr>
              <tr><td style="padding:24px 32px 32px;">
                <div style="background:#f8f8f8;border:1px solid #e5e5e5;border-radius:12px;padding:20px 24px;">
                  <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#1a1a1a;">Your practice this week</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="font-size:11px;font-weight:700;color:#afafaf;padding-bottom:8px;">Mo</td>
                      <td align="center" style="font-size:11px;font-weight:700;color:#afafaf;padding-bottom:8px;">Tu</td>
                      <td align="center" style="font-size:11px;font-weight:700;color:#afafaf;padding-bottom:8px;">We</td>
                      <td align="center" style="font-size:11px;font-weight:700;color:#afafaf;padding-bottom:8px;">Th</td>
                      <td align="center" style="font-size:11px;font-weight:700;color:#afafaf;padding-bottom:8px;">Fr</td>
                      <td align="center" style="font-size:11px;font-weight:700;color:#afafaf;padding-bottom:8px;">Sa</td>
                      <td align="center" style="font-size:11px;font-weight:700;color:#afafaf;padding-bottom:8px;">Su</td>
                    </tr>
                    <tr>
                      <td align="center"><div style="width:28px;height:28px;border-radius:50%;background:#e5e5e5;margin:0 auto;"></div></td>
                      <td align="center"><div style="width:28px;height:28px;border-radius:50%;background:#e5e5e5;margin:0 auto;"></div></td>
                      <td align="center"><div style="width:28px;height:28px;border-radius:50%;background:#e5e5e5;margin:0 auto;"></div></td>
                      <td align="center"><div style="width:28px;height:28px;border-radius:50%;background:#e5e5e5;margin:0 auto;"></div></td>
                      <td align="center"><div style="width:28px;height:28px;border-radius:50%;background:#e5e5e5;margin:0 auto;"></div></td>
                      <td align="center"><div style="width:28px;height:28px;border-radius:50%;background:#e5e5e5;margin:0 auto;"></div></td>
                      <td align="center"><div style="width:28px;height:28px;border-radius:50%;background:#f0f0f0;border:2px dashed #d0d0d0;margin:0 auto;"></div></td>
                    </tr>
                  </table>
                </div>
              </td></tr>
            </table>
            <table width="500" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding:24px 0 40px;">
                <p style="margin:0 0 6px;font-size:12px;color:#afafaf;">&copy; ${new Date().getFullYear()} InterviewSense. All rights reserved.</p>
                <a href="${unsubUrl}" style="font-size:12px;color:#afafaf;text-decoration:underline;">Unsubscribe</a>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `,
  });
}

async function main() {
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

  // Only users who did NOT get the first blast (emailVerified is null = Google OAuth users)
  const users = await prisma.user.findMany({
    where: {
      emailUnsubscribed: false,
      emailVerified: null,
      createdAt: { lt: tenDaysAgo },
      OR: [
        { subscription: null },
        { subscription: { plan: 'FREE', status: { not: 'TRIALING' } } },
      ],
    },
    select: { email: true, name: true },
  });

  console.log(`Sending to ${users.length} users...\n`);

  let sent = 0, failed = 0;

  for (const user of users) {
    try {
      await sendOne(user.email, user.name || '');
      console.log(`[${++sent}/${users.length}] Sent -> ${user.email}`);
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error(`FAILED -> ${user.email}:`, err);
      failed++;
    }
  }

  console.log(`\nDone. Sent: ${sent}, Failed: ${failed}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
