import { SITE_URL } from '../seo/site';
import { getStartingFocusLabel } from '../../app/hair-growth-edit/lib/salesFocus';
import type { RoutineTeaser } from '../../app/hair-growth-edit/lib/routineTeaserTypes';

export interface ResultsEmailSummary {
    primaryCause: string;
    behaviorToStop: string;
    hasSevereRedFlag: boolean;
    // The free teaser from makePublicResults(): shelf categories and counts only.
    // It never carries product names, brands, images or links, so nothing in this
    // email can reveal what is inside the paid plan. Null for the professional-care path.
    teaser: RoutineTeaser | null;
}

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

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

// "Your plan: 10 wash days over 30 days · 3 phases" and the product counts, as on the results page.
function teaserCounts(teaser: RoutineTeaser) {
    const { washCount, phases, chosenProductCount, sharedProductCount, optionalProductCount } = teaser;
    const line1 = `Your plan: ${washCount} wash days over 30 days · ${phases.length} phases`;
    const parts = [`${chosenProductCount} ${plural(chosenProductCount, 'product', 'products')} chosen for you`];
    if (sharedProductCount > 0) parts.push(`${sharedProductCount} shared care ${plural(sharedProductCount, 'option', 'options')}`);
    if (optionalProductCount > 0) parts.push(`${optionalProductCount} optional ${plural(optionalProductCount, 'extra', 'extras')}`);
    return { line1, line2: parts.join(' · ') };
}

// The placeholder bottle from the results page's "My shelf" tab, in email-safe table markup.
const PLACEHOLDER_TILE = `<table role="presentation" cellpadding="0" cellspacing="0" align="center" width="84">
  <tr>
    <td align="center" valign="middle" height="104" bgcolor="#c9c6c2" style="background-color:#c9c6c2;border-radius:10px;">
      <table role="presentation" cellpadding="0" cellspacing="0" align="center">
        <tr><td width="22" height="9" bgcolor="#b4b1ad" style="background-color:#b4b1ad;border-radius:3px 3px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>
      <table role="presentation" cellpadding="0" cellspacing="0" align="center">
        <tr><td width="40" height="60" align="center" valign="middle" bgcolor="#b4b1ad" style="background-color:#b4b1ad;border-radius:7px 7px 6px 6px;font-size:0;line-height:0;">
          <table role="presentation" cellpadding="0" cellspacing="0" align="center">
            <tr><td width="28" height="20" bgcolor="#d6d3cf" style="background-color:#d6d3cf;font-size:0;line-height:0;">&nbsp;</td></tr>
          </table>
        </td></tr>
      </table>
    </td>
  </tr>
</table>
<p style="margin:6px 0 0;font-size:10px;line-height:1.3;color:#7c7e73;text-align:center;">Unlocks with your plan</p>`;

function shelfRows(shelf: RoutineTeaser['shelf']) {
    return shelf
        .map((item, i) => {
            // Same grouping as the results page: "Start here", then "Add as you run out".
            const heading = i === 0 ? 'Start here' : !item.startHere && shelf[i - 1].startHere ? 'Add as you run out' : '';
            const tag = (label: string) => ` <span style="font-size:10px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#7c7e73;">&nbsp;${label}</span>`;
            return `${heading ? `<tr><td colspan="2" style="padding:18px 0 8px;font-size:21px;line-height:1.3;color:#343430;">${heading}</td></tr>` : ''}
<tr>
  <td valign="middle" style="padding:14px 14px 14px 0;border-top:1px solid rgba(52,52,48,0.14);">
    <p style="margin:0;font-size:17px;line-height:1.3;color:#343430;">${escapeHtml(item.category)}${item.startHere ? tag('Start here') : ''}${item.optional ? tag('Optional') : ''}</p>
    <p style="margin:6px 0 0;font-size:14px;line-height:1.5;color:#55564e;">${escapeHtml(item.reason)}</p>
  </td>
  <td width="84" valign="middle" style="padding:14px 0;border-top:1px solid rgba(52,52,48,0.14);">${PLACEHOLDER_TILE}</td>
</tr>`;
        })
        .join('');
}

export function buildResultsEmail(summary: ResultsEmailSummary, token: string) {
    const link = resultsLink(token);
    const pattern = sentenceCase(getStartingFocusLabel(summary.primaryCause));
    const teaser = summary.hasSevereRedFlag ? null : summary.teaser;
    const counts = teaser ? teaserCounts(teaser) : null;

    const shelfBlock = teaser && counts
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
  <tr><td style="padding:0 0 6px;font-size:13px;font-weight:bold;letter-spacing:0.06em;text-transform:uppercase;color:#7c7e73;">Your shelf, by category</td></tr>
  <tr><td style="padding:0 0 14px;font-size:14px;line-height:1.5;color:#55564e;">${escapeHtml(counts.line1)}<br />${escapeHtml(counts.line2)}</td></tr>
  <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${shelfRows(teaser.shelf)}</table></td></tr>
  <tr><td style="padding:10px 0 0;font-size:13px;line-height:1.5;color:#7c7e73;">Specific picks are revealed in your full plan.</td></tr>
</table>`
        : '';

    const note = summary.hasSevereRedFlag
        ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;">You told us about a change in your hair or scalp that is best assessed in person. Please see a dermatologist, GP, or qualified trichology professional. Nothing in your results is a treatment or a diagnosis.</p>`
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
                      <p style="margin:0 0 6px;font-size:13px;font-weight:bold;letter-spacing:0.06em;text-transform:uppercase;color:#7c7e73;">Your starting focus</p>
                      <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">${escapeHtml(pattern)}</p>
                      <p style="margin:0 0 6px;font-size:13px;font-weight:bold;letter-spacing:0.06em;text-transform:uppercase;color:#7c7e73;">A habit to reconsider</p>
                      <p style="margin:0;font-size:16px;line-height:1.5;">Reduce ${escapeHtml(summary.behaviorToStop)}</p>
                    </td>
                  </tr>
                </table>
                ${shelfBlock}
                ${note}
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

    const shelfText = teaser && counts
        ? [
              'Your shelf, by category',
              counts.line1,
              counts.line2,
              '',
              ...teaser.shelf.flatMap((item, i) => {
                  const heading = i === 0 ? 'Start here' : !item.startHere && teaser.shelf[i - 1].startHere ? 'Add as you run out' : '';
                  return [...(heading ? ['', `${heading}:`] : []), `- ${item.category}${item.optional ? ' (optional)' : ''}: ${item.reason}`];
              }),
              '',
              'Specific picks are revealed in your full plan.',
              '',
          ]
        : [];

    const text = [
        'Here are your results from The Hair Insider assessment.',
        '',
        `Your starting focus: ${pattern}`,
        `A habit to reconsider: reduce ${summary.behaviorToStop}`,
        '',
        ...shelfText,
        summary.hasSevereRedFlag
            ? 'You told us about a change that is best assessed in person. Please see a dermatologist, GP, or qualified trichology professional. Nothing in your results is a treatment or a diagnosis.'
            : 'This is educational guidance based on your answers, not a medical diagnosis.',
        '',
        `View your full results: ${link}`,
        '',
        'The Hair Insider',
    ].join('\n');

    return { html, text };
}
