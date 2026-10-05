# BreastCare Connect

University demonstration project for **Design and Implementation of mHealth System for Breast Cancer Diagnosis**. It provides breast-health awareness, transparent risk screening, symptom tracking, appointments, protected records, educational resources, and patient/clinician/admin portals. It does not confirm a breast cancer diagnosis or replace professional medical advice.

## Run locally

1. Copy `.env.example` to `.env` and enter Firebase web-app values when available.
2. Run `npm install`.
3. Run `npm run dev`.
4. Run `npm run build` before deployment.

Without Firebase configuration, the interface runs in clearly labelled demonstration mode. Demo accounts use password `Demo123!`:

- `patient@demo.com`
- `doctor@demo.com`
- `admin@demo.com`

## Firebase setup

Enable Email/Password Authentication, Firestore Database and Storage in Firebase. Deploy the included rules and hosting configuration:

```bash
firebase deploy --only firestore:rules,storage,hosting
```

Admin accounts must be provisioned manually by creating an Auth account and a corresponding `users/{uid}` Firestore document with `role: "admin"` and `status: "active"`. Public registration only creates patient accounts or pending doctor accounts.
