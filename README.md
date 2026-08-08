# WWHS? x NITH

> *The perfect group icon doesn't exi........*
> A members-only, real-time live chat community platform built for NITH tech enthusiasts.

---

## 🚀 Features

- ⚡ **Real-Time WebSockets**: Instant bidirectional messaging powered by Socket.IO.
- 🎨 **Rich Glassmorphic Design**: Modern DarkVeil WebGL shader background, smooth HSL color palettes, and Framer Motion micro-animations.
- 🔒 **Institute Domain Security**: Strictly restricted access ensuring only verified `@nith.ac.in` accounts can join.
- 🖼️ **Image Attachments**: Instant image uploads with on-device compression (`browser-image-compression`).
- 💻 **Code Sharing**: Dedicated code modal to format and share code blocks seamlessly in chat.
- 😊 **Emoji Picker**: Built-in dark-themed emoji picker (`emoji-picker-react`).
- 🟢 **Live Online Presence**: Real-time user online/offline status tracking with indicator rings.
- ⌨️ **Typing Indicators**: Live typing awareness across active room members.
- 🔔 **Cross-Room Notifications**: Browser push notifications and customizable audio cues for incoming messages.
- 📱 **Cross-Platform**: Web SPA + matching React Native / Expo mobile app.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **State & Data**: [TanStack Query v5](https://tanstack.com/query) + Axios
- **Styling**: Vanilla CSS / Tailwind CSS v4 + Framer Motion
- **Icons**: Lucide React + Emoji Picker React

### Backend
- **Server**: Node.js + Express
- **Real-time**: Socket.IO
- **Database**: MongoDB Atlas + Mongoose
- **Authentication**: JWT (JSON Web Tokens) with 7-day expiration + bcrypt hashing
- **File Storage**: AWS S3 Bucket
- **Security**: Helmet, Compression, Express Rate Limit, Morgan

---

## 📂 Project Structure

```text
WWHSxNITH/
├── public/                 # Static assets (favicons, notification sound)
├── server/                 # Express backend server
│   ├── controllers/        # Route logic (auth, chat, room, project)
│   ├── middlewares/        # Auth verification & security
│   ├── models/             # Mongoose schemas (Auth, Chat, Room)
│   ├── routes/             # API routes (/api/auth, /api/chat, /api/room)
│   ├── services/           # Socket.IO, S3 bucket, SMTP Nodemailer
│   └── server.ts           # Express server entry point
├── src/                    # Frontend React SPA
│   ├── assets/             # Logos and graphics (wwhs.svg)
│   ├── components/         # Reusable UI (DarkVeil, CodeModal, ImageModal, PublicNav, SideNav)
│   ├── hooks/              # Custom hooks (useAuth, useGlobalNotifications, usePullToRefresh)
│   ├── routes/             # TanStack file-based routes (index, login, rooms, profile, members)
│   ├── services/           # Axios API client & Socket singleton
│   ├── styles.css          # Core design system & theme tokens
│   └── main.tsx            # React DOM root
├── index.html              # Vite SPA entry point
├── vite.config.ts          # Vite build configuration
└── package.json            # Dependencies and scripts
```

---

## 📜 The 3 Rules of WWHS?

1. 🔇 **1st rule of WWHS?** — *Don't talk about WWHS.*
2. 🖼️ **2nd rule of WWHS?** — *If your group icon isn't cursed, you're doing it wrong.*
3. 💬 **3rd rule of WWHS?** — *If this is your first time on WWHS, you have to post.*

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB Atlas** database URI
- **AWS S3** bucket (optional, for image uploads)
- **Gmail App Password** (for sending verification emails)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vismaygawai/WWHSxNITH.git
   cd WWHSxNITH
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your credentials:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=8000
   NODE_ENV=development
   AWS_ACCESS_KEY=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_S3_BUCKET=your_s3_bucket_name
   AWS_S3_REGION=ap-south-1
   JWT_ENCRYP_KEY=your_jwt_secret
   MAIL_USER=your_email@gmail.com
   MAIL_PASS=your_16_character_app_password
   FRONTEND_PROD_URL=http://localhost:5173
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   This concurrently launches the Vite dev server (`http://localhost:5173`) and the Express backend (`http://localhost:8000`).

---

## 👨‍💻 Developer & License

- **Developer**: [Vismay Gawai](https://github.com/vismaygawai)
- **Repository**: [WWHSxNITH](https://github.com/vismaygawai/WWHSxNITH)

Licensed under the [MIT License](LICENSE).
