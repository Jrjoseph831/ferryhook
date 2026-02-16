import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { getConfig } from "../config.js";
import type { User, Event, Attempt } from "../types/index.js";

const ses = new SESClient({});

function fromEmail(): string {
  return getConfig().sesFromEmail;
}

export const emailAlerts = {
  async sendDeliveryFailureAlert(
    user: User,
    evt: Event,
    attempt: Attempt
  ): Promise<void> {
    const subject = `[Ferryhook] Webhook delivery failed — ${attempt.destinationUrl}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0f172a; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #f8fafc; font-size: 20px; margin: 0;">Delivery Failed</h1>
        </div>
        <div style="background: #1e293b; padding: 24px; border-radius: 0 0 8px 8px; color: #cbd5e1;">
          <p>Your webhook to <code style="background: #334155; padding: 2px 6px; border-radius: 4px; color: #f59e0b;">${attempt.destinationUrl}</code> has permanently failed after ${attempt.attemptNumber} attempts.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px 0; color: #94a3b8;">Event ID</td><td style="padding: 8px 0; color: #f8fafc;"><code>${evt.eventId}</code></td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Status Code</td><td style="padding: 8px 0; color: #ef4444;">${attempt.statusCode}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Error</td><td style="padding: 8px 0; color: #f8fafc;">${attempt.error ?? "HTTP error"}</td></tr>
          </table>
          <a href="${getConfig().appUrl}/events/${evt.eventId}" style="display: inline-block; background: #3b82f6; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 8px;">View Event Details</a>
        </div>
      </div>
    `;

    await ses.send(
      new SendEmailCommand({
        Source: fromEmail(),
        Destination: { ToAddresses: [user.email] },
        Message: {
          Subject: { Data: subject },
          Body: { Html: { Data: html } },
        },
      })
    );
  },

  async sendPlanLimitWarning(
    user: User,
    usage: number,
    limit: number
  ): Promise<void> {
    const pct = Math.round((usage / limit) * 100);
    const subject = `[Ferryhook] You've used ${pct}% of your monthly events`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0f172a; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #f8fafc; font-size: 20px; margin: 0;">Usage Warning</h1>
        </div>
        <div style="background: #1e293b; padding: 24px; border-radius: 0 0 8px 8px; color: #cbd5e1;">
          <p>You've used <strong style="color: #f59e0b;">${usage.toLocaleString()}</strong> of your <strong>${limit.toLocaleString()}</strong> monthly events (${pct}%).</p>
          <div style="background: #334155; border-radius: 4px; height: 8px; margin: 16px 0;">
            <div style="background: ${pct > 90 ? "#ef4444" : "#f59e0b"}; height: 100%; border-radius: 4px; width: ${Math.min(pct, 100)}%;"></div>
          </div>
          <a href="${getConfig().appUrl}/settings" style="display: inline-block; background: #3b82f6; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 8px;">Upgrade Plan</a>
        </div>
      </div>
    `;

    await ses.send(
      new SendEmailCommand({
        Source: fromEmail(),
        Destination: { ToAddresses: [user.email] },
        Message: {
          Subject: { Data: subject },
          Body: { Html: { Data: html } },
        },
      })
    );
  },

  async sendWeeklyDigest(
    user: User,
    stats: { total: number; delivered: number; failed: number; successRate: number }
  ): Promise<void> {
    const subject = `[Ferryhook] Your weekly webhook digest`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0f172a; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #f8fafc; font-size: 20px; margin: 0;">Weekly Digest</h1>
        </div>
        <div style="background: #1e293b; padding: 24px; border-radius: 0 0 8px 8px; color: #cbd5e1;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 12px; text-align: center;"><div style="font-size: 28px; color: #f8fafc; font-weight: 700;">${stats.total.toLocaleString()}</div><div style="color: #94a3b8; font-size: 12px;">Total Events</div></td>
            <td style="padding: 12px; text-align: center;"><div style="font-size: 28px; color: #10b981; font-weight: 700;">${stats.delivered.toLocaleString()}</div><div style="color: #94a3b8; font-size: 12px;">Delivered</div></td>
            <td style="padding: 12px; text-align: center;"><div style="font-size: 28px; color: #ef4444; font-weight: 700;">${stats.failed.toLocaleString()}</div><div style="color: #94a3b8; font-size: 12px;">Failed</div></td>
            <td style="padding: 12px; text-align: center;"><div style="font-size: 28px; color: #3b82f6; font-weight: 700;">${stats.successRate}%</div><div style="color: #94a3b8; font-size: 12px;">Success Rate</div></td></tr>
          </table>
          <a href="${getConfig().appUrl}" style="display: inline-block; background: #3b82f6; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 16px;">Open Dashboard</a>
        </div>
      </div>
    `;

    await ses.send(
      new SendEmailCommand({
        Source: fromEmail(),
        Destination: { ToAddresses: [user.email] },
        Message: {
          Subject: { Data: subject },
          Body: { Html: { Data: html } },
        },
      })
    );
  },
};
