import { SITE_URL } from '@/lib/seo/site';

export interface ResultsEmailSummary {
    primaryCause: string;
    behaviorToStop: string;
    hasSevereRedFlag: boolean;
    products: { name: string; brand: string; link: string }[];
}

const NO_DOMINANT_PATTERN = 'length protection (no dominant damage pattern)';

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function sentenceCase(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export function resultsLink(token: string) {
    return `${SITE_URL}/hair-growth-edit?r=${encodeURIComponent(token)}`;
}

export const RESULTS_EMAIL_SUBJECT = 'Your Growth Edit results';

export function buildResultsEmail(summary: ResultsEmailSummary, token: string) {
    const link = resultsLink(token);
    const pattern =
        summary.primaryCause === NO_DOMINANT_PATTERN
            ? 'Protecting your length'
            : sentenceCase(summary.primaryCause);
    const productsHeading = summary.hasSevereRedFlag
        ? 'Gentle support for now'
        : 'Your two starting products';

    const productRows = summary.products
        .map(
            (product) =>
                `<tr><td style="padding:4px 0;font-size:15px;line-height:1.5;">&rarr;&nbsp; <a href="${escapeHtml(product.link)}" style="color:#343430;">${escapeHtml(product.name)}</a> <span style="color:#7c7e73;">by ${escapeHtml(product.brand)}</span></td></tr>`,
        )
        .join('');

    const severeNote = summary.hasSevereRedFlag
        ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;">You told us about a change in your hair or scalp that is best assessed in person. Please see a dermatologist, GP, or qualified trichology professional. The gentle suggestions above are not a treatment or a diagnosis.</p>`
        : `<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#7c7e73;">This is educational guidance based on your answers, not a medical diagnosis.</p>`;

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${RESULTS_EMAIL_SUBJECT}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f0eeeb;font-family:Georgia,'Times New Roman',serif;color:#343430;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ddd9d5;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="text-align:center;line-height:0;font-size:0;">
                <img src="https://vbbazoujjawlegemwyrd.supabase.co/storage/v1/object/public/hair-insider-bucket/Thumbnails/emails/header-logo.png" alt="The Hair Insider" width="520" style="display:block;width:100%;max-width:520px;height:auto;border-radius:16px 16px 0 0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px 32px 0 32px;">
                <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">Hey there,</p>
                <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">Here are your results from The Hair Insider assessment, saved so you can come back to them any time.</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(124,126,115,0.12);border-radius:10px;margin:0 0 24px;">
                  <tr>
                    <td style="padding:20px 24px;">
                      <p style="margin:0 0 6px;font-size:13px;font-weight:bold;letter-spacing:0.06em;text-transform:uppercase;color:#7c7e73;">Primary pattern</p>
                      <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">${escapeHtml(pattern)}</p>
                      <p style="margin:0 0 6px;font-size:13px;font-weight:bold;letter-spacing:0.06em;text-transform:uppercase;color:#7c7e73;">A habit to reconsider</p>
                      <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">Reduce ${escapeHtml(summary.behaviorToStop)}</p>
                      <p style="margin:0 0 6px;font-size:13px;font-weight:bold;letter-spacing:0.06em;text-transform:uppercase;color:#7c7e73;">${productsHeading}</p>
                      <table role="presentation" cellpadding="0" cellspacing="0">${productRows}</table>
                    </td>
                  </tr>
                </table>
                ${severeNote}
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                  <tr>
                    <td align="center">
                      <a href="${escapeHtml(link)}" style="display:inline-block;padding:14px 32px;background-color:#7c7e73;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;border-radius:9999px;letter-spacing:0.02em;">View my full results</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 4px;font-size:16px;line-height:1.6;">Here&#8217;s to less guessing,</p>
                <p style="margin:0 0 32px;font-size:16px;line-height:1.6;">The Hair Insider</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-top:1px solid rgba(52,52,48,0.18);padding-top:20px;padding-bottom:16px;"></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;text-align:center;">
                <p style="margin:0 0 8px;font-size:12px;color:#7c7e73;">You&#8217;re getting this because you asked us to email your results. Just reply if you need anything.</p>
                <p style="margin:0;font-size:12px;font-style:italic;color:#343430;">Copyright &copy; 2026 The Hair Insider. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    const text = [
        'Here are your results from The Hair Insider assessment.',
        '',
        `Primary pattern: ${pattern}`,
        `A habit to reconsider: reduce ${summary.behaviorToStop}`,
        `${productsHeading}:`,
        ...summary.products.map((product) => `- ${product.name} by ${product.brand}: ${product.link}`),
        '',
        summary.hasSevereRedFlag
            ? 'You told us about a change that is best assessed in person. Please see a dermatologist, GP, or qualified trichology professional. These suggestions are not a treatment or a diagnosis.'
            : 'This is educational guidance based on your answers, not a medical diagnosis.',
        '',
        `View your full results: ${link}`,
        '',
        'The Hair Insider',
    ].join('\n');

    return { html, text };
}
