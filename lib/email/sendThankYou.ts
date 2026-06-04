import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const SLUG_TO_TEMPLATE: Record<string, string> = {
    'hair-growth-bundle': 'bundle.html',
    'hair-growth-foundations-mini-course': 'mini-course.html',
    '21-day-workbook': 'workbook.html',
};

const SLUG_TO_SUBJECT: Record<string, string> = {
    'hair-growth-bundle': "You're in — start here first",
    'hair-growth-foundations-mini-course': "You're in — here's where to start",
    '21-day-workbook': 'Your digital workbook is ready — start here',
};

export async function sendThankYouEmail({
    email,
    firstName,
    courseSlug,
}: {
    email: string;
    firstName: string;
    courseSlug: string;
}) {
    const templateFile = SLUG_TO_TEMPLATE[courseSlug];
    if (!templateFile) return;

    const templatePath = path.join(
        process.cwd(),
        'emails',
        'thank-you',
        templateFile,
    );

    let html: string;
    try {
        html = fs.readFileSync(templatePath, 'utf-8');
    } catch (e) {
        console.error(`Failed to read email template ${templateFile}:`, e);
        return;
    }

    html = html
        .replace(/\{\{firstName\}\}/g, firstName || 'there')
        .replace(/\{\{year\}\}/g, String(new Date().getFullYear()));

    const subject = SLUG_TO_SUBJECT[courseSlug];

    const resend = new Resend(process.env.RESEND_API_KEY!);
    const { error } = await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL ?? 'Lauren <hello@the-hair-insider.com>',
        replyTo: process.env.RESEND_REPLY_TO ?? 'lauren@the-hair-insider.com',
        to: email,
        subject,
        html,
    });

    if (error) {
        console.error('Resend send failed:', error);
    }
}
