# Contributing to QubitLabs

Thank you for your interest in contributing to **QubitLabs**! We welcome improvements to the curriculum, quantum circuit simulations, pedagogical visualizations, and documentation.

---

## Development Workflow

1. **Fork the Repository**
   - Fork [`DevSolanki-works/QubitLabs`](https://github.com/DevSolanki-works/QubitLabs) to your GitHub account.

2. **Clone & Create a Branch**
   ```bash
   git clone https://github.com/<your-username>/QubitLabs.git
   cd QubitLabs
   git checkout -b feature/your-feature-name
   ```

3. **Set Up the Environment**
   - **Frontend**:
     ```bash
     cd frontend
     npm install
     cp .env.example .env.local
     npm run dev
     ```
   - **Backend**:
     ```bash
     cd backend
     python -m venv .venv
     # Windows:
     .venv\Scripts\activate
     # Linux/macOS:
     source .venv/bin/activate
     pip install -r requirements.txt
     cp .env.example .env
     uvicorn app.main:app --reload --port 8000
     ```

4. **Verify Changes Locally**
   Before submitting your Pull Request, ensure that all automated tests and TypeScript checks pass cleanly:
   ```bash
   # Run validation suite
   cd frontend
   npx tsx scripts/test-validation.ts

   # Run production build
   npm run build
   ```

5. **Commit & Submit a Pull Request**
   ```bash
   git add .
   git commit -m "feat: concise description of change"
   git push origin feature/your-feature-name
   ```
   Open a Pull Request against the `main` branch with a clear description of your modifications and testing notes.

---

## Architectural Guidelines

- **Quantum Simulation Truth**: All quantum calculations must be performed by Qiskit/Aer in the backend engine. Never mock or fabricate physical states.
- **AI Tutoring Role**: Google Gemini acts strictly as an educational explainer grounded on verified Qiskit simulation outputs. It must never fabricate simulation results or invent gate behaviors.
- **Zero Secrets in Commits**: Never commit `.env` files or API keys. Verify `.gitignore` rules before pushing.
