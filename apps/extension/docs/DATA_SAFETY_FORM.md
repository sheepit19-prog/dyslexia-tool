# Chrome Web Store Data Safety Form

## Data Safety Form Answers

The Chrome Web Store requires all extensions to complete a Data Safety Form. Below are the answers for Dyslexia Tool.

---

## Section 1: Data Collection

### 1.1 Does your extension collect user data?

**Answer:** ✅ **No**

**Explanation:**
> This extension does not collect, transmit, or store any user data on external servers. All data (voice notes, settings, usage analytics) is stored locally in the user's browser using Chrome's storage APIs (localStorage and IndexedDB). The extension functions fully offline with no server communication.

---

## Section 2: Data Sharing

### 2.1 Does your extension share user data with third parties?

**Answer:** ✅ **No**

**Explanation:**
> No user data is shared with any third parties. All data remains on the user's device and is never transmitted externally.

---

## Section 3: Data Usage

### 3.1 What user data does your extension access?

**Answer:** The extension accesses the following data types, all processed locally:

| Data Type | Purpose | Transmitted? |
|-----------|---------|--------------|
| **Microphone Audio** | Voice note recording | ❌ No - stored locally only |
| **Webpage Content** | Apply dyslexia-friendly fonts, detect text fields | ❌ No - processed in-browser only |
| **User Input (typing)** | Spelling suggestions, companion assistance | ❌ No - never transmitted |
| **Browser Storage** | Save settings and voice notes | ❌ No - local storage only |

---

## Section 4: Data Security

### 4.1 How is user data protected?

**Answer:**

> - **Local Storage**: All data stored in Chrome's secure storage mechanisms (localStorage, IndexedDB)
> - **No Transmission**: No data leaves the user's device
> - **No Encryption Needed**: Data never leaves the device
> - **User Control**: Users can delete all data by clearing extension data or uninstalling
> - **Minimal Permissions**: Extension requests only necessary permissions

---

## Section 5: Data Deletion

### 5.1 Can users request deletion of their data?

**Answer:** ✅ **Yes - Automatic**

**Explanation:**
> - **Manual Deletion**: Users can delete voice notes individually via the extension popup
> - **Automatic Deletion**: All data is automatically removed when the extension is uninstalled
> - **Browser Tools**: Users can clear extension data via Chrome's extension settings
> - **No Server Data**: Since no data is stored on servers, no deletion request process is needed

---

## Section 6: Age Restrictions

### 6.1 What age group is your extension intended for?

**Answer:** ✅ **All ages**

**Explanation:**
> This extension is designed to be safe for users of all ages, including children under 13. No personal information is collected, and the extension complies with COPPA (Children's Online Privacy Protection Act) requirements.

---

## Section 7: Permissions Justification

### 7.1 Why does your extension need these permissions?

| Permission | Justification |
|------------|---------------|
| **activeTab** | Required to apply dyslexia-friendly fonts and features to the current webpage the user is viewing |
| **storage** | Required to save user settings (font preferences, companion mode) and voice notes locally in the browser |
| **offscreen** | Required by Chrome Manifest V3 to access the microphone for voice note recording. Audio is processed and stored locally only. |
| **<all_urls>** | Required to provide assistance on any webpage where the user may need to read or write (email, documents, forms, etc.) |

---

## Section 8: Data Safety Label Summary

When users view your extension in the Chrome Web Store, they will see:

```
╔═══════════════════════════════════════╗
║         Data Safety                   ║
╠═══════════════════════════════════════╣
║  Data collected        None           ║
║  Data shared           None           ║
║  Data sold             No             ║
║  Data transmitted      No             ║
║  Encrypted in transit  N/A            ║
║  Deletable             Yes (auto)     ║
╚═══════════════════════════════════════╝
```

---

## Section 9: Additional Disclosures

### 9.1 Does your extension contain ads?

**Answer:** ❌ **No**

### 9.2 Does your extension make in-app purchases?

**Answer:** ❌ **No**

### 9.3 Does your extension interact with hardware devices?

**Answer:** ✅ **Yes - Microphone only**

**Explanation:**
> The extension accesses the microphone solely for the Voice Note feature. This requires explicit user permission each time recording is initiated. Audio is processed and stored locally only.

---

## Section 10: Compliance Statements

### 10.1 GDPR Compliance

> This extension complies with GDPR requirements:
> - Data minimization (only necessary data accessed)
> - Local processing (no data transfer)
> - User control (data deletion on uninstall)
> - Transparency (clear privacy policy)

### 10.2 COPPA Compliance

> This extension complies with COPPA:
> - No personal information collected from children
> - No behavioral tracking
> - Parental review enabled (all data local)
> - Age-appropriate design

### 10.3 CCPA Compliance

> This extension complies with CCPA:
> - No sale of personal information
> - No sharing of personal information
> - Right to deletion (automatic on uninstall)
> - Clear disclosure of data practices

---

## Review Checklist

Before submitting, verify:

- [x] All answers are accurate and truthful
- [x] Privacy policy URL is accessible
- [x] Privacy policy matches data safety form answers
- [x] No contradictions between form and policy
- [x] All permissions are justified
- [x] Data handling is accurately described

---

## Common Rejection Reasons (Avoid These)

❌ **Mismatched Information**
- Privacy policy says one thing, data form says another

❌ **Vague Justifications**
- "We need this permission for features" (too vague)
- Be specific about why each permission is needed

❌ **Hidden Data Collection**
- Claiming no data collection while collecting analytics

❌ **Unclear Deletion Process**
- Not explaining how users can delete their data

---

## Support Contact

For questions about data practices:
- **Email:** [your-email@example.com]
- **Privacy Policy:** [your-privacy-policy-url]
