# NITH Live Chat & Mobile Community Platform

> A members-only, real-time live chat community platform built for NITH tech enthusiasts.

---

## Features

- **Google Authentication**: One-tap "Continue with Google" sign-in strictly restricted to `@nith.ac.in` institute accounts.
- **Real-Time WebSockets**: Instant bidirectional messaging powered by Socket.IO with automatic room seeding (`#general`, `#tech-chat`, `#announcements`, `#random`).
- **Direct Mobile APK Download**: Built-in direct APK download endpoint (`/wwhs-mobile.apk`) served straight from the platform without external redirects.
- **Native Mobile App Wrapper**: Full-screen native Expo / React Native mobile application wrapper (`wwhs-mobile`) with hardware back button navigation, offline error handling, and launcher icon integration.
- **Admin Moderation**: Designated Admin accounts with real-time message deletion authority and Gold Admin badges.
- **Editable Profile & Avatars**: Customizable display names and DiceBear avatar gallery presets with local seed persistence.
- **Fail-Safe Image Uploads**: Image sharing with on-device compression (`browser-image-compression`), upload locking, and dual-mode S3 / Base64 Data URI fallback.
- **Rich Glassmorphic Design**: Modern DarkVeil WebGL shader background, smooth HSL color palettes, and Framer Motion micro-animations.
- **Code Sharing & Formatting**: Dedicated code modal to format and share code blocks seamlessly in chat.
- **Emoji Picker**: Built-in dark-themed emoji picker (`emoji-picker-react`).
- **Live Online Presence & Typing**: Real-time user online/offline status tracking and live typing indicators.
- **Cross-Room Notifications**: Browser push notifications and customizable audio cues for incoming messages.

---

## Tech Stack

### Web Frontend

- **Framework**: [React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **State & Data**: [TanStack Query v5](https://tanstack.com/query) + Axios
- **Styling**: Vanilla CSS / Tailwind CSS v4 + Framer Motion
- **Icons**: Lucide React + Emoji Picker React

### Mobile App (`wwhs-mobile`)

- **Framework**: [Expo SDK 54](https://expo.dev/) + [React Native 0.81](https://reactnative.dev/)
- **Navigation**: React Navigation Native Stack
- **Native Container**: Full-screen React Native WebView with hardware back button handler
- **Assets**: Custom adaptive launcher icons and dark splash screen

### Backend

- **Server**: Node.js + Express
- **Real-time**: Socket.IO
- **Database**: MongoDB Atlas + Mongoose
- **Authentication**: JWT (JSON Web Tokens) + Google Identity OAuth 2.0 + bcrypt hashing
- **File Storage**: AWS S3 Bucket with fail-safe Data URI fallback
- **Security**: Helmet, Compression, Express Rate Limit, Morgan

---

## Project Structure

```text
WWHSxNITH/
├── public/                 # Static assets (favicons, wwhs-mobile.apk download)
├── server/                 # Express backend server
│   ├── controllers/        # Route logic (auth, chat, room, project)
│   ├── middlewares/        # Auth verification & security
│   ├── models/             # Mongoose schemas (Auth, Chat, Room)
│   ├── routes/             # API routes (/api/auth, /api/chat, /api/room)
│   ├── services/           # Socket.IO, S3 bucket, SMTP Nodemailer
│   └── server.ts           # Express server entry point
├── src/                    # Frontend React SPA
│   ├── assets/             # Logos and graphics
│   ├── components/         # Reusable UI (DarkVeil, CodeModal, ImageModal, PublicNav, SideNav)
│   ├── hooks/              # Custom hooks (useAuth, useGlobalNotifications, usePullToRefresh)
│   ├── routes/             # TanStack file-based routes (index, login, rooms, profile, members)
│   ├── services/           # Axios API client & Socket singleton
│   ├── styles.css          # Core design system & theme tokens
│   └── main.tsx            # React DOM root
├── wwhs-mobile/            # Expo React Native mobile application
│   ├── assets/             # Mobile icons and splash assets
│   ├── App.tsx             # Main mobile entry point & native container
│   ├── app.json            # Expo project configuration
│   └── package.json        # Mobile app dependencies
├── index.html              # Vite SPA entry point
├── vite.config.ts          # Vite build configuration
└── package.json            # Dependencies and scripts
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB Atlas** database URI
- **Google OAuth 2.0 Client Credentials** (for Google Sign-In)
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
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   This concurrently launches the Vite dev server (`http://localhost:5173`) and the Express backend (`http://localhost:8000`).

5. **Run Mobile App**:
   ```bash
   cd wwhs-mobile
   npm start
   ```

---

## Developer & License

- **Developer**: [Vismay Gawai](https://github.com/vismaygawai)
- **Repository**: [WWHSxNITH](https://github.com/vismaygawai/WWHSxNITH)

Licensed under the [MIT License](LICENSE).
