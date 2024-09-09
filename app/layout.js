import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ProPathway | Streamline Your Job Search",
  description: "ProPathway, the tool designed to help you manage your job search with ease. Track applications, set reminders, and get AI-driven insights.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content="ProPathway is your ultimate job application tracker, helping you manage applications, deadlines, and follow-ups effortlessly. Join the waitlist for early access!" />
          <meta name="author" content="ProPathway Team: Dulani, Malika, Zahra" />
          <title>ProPathway Waitlist</title>
          <meta property="og:title" content="ProPathway | Streamline Your Job Search" />
          <meta property="og:description" content="Join ProPathway, the tool designed to help you manage your job search with ease. Track applications, set reminders, and get AI-driven insights." />
          <meta property="og:image" content="/open_graph.png" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="ProPathway" />
        </head>
        <body className={inter.className}>
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}