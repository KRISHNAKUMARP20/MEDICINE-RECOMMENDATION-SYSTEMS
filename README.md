# 🩺 MedAssist
### Intelligent Medicine Recommendation & Disease Prediction System

<p align="center">
  <b>AI-Powered Healthcare Assistance Platform</b>
</p>

<p align="center">
  MedAssist combines Artificial Intelligence, Machine Learning, Prescription Analysis, Medicine Information, and Digital Health Management into one unified healthcare platform.
</p>

---

## 📌 Overview

**MedAssist** is an intelligent healthcare support system designed to help users understand symptoms, explore possible diseases, access medicine information, analyze prescriptions, and manage personal health information.

The application provides an integrated healthcare experience through a modern web interface and AI-powered services. It includes symptom analysis, disease prediction, medicine information, prescription OCR, AI chatbot assistance, drug interaction checking, health records, medication management, doctor-oriented features, and emergency support.

> ⚠️ **Medical Disclaimer:** MedAssist is designed for educational and decision-support purposes only. It does not replace professional medical diagnosis, prescriptions, or treatment. Always consult a qualified healthcare professional for medical decisions.

---

## ✨ Key Features

### 🔍 Symptom Checker
- Enter symptoms and health information
- Analyze possible health conditions
- Disease prediction support
- Triage priority indication
- Prediction result display

### 💊 Medicine Database
- Medicine information
- Medicine uses
- Dosage information
- Side effects
- Precautions
- Drug interaction checking
- Personalized medication interaction analysis

### 📷 Prescription OCR
- Upload prescription images
- Extract medicine names
- Extract dosage information
- Identify frequency and duration
- Extract prescription instructions
- Reduce manual prescription entry

### 🤖 AI Healthcare Chatbot
- AI-powered healthcare conversations
- General health-related questions
- Symptom guidance
- Medicine-related information
- Clinical safety alerts
- Gemini AI integration

### 🧠 AI & Machine Learning
- Disease prediction
- ML model information
- Ensemble model visualization
- Health insights
- AI treatment-plan assistance
- Clinical protocol support

### 📊 Health Dashboard
- Medication schedule
- Medication reminders
- Medication compliance
- Health trends
- Vital statistics
- Proactive health alerts
- AI health insights

### 🏥 Health Records
- Personal health records
- Vital history
- BMI calculator
- Lab report analysis
- Clinical progress notes
- Historical health trends

### 👨‍⚕️ Doctor Portal
- Patient information
- Patient vital trends
- AI-assisted treatment plans
- Doctor notifications
- Patient monitoring

### 🚨 Emergency Support
- Emergency assistance
- Red-flag symptom alerts
- Emergency modal
- Live doctor alert notifications

### 📅 Medication Management
- Medication calendar
- Medication schedules
- Next medication reminders
- Medication notification center
- Weekly medication compliance tracking

---

## 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │        USER          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                    ┌────────────────────────────┐
                    │       REACT FRONTEND       │
                    │   TypeScript + Tailwind    │
                    └─────────────┬──────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
      ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
      │   Symptom    │    │ Prescription │    │  AI Chatbot  │
      │   Checker    │    │     OCR      │    │              │
      └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
             │                   │                   │
             └───────────────────┼───────────────────┘
                                 ▼
                    ┌────────────────────────────┐
                    │     EXPRESS BACKEND        │
                    │       REST API Layer       │
                    └─────────────┬──────────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             ▼                    ▼                    ▼
      ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
      │   AI / ML    │    │   Gemini AI  │    │ Health Data  │
      │    Models    │    │    Service   │    │ & Datasets   │
      └──────────────┘    └──────────────┘    └──────────────┘
             │                    │                    │
             └────────────────────┼────────────────────┘
                                  ▼
                    ┌────────────────────────────┐
                    │      HEALTHCARE OUTPUT     │
                    │ Disease • Medicine • OCR   │
                    │ Alerts • Records • Insights│
                    └────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React

### Backend
- Node.js
- Express.js
- TypeScript
- TSX
- dotenv

