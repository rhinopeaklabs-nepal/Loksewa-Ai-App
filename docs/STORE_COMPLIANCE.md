# Apple and Google Production Readiness

This project is not store-ready until these checks are complete.

## Data and Copyright

- Every verified question must include `source_name`, `source_license`, `verifier`, and verification date.
- Do not scrape private, paywalled, copyrighted, or contract-restricted question banks without written permission.
- User-contributed questions must enter `needs_review`, not `verified`.
- Provide a content takedown/report flow through `/v1/reports`.

## Privacy

- Publish a privacy policy before Play Store or App Store submission.
- Explain OCR behavior: camera text recognition happens on device where possible.
- Explain AI behavior and that generated answers may be inaccurate.
- Avoid collecting raw camera images unless the user explicitly submits a report.
- Hash device identifiers before storing them.
- Provide data deletion/contact instructions.

## Security

- Use HTTPS in production; do not send user reports over cleartext HTTP.
- Rotate `LOKSEWA_ADMIN_TOKEN` and `LOKSEWA_DELTA_SIGNING_SECRET`.
- Keep admin endpoints unavailable from public mobile clients.
- Validate and sign OTA delta updates.
- Enable server-side rate limits and request body limits at the reverse proxy.

## Google Play Requirements

- Declare camera permission usage clearly.
- Do not request background camera access.
- Add a prominent AI disclaimer for generated answers.
- Provide an in-app report/error mechanism.
- Fill Data Safety accurately for reports, diagnostics, and account data.
- Use target SDK required by current Play policy before release.

## Apple App Store Requirements

- Provide camera permission purpose text.
- Avoid misleading claims such as "100% accurate AI."
- Label AI-generated educational guidance as non-authoritative.
- Include licensed content attribution where required.
- If users can submit reports/content, provide moderation and abuse handling.

## Release Build Checklist

- Replace debug WebView prototype with native screens or hardened local assets.
- Remove development admin token defaults.
- Disable development docs on production backend.
- Verify all third-party font/image licenses.
- Confirm offline database package size and first-launch decompression behavior.
- Run accessibility checks for Nepali and English text.
- Test airplane mode, low storage, camera denial, and slow network.
