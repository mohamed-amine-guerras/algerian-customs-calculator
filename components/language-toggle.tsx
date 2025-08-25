"use client"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Languages } from "lucide-react"

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="min-h-[44px] min-w-[44px] hover:bg-muted/50 transition-colors bg-transparent"
          aria-label={t.language.label}
        >
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t.language.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("ar")}>
          <span className="mr-2" role="img" aria-label="Arabic">🇩🇿</span>
          {t.language.arabic}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("en")}>
          <span className="mr-2" role="img" aria-label="English">🇬🇧</span>
          {t.language.english}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("fr")}>
          <span className="mr-2" role="img" aria-label="French">🇫🇷</span>
          {t.language.french}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