### AI
- Google Gemini API
- `@google/genai`
- AI-powered chatbot
- AI prescription analysis
- AI health insights

### Data & Processing
- TypeScript datasets
- Medicine database
- Disease database
- Symptoms database
- Drug interaction data
- Raw ML datasets

### Utilities
- jsPDF
- Recharts
- Motion / Framer Motion

---

## 📂 Project Structure

```text
MedAssist/
│
├── public/
│   └── assets/
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── dashboard/
│   │   ├── doctor/
│   │   ├── healthRecords/
│   │   ├── medicines/
│   │   ├── ml/
│   │   ├── modals/
│   │   ├── notifications/
│   │   ├── onboarding/
│   │   ├── symptom/
│   │   ├── tabs/
│   │   └── voice/
│   │
│   ├── data/
│   │   ├── diseases.ts
│   │   ├── medicines.ts
│   │   ├── symptoms.ts
│   │   ├── drugInteractions.ts
│   │   ├── mlModelsData.ts
│   │   ├── rawDatasets.ts
│   │   └── samplePrescriptions.ts
│   │
│   ├── services/
│   │   └── clinicalProtocolService.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── index.html
├── server.ts
├── package.json
├── bun.lock
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd MedAssist
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Or using Bun:

```bash
bun install
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

### 4. Start the Application

```bash
npm run dev
```

Or:

```bash
bun run dev
```

### 5. Open in Browser

```text
http://localhost:3000
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm start` | Start application |
| `npm run build` | Build production application |
| `npm run preview` | Preview production build |
| `npm run lint` | Check TypeScript errors |
| `npm run clean` | Remove build files |

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key |
| `APP_URL` | Application URL |

**Never commit your real API key to GitHub.**

Use `.env.example` as a template.

---

## 🧩 Main Modules

```text
1. User & Onboarding Module
2. Symptom Checker Module
3. Disease Prediction Module
4. Medicine Database Module
5. Drug Interaction Module
6. Prescription OCR Module
7. AI Chatbot Module
8. Health Records Module
9. Medication Management Module
10. Health Dashboard Module
11. Doctor Portal Module
12. Notification Module
13. Emergency Support Module
14. ML Studio Module
15. AI Health Insights Module
```

---

## 🔄 System Workflow

```text
User
  ↓
Enter Symptoms / Upload Prescription
  ↓
React Frontend
  ↓
Express Backend
  ↓
AI / ML Processing
  ↓
Disease & Medicine Analysis
  ↓
Safety / Interaction Checking
  ↓
Healthcare Information
  ↓
Dashboard / Records / Alerts
```

---

## 🎯 Objectives

- Develop an AI-based system for **symptom analysis and disease prediction**.
- Provide **medicine information, prescription analysis, and drug interaction support**.
- Provide centralized **health records, medication management, and AI healthcare assistance**.

---

## 🔮 Future Enhancements

- Real-time doctor consultation
- Secure cloud health-record storage
- Mobile application
- Multilingual healthcare assistance
- Wearable-device integration
- Advanced medical image analysis
- Hospital management integration
- Secure patient-doctor communication
- Voice-based healthcare assistance
- Advanced personalized health analytics

---

## ⚠️ Medical Disclaimer

MedAssist is a **healthcare assistance and educational project**. Information generated by the system should not be considered a substitute for professional medical advice, diagnosis, or treatment.

Users should consult qualified healthcare professionals before starting, stopping, or changing any medication.

---

## 👨‍💻 Developer

### KK — KRISHNAKUMAR

**Project:** MedAssist – Intelligent Medicine Recommendation & Disease Prediction System

**Domain:** Artificial Intelligence • Machine Learning • Healthcare • Web Development

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

```text
⭐ Star the repository
🍴 Fork the project
🐛 Report issues
💡 Suggest improvements
🤝 Contribute
```

---

## 📄 License

This project is developed for **educational and academic purposes**. Add an appropriate open-source license if you plan to distribute the project publicly.
