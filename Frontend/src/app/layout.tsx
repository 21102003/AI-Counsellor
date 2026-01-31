import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ToastProvider";
import GlobalAIChat from "@/components/GlobalAIChat";
import NeuralDock from "@/components/NeuralDock";
import NeuralLogo from "@/components/NeuralLogo";

export const metadata: Metadata = {
  title: "AI Counsellor - Your Strategic Study Abroad Partner",
  description: "Intelligent study abroad counselling powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorReporter />
        <NeuralLogo />
        <ToastProvider>
          <AuthProvider>
            {children}
            <GlobalAIChat />
            <NeuralDock />
          </AuthProvider>
        </ToastProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
