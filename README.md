# Shiftlytics

A Shift and Income CRUDtracking tool used to provide spreasheet-tracking and data visualization of your work history.

## 🎯 Features

- **User Authentication**: Sign up or Log in to view your profile data, with the ability to Retrieve, Add, Delete or Update it any time.
- **Visual Dashboard**: A graph view of your day-to-day hourly earnings, a Pie chart to visualize your Net Income, and A Github-styled heatmap to see when you worked the most.
- **Different Roles**: If you possess several different titles at your job, you can use this feature to create several different roles with their own wage.
- **PDF/CSV export**: Sneak-Peak and export a spreadsheet file of all your recorded shifts for your own use.
- **Paycheck Audit Parser**: Upload a paycheck and we will verify if you've been paid correctly by comparing the hours recorded to the hours you have entered.

## 📸 Screenshots

![Home Page](public/screenshots/Home.png)
_Friendly landing page for users to upload their university transcript_

![Calendar View](public/screenshots/Schedule.png)
_Calendar view with course recommendations for easy scheduling_

## 🚀 Tech Stack

- **Framework**: [Next.js 15.3.0](https://nextjs.org/)
- **UI Components**:
  - [Tailwind CSS](https://tailwindcss.com/) for styling
  - [React.js]() for UI framework
- **Database**
  [Supabase]() for Data storage and user authentication 

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
GEMINI_API_KEY="your-api-key"
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

- **Andy Kuang** - Frontend & UX Design
- **Charles Phu** - Backend & Webscraper
- **Ashwin Vinod** - Backend & Gemini
- **Alaaddin Ghosheh** - Backend & Gemini

Special thanks to the CruzHacks 2025 organizing team for hosting an amazing hackathon that made this project possible

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
