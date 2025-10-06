# 🕒 Shiftlytics

A shift and income tracking tool that lets you log, analyze, and visualize your work history — all in one clean dashboard.  
Built to replace messy spreadsheets with automation, data visualization, and intuitive controls.

---

## 🎯 Features

- **User Authentication** – Sign up or log in to view, add, update, or delete your shift data anytime.  
- **Visual Dashboard** – Track your hourly earnings with a dynamic graph, visualize net income via pie chart, and view work intensity with a GitHub-style heatmap.  
- **Multiple Roles** – Manage multiple positions or job titles, each with its own wage and work history.  
- **PDF/CSV Export** – Download your entire work history as a neatly formatted spreadsheet for personal use.  
- **Paycheck Audit Parser** – Upload a paycheck to verify if you’ve been paid correctly — we’ll cross-check logged hours against your own entries.

---

## 📸 Screenshots

### 🔐 Login Page
![Login](public/screenshots/login.png)  
_Friendly login page for users to sign in or register easily._

---

### 🧾 Add Shifts
![Add Shifts](public/screenshots/add_shift.png)  
_Log new shifts on the fly, assign them to specific roles, and include lunch breaks for precise accounting._

---

### 📊 Dashboard Overview
<p align="center">
  <img src="public/screenshots/dashboard1.png" alt="Dashboard 1" width="45%" />
  <img src="public/screenshots/dashboard2.png" alt="Dashboard 2" width="45%" />
</p>

_A Data Graph, pie chart, and heatmap, giving you a visual breakdown of your work and income patterns._

---

### 📤 Data Export
![Data Export](public/screenshots/dashboard3.png)  
_Export your recorded data as a PDF or CSV file for  offline access or personal keep._

---

### 🧮 Audit Feature
![Audit Feature](public/screenshots/audit.png)  
_A parser tool to audit your paychecks and confirm accuracy between recorded and paid hours._

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15.3.0](https://nextjs.org/)  
- **UI Components**:
  - [Tailwind CSS](https://tailwindcss.com/) for styling  
  - [React.js](https://react.dev/) for the UI framework  
- **Database & Auth**:
  - [Supabase](https://supabase.com/) for data storage and authentication  

---

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/changerate/shiftlytics

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/changerate/shiftlytics
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file and add your Gemini API key:

```bash
NEXT_PUBLIC_SUPABASE_URL= (YOUR SUPABASE PUBLIC URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY=(YOUR SUPABASE PUBLIC ANON KEY)
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 💻 Development

- `npm run dev`: Starts development server with Turbopack
- `npm run build`: Creates production build

## 🙏 Acknowledgments

### The Team:
- **Alaaddin Ghosheh**
- **Carlos Vargas**

