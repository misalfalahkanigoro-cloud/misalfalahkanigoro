import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@misalfalahkanigoro.sch.id';

let vapidConfigured = false;

export function ensureVapidConfig() {
    if (vapidConfigured) return;
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        throw new Error('VAPID keys are not configured');
    }
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    vapidConfigured = true;
}

export async function sendPushNotification(subscription: { endpoint: string; p256dh: string; auth: string }, payload: any) {
    ensureVapidConfig();
    const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
        },
    };

    return webpush.sendNotification(pushSubscription as any, JSON.stringify(payload));
}
