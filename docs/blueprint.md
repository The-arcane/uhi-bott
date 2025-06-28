# **App Name**: MediBot

## Core Features:

- Chatbot UI: Display a modern, attractive chatbot interface using React + Tailwind CSS. Users can interact with the bot via free-text input. Supports multi-purpose conversations: General health queries, Prescription analysis (user enters or uploads text), Lab test analysis (user enters or uploads values)
- Webhook Integration: All user messages and uploads are processed by Firebase Cloud Functions. The Cloud Function will send a POST request to this webhook: `https://raunss.app.n8n.cloud/webhook-test/6b8358eb-b8ce-4e88-9f5d-cbac3932002f`. Include payload fields: `{   "message": "<user's input>",   "type": "chat" | "prescription" | "lab",   "userId": "<generated uuid or timestamp>",   "timestamp": "<current ISO timestamp>" } `. Response from the webhook is displayed as bot response in UI. The LLM will act intelligently, using the webhook as a tool only when needed based on the message intent.
- CORS Handling: Cloud Function must handle CORS correctly to support requests from `localhost:5173` (dev) and any Firebase hosted frontend domain (prod). Include `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Methods: POST, OPTIONS`.

## Style Guidelines:

- Primary color: Deep purple (#673AB7) to convey trust and intelligence, avoiding medical cliches like green.
- Background color: Light gray (#F5F5F5), a desaturated shade of purple, for a clean, modern look that doesn't distract.
- Accent color: Cyan (#00BCD4), analogous to purple, to highlight interactive elements.
- Body and headline font: 'Inter', a grotesque sans-serif for a clean, modern user interface.
- Use simple, clear icons to represent different functionalities within the app. Flat design with the accent color.
- Clean and intuitive layout with a focus on readability. Use of white space to create a calming user experience.
- Subtle animations and transitions to enhance user engagement and provide feedback on interactions.