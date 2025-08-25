import { Suspense } from "react"
import { CustomsCalculator } from "@/components/customs-calculator"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        }
      >
        <CustomsCalculator />
      </Suspense>
    </main>
  )
}
