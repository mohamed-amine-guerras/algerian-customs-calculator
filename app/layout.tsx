import type React from "react"
import type { Metadata } from "next"
import { Inter, Tajawal } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
// Removed unused LanguageToggle import

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const arabic = Tajawal({ subsets: ["arabic"], weight: ["400", "500", "700"], variable: "--font-arabic" })

export const metadata: Metadata = {
  title: "Algerian Customs Calculator",
  description: "Calculate customs fees and taxes for importing vehicles into Algeria",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${arabic.variable} min-h-screen bg-background antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
