import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecureFlow - Enterprise DevSecOps E-commerce Platform",
  description: "A security-first e-commerce platform built with Next.js, PostgreSQL, and comprehensive DevSecOps practices including SAST, SCA, Container Security, IaC Security, and DAST.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
