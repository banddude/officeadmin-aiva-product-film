from pathlib import Path
import json,collections,textwrap
root=Path('.')
rows=json.loads((root/'production/feature-registry-snapshot.json').read_text())
lead='''# Product capability map

OfficeAdmin and AIVA were researched as one connected operating environment, with an important distinction between public business software and the platform owner's private assistant capabilities. This inventory reports observed documentation and registry defaults, not an assertion that every feature was independently end-to-end tested.

## What the product is

OfficeAdmin combines contractor operations with a genuine accounting system. Customers, projects, takeoffs, estimates, change orders, invoices, payments, bills, time, documents, inventory, and financial reporting share organizational context. Its records are not only dashboard summaries: the workflows create linked business objects and financial entries.

AIVA adds a context-aware assistant surface and a broader connected-tool environment. Its assistant and conversation interfaces are currently owner-only/alpha. The owner's broader AIVA installation can access communication, calendars, knowledge, documents, devices, development tools, and machine capabilities. Those connections belong to the configured owner environment; they are not automatically included for every paying OfficeAdmin tenant.

## The distinctions that matter in a product story

**Contacts are public; the separate CRM deal board is beta.** It would be misleading to treat all CRM views as equally released. The film uses the customer/project record, not an unrestricted CRM pipeline promise.

**Takeoff is public; AI extraction and automated electrical plans are not.** Manual measurement and counting, generated draft estimates, and linked quantity refresh are strong present-day workflows. The private AI visual takeoff, site-plan automation, and one-line builder belong to separately gated preview capabilities.

**Time tracking and crew scheduling are public; full payroll is beta.** Approved timecards and exports should not be advertised as proof of a generally released payroll engine. GPS capture is distinct from beta geofence enforcement.

**Customer payments are not OfficeAdmin billing.** A tenant's customer pays that tenant's configured Stripe account. No product demonstration should imply that OfficeAdmin's own subscription account is a fallback destination for customer money.

**Recorded conversations are not ambient omniscience.** AIVA summaries and extracted action items depend on available recordings and connected sources. The film visibly ties the actions to an example recording and project sources.

**The assistant can act, but the review boundary is part of the value.** Drafts are drafts until approved. AIVA's broader machine and communications permissions are powerful, but they should not be marketed as unlimited autonomous authority over customers, books, or devices.

**A feature flag is not a security boundary.** Organization and user scoping, site-admin guards, and public release policy are separate questions. Registry defaults can be overridden in a deployment and do not certify performance or readiness.

## Why the film is selective

A 112-second film cannot responsibly explain 78 registry entries, all connector actions, and every configured AIVA skill. The central story uses the workflows with the clearest cross-product continuity. The rest of this inventory is retained for future focused feature films, landing-page copy, and launch planning.

The reviewed registry has 39 production-default entries, 21 beta-default entries, and 18 alpha-default entries. The sections below list every parsed entry, including unpromoted and owner-only capabilities. The canonical public-feature-boundary document still governs tenant promises, and persisted runtime overrides may differ.

'''
parts=[lead]
for group in dict.fromkeys(x['group'] for x in rows):
 parts.append(f'## {group}\n')
 for x in rows:
  if x['group']==group:
   desc=x['description'] or 'See the source registry for details.'
   # Keep the product meaning, not account-specific implementation/model details, in the written atlas.
   if x['key']=='takeoff_ai_assist_alpha':desc='Private, reviewed AI-assisted draft device counting from plan regions or an approved fixture list. Accepted counts become visible plan marks; results are not automatically committed. Owner-only authorization remains separate from the alpha release flag.'
   parts.append(f"**{x['label']}** · {x['defaultMinChannel'].upper()} default · `{x['key']}`\n\n{desc}\n")
parts.append('''## Broader AIVA environment

The read operating guidance organizes AIVA into communication, calendar, files, memory, business operations, development, system, and capability toolboxes. The connected environment includes email; iMessage and other configured messengers; Apple and Google calendars; notes and reminders; contextual people/project knowledge and commitments; OfficeAdmin estimating and operations; repository and app-development workflows; browser automation; transcription; remote machine commands and file transfer; device-related capabilities; and task-to-tool routing.

These are configured assistant capabilities, not a separately verified commercial entitlement catalog. Connection state, permissions, machine availability, authentication, and installed skills determine what can actually run. In particular, the source lists read/write and send capabilities that must not be represented as silently acting without authorization. The film uses only the project-context, recorded-conversation, draft-review, and authorized-action portion of that broader story.

## Sources

The public boundary, feature registry, user-journey documents, README, style tokens, and AIVA operating/capability guidance are identified in `claims-and-provenance.md`. The raw, date-stamped registry snapshot is `feature-registry-snapshot.json`. Broad claims are not drawn from the connector's action count alone.
''')
(root/'production/product-capability-map.md').write_text('\n'.join(parts))
meta=json.loads((root/'production/narration.json').read_text())
def stamp(t,sep=','):
 ms=round(t*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000);return f'{h:02}:{m:02}:{s:02}{sep}{ms:03}'
srt=[];vtt=['WEBVTT\n']
for i,c in enumerate(meta,1):
 text=c['text'].replace('Office Admin','OfficeAdmin').replace('Ava','AIVA')
 lines=textwrap.wrap(text,48,break_long_words=False,break_on_hyphens=False)
 srt.append(f"{i}\n{stamp(c['start'])} --> {stamp(c['end'])}\n"+'\n'.join(lines)+'\n')
 vtt.append(f"{stamp(c['start'],'.')} --> {stamp(c['end'],'.')}\n"+'\n'.join(lines)+'\n')
(root/'production/officeadmin-aiva-captions.srt').write_text('\n'.join(srt))
(root/'production/officeadmin-aiva-captions.vtt').write_text('\n'.join(vtt))
print('Capability map:',len(rows),'entries; captions:',len(meta))
