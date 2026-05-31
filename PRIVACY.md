# Loksewa AI Privacy Policy

**Effective Date:** May 31, 2026  
**Version:** 1.0

---

## Overview

Loksewa AI is an offline-first study preparation application for Nepal Civil Service examination candidates. This privacy policy describes how we collect, use, store, and protect your information. Our design philosophy prioritizes privacy: most functionality works without internet connectivity and processes data locally on your device.

By installing or using Loksewa AI, you agree to the practices described in this policy.

---

## 1. Information We Collect

### 1.1 Information Processed On-Device (Offline-First Search)

The following data is processed entirely on your device using our offline-first search architecture and is never transmitted to our servers:

- **Camera frames**: When you use Quick Scan OCR, camera frames are processed locally using on-device machine learning. Frames are not stored or transmitted after processing.
- **Scanned text**: Text extracted from camera images is processed locally to search the verified question bank. Unverified search data or query terms are never sent to the server.
- **Scan history** (optional): If you enable local scan history, records of your scanned questions are stored on your device only. You can clear this data at any time.
- **Local search queries**: When you search the offline question bank, query terms may be temporarily cached locally to improve search performance. This cache does not leave your device.

### 1.2 Information Sent To Our Backend

The following actions require network connectivity and may transmit data to our servers:

| Action | Data Transmitted | Purpose |
|---|---|---|
| Download question updates | App version, database version (`data_version`) | Deliver versioned delta updates to your offline question bank |
| Submit error report | Question ID, report message, optional contact info, SHA-256 hashed device ID | Quality improvement and content review |
| Submit diagnostics | Anonymized usage statistics, device type, OS version, SHA-256 hashed device ID | Product improvement (opt-in only) |

**Report submissions and diagnostics**: When data is transmitted to our backend, the following privacy rules apply:
- Device identifiers (such as hardware IDs) are securely hashed using the SHA-256 algorithm on the client device before any transmission. We do not receive or store raw device IDs.
- Reports may include typed text, selected question ID, and your optional contact information.
- Raw camera images are never included in reports.

### 1.3 Information We Do NOT Collect

- We do not collect your name, email, phone number, or any personally identifiable information without your explicit consent
- We do not collect precise location data
- We do not collect browsing history or data from other apps
- We do not sell your data to third parties

---

## 2. How We Use Your Information

### 2.1 Core Application Functions

- Process Quick Scan camera input to extract text for question bank search
- Match extracted text against the verified offline database
- Deliver verified answers or AI-assisted explanations when applicable
- Store and display your scan history if you enable the feature

### 2.2 Quality Improvement

- Error reports help us identify and fix incorrect question answers
- Aggregated, anonymized diagnostics help us understand usage patterns to improve app performance
- Diagnostics data is never linked to individual users

### 2.3 Question Bank Updates

- When you download question updates, the app transmits your current local database version (`data_version`) to request and deliver only the necessary delta updates, minimizing network bandwidth and ensuring data integrity.
- We do not track which specific questions you view or search for. Our search architecture is strictly offline-first; unverified search data is never sent to our servers.

---

## 3. Data Storage

### 3.1 On Your Device

| Data Type | Storage Location | Retention |
|---|---|---|
| Offline question bank | App-private directory (internal storage) | Until you uninstall the app |
| Scan history | App-private database | Until you clear it or uninstall |
| Local search cache | Temporary app cache | Automatically cleared by the OS |

### 3.2 On Our Servers

| Data Type | Storage | Retention |
|---|---|---|
| Error reports (submitted) | Secured database | 90 days, then anonymized for aggregate statistics |
| Diagnostic data (opt-in) | Aggregated analytics | Anonymized, never linked to individuals |
| Question download metadata | Server logs | 30 days |

**Server-side data minimization**: We store only what is necessary for the stated purpose. Error reports are retained for 90 days to allow review, after which they are anonymized and retained as aggregate statistics only.

---

## 4. Data Sharing

### 4.1 We Do Not Sell Data

Loksewa AI does not sell, rent, or trade your personal information to third parties.

### 4.2 Service Providers

We may share minimal data with trusted service providers only for specific operational purposes:

- **Hosting and infrastructure providers**: To serve question updates and process error reports
- **Analytics providers**: To process opt-in diagnostic data in aggregate

These providers are contractually bound to use your data only for the services we request.

### 4.3 Legal Requirements

We may disclose information if required by law, such as in response to a valid legal request or court order.

---

## 5. Data Security

### 5.1 Technical Measures

- **HTTPS**: All network communications use TLS encryption in production.
- **SHA-256 Hashing**: Any device identifiers transmitted to our servers are hashed using the secure SHA-256 algorithm before leaving the device to protect your anonymity.
- **Offline-First Privacy**: All unverified search data and OCR query processing runs locally on-device, ensuring zero transmission of query logs to the server.
- **Delta file signing**: Question bank updates are cryptographically signed to prevent tampering.
- **Admin token rotation**: Production secrets are rotated regularly.

### 5.2 Your Role

- Keep your device's operating system and the Loksewa AI app updated
- Use a strong device lock (PIN, password, or biometric) to prevent unauthorized access
- Do not install the app from untrusted sources

---

## 6. AI-Generated Content Disclaimer

Loksewa AI includes an on-device AI assistant for questions that cannot be matched in the verified question bank.

**Important**: AI-generated answers may be incomplete, inaccurate, or outdated.

You should always verify AI-generated responses against official sources, especially for:
- Legal and constitutional information
- Policy and regulatory details
- Dates, names, and specific facts
- Any information that may affect your examination preparation

Official sources to verify include:
- Nepal Gazette (Rajpatra)
- Official Loksewa notices and syllabi
- Authoritative textbooks

---

## 7. Your Rights and Controls

### 7.1 You Can Control

| Control | How to Access |
|---|---|
| Clear scan history | Settings → Clear local history |
| Disable AI fallback | Settings → Disable AI-assisted explanations |
| Disable diagnostics | Settings → Disable analytics sharing |
| Uninstall the app | Standard device uninstall process |

### 7.2 Data Deletion

To request deletion of error reports or diagnostic data submitted to our servers:

**Email:** privacy@loksewa.ai

Include "Data Deletion Request" in the subject line. We will respond within 30 days.

Note: On-device data is deleted when you uninstall the app.

### 7.3 Contact Us

For privacy-related questions, concerns, or requests:

**Email:** privacy@loksewa.ai  
**Subject Line:** [Privacy Inquiry / Data Deletion Request / Other]

We aim to respond to all privacy-related inquiries within 30 days.

---

## 8. Third-Party Services

### 8.1 On-Device Machine Learning

Quick Scan OCR uses on-device ML models (e.g., Google ML Kit or equivalent). These models process data locally and do not transmit raw camera images to external servers.

### 8.2 Analytics

If you opt into diagnostics, anonymized usage data may be processed by third-party analytics services. These services are configured to not collect personally identifiable information.

---

## 9. Policy Changes

We may update this privacy policy from time to time. When we make material changes:

1. We will update the "Effective Date" at the top of this policy
2. For significant changes, we will provide notice through the app (e.g., a banner or push notification)
3. Your continued use of the app after changes constitutes acceptance of the updated policy

---

## 10. Children's Privacy

Loksewa AI is designed for adults preparing for civil service examinations. We do not knowingly collect information from users under the age of 18. If you believe a child has provided us with personal information, please contact us immediately.

---

## 11. Contact Information

**App Name:** Loksewa AI  
**Version:** 3.0.0  
**Contact:** privacy@loksewa.ai

---

*This policy was last reviewed and updated on May 31, 2026.*