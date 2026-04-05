import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ResponseLogger } from "@/components/response-logger";
import { cookies } from "next/headers";
import { ReadyNotifier } from "@/components/ready-notifier";
import { Providers } from "./providers";
import FarcasterWrapper from "@/components/FarcasterWrapper";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Fruit Catcher Game",
  description: "Enjoy a colorful 2D game where you catch falling fruits with a touch-responsive basket. Earn different points for different fruits, and claim high scores as tokens. Avoid missing fruits or it's game over!",
  other: {
    "base:app_id": "6962553e8a6eeb04b568dc5d",
    "fc:frame": JSON.stringify({
      "version": "next",
      "imageUrl": "https://files.catbox.moe/8xxbz3.jpg",
      "button": {
        "title": "Open with Ohara",
        "action": {
          "type": "launch_frame",
          "name": "Fruit Catcher Game",
          "url": "https://collect-heard-387.app.ohara.ai",
          "splashImageUrl": "https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/farcaster/splash_images/splash_image1.svg",
          "splashBackgroundColor": "#ffffff"
        }
      }
    })
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const requestId = cookieStore.get("x-request-id")?.value;

  return (
    <html lang="en">
      <head>
        {requestId && <meta name="x-request-id" content={requestId} />}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Do not remove this component, we use it to notify the parent that the mini-app is ready */}
        <ReadyNotifier />
        <Providers>
          <FarcasterWrapper>
            {children}
          </FarcasterWrapper>
        </Providers>
        <ResponseLogger />
      </body>
    </html>
  );
}
