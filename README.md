ProtoDex - A Modern Full-Stack Pokédex
(Suggestion: Replace this with a screenshot of your deployed application)

📖 Overview
ProtoDex is a feature-rich, full-stack Pokédex application built with a modern technology stack. It provides a comprehensive and interactive experience for exploring Pokémon, including detailed information, evolution chains, movesets, locations, and user-specific features like favorites and a "caught" list.

This repository is a monorepo containing two main projects:

prototype-dex: The Next.js frontend for the application.

prototype-dex-backend: The Express.js backend API that serves data to the frontend.

✨ Features
Complete Pokédex: Browse and search through all 1000+ Pokémon.

Server-Side Filtering: Fast and efficient searching by name, ID, and type.

Infinite Scrolling: Smoothly load the Pokédex as you scroll.

Detailed Pokémon View: In-depth information including stats, abilities, evolution chains, movesets, and encounter locations.

User Authentication: Secure user registration and login.

Personalization: Users can mark Pokémon as favorites or "caught" and track their collection.

Profile Management: Users can update their profile information and avatar.

Robust Backend: The backend features efficient caching, rate-limiting, and a pre-seeded database for instant startup times.

🛠️ Tech Stack
Frontend (prototype-dex)
Framework: Next.js (React)

Styling: Tailwind CSS

UI Components: shadcn/ui

Animations: Framer Motion

State Management: React Context & Hooks

Backend (prototype-dex-backend)
Framework: Express.js

Database: MongoDB (with Mongoose)

API Interaction: Axios

Rate Limiting: p-limit for safe, concurrent API calls.

🚀 Getting Started
Prerequisites
Node.js (v18 or later recommended)

npm or yarn

MongoDB Atlas account (or a local MongoDB instance)

1. Clone the Repository
git clone <your-repository-url>
cd ProtoRepo

2. Backend Setup (prototype-dex-backend)
Navigate to the backend directory:

cd prototype-dex-backend

Install dependencies:

npm install

Create a .env file in the root of the backend folder and add your environment variables:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000

Run the seed script (one time only):
This script will fetch all Pokémon data from the PokéAPI and create a local pokedex-cache.json file. This is essential for the server to start instantly.

node src/scripts/seed.js

Start the backend server:

npm run dev

The server will be running at http://localhost:5000.

3. Frontend Setup (prototype-dex)
Navigate to the frontend directory:

cd ../prototype-dex 

Install dependencies:

npm install

Create a .env.local file in the root of the frontend folder and add your environment variables:

NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset

Start the frontend development server:

npm run dev

The application will be available at http://localhost:3000.
