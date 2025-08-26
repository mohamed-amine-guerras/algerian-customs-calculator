"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { useLanguage } from "@/components/language-provider"

export interface CarBrowserCarData {
  numero: string
  marque: string
  modele: string
  energie: string
  cylindree: string
  annee: string
  paysOrigine: string
  neuf: number
  moinsUn: number
  moinsDeux: number
  moinsTrois: number
  currency: string
}

interface CarBrowserProps {
  cars: CarBrowserCarData[]
  onSelect: (car: CarBrowserCarData) => void
  onBack?: () => void
  externalQuery?: string
}

type Step = "brand" | "model" | "engine" | "origin" | "summary"

export default function CarBrowser({ cars, onSelect, onBack, externalQuery }: CarBrowserProps) {
  const { t, language } = useLanguage()

  const [step, setStep] = useState<Step>("brand")
  const [brandQuery, setBrandQuery] = useState("")
  const [modelQuery, setModelQuery] = useState("")
  const [engineQuery, setEngineQuery] = useState("")
  const [originQuery, setOriginQuery] = useState("")
  const [hideInputs, setHideInputs] = useState(false)

  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedEngineKey, setSelectedEngineKey] = useState<string | null>(null) // key: `${cylindree}|${energie}`
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null)
  const [previewCar, setPreviewCar] = useState<CarBrowserCarData | null>(null)
  const didSelectRef = useRef(false)
  const [isBackNav, setIsBackNav] = useState(false)

  const isStepAvailable = (s: Step): boolean => {
    if (s === "brand") return true
    if (s === "model") return !!selectedBrand
    if (s === "engine") return !!selectedBrand && !!selectedModel
    if (s === "origin") return !!selectedBrand && !!selectedModel && !!selectedEngineKey
    if (s === "summary") return !!previewCar
    return false
  }

  const resetTo = (target: Step) => {
    setIsBackNav(true)
    onBack?.()
    setHideInputs(false)
    if (target === "brand") {
      setSelectedBrand(null)
      setSelectedModel(null)
      setSelectedEngineKey(null)
      setSelectedOrigin(null)
      setBrandQuery("")
      setModelQuery("")
      setEngineQuery("")
      setOriginQuery("")
      setStep("brand")
      return
    }
    if (target === "model") {
      setSelectedModel(null)
      setSelectedEngineKey(null)
      setSelectedOrigin(null)
      setModelQuery("")
      setEngineQuery("")
      setOriginQuery("")
      setStep("model")
      return
    }
    if (target === "engine") {
      setSelectedEngineKey(null)
      setSelectedOrigin(null)
      setEngineQuery("")
      setOriginQuery("")
      setStep("engine")
      return
    }
    if (target === "origin") {
      setSelectedOrigin(null)
      setOriginQuery("")
      setStep("origin")
    }
  }

  const brands = useMemo(() => {
    const brandToModels = new Map<string, Set<string>>()
    for (const c of cars) {
      if (!brandToModels.has(c.marque)) brandToModels.set(c.marque, new Set<string>())
      brandToModels.get(c.marque)!.add(c.modele)
    }
    let list = Array.from(brandToModels.entries()).map(([name, modelsSet]) => ({ name, count: modelsSet.size }))
    if (brandQuery.trim()) {
      const q = brandQuery.trim().toLowerCase()
      list = list.filter((b) => b.name.toLowerCase().includes(q))
    }
    return list.sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name))
  }, [cars, brandQuery])

  const [brandPage, setBrandPage] = useState(1)
  const pageSize = 16
  const pagedBrands = useMemo(() => {
    if (brandQuery.trim()) return brands
    return brands.slice(0, brandPage * pageSize)
  }, [brands, brandQuery, brandPage])

  // Reflect external search query into browse filters when provided
  useEffect(() => {
    const q = (externalQuery || "").trim()
    if (!q) return
    // Only seed on first enter into browse mode (brand step)
    if (step !== "brand") return
    setBrandQuery(q)
    setModelQuery("")
    setEngineQuery("")
    setOriginQuery("")
    setBrandPage(1)
    setHideInputs(true)
  }, [externalQuery, step])

  const models = useMemo(() => {
    if (!selectedBrand) return [] as { name: string; count: number }[]
    const subset = cars.filter((c) => c.marque === selectedBrand)
    const counts = new Map<string, number>()
    for (const c of subset) counts.set(c.modele, (counts.get(c.modele) || 0) + 1)
    let list = Array.from(counts.entries()).map(([name, count]) => ({ name, count }))
    if (modelQuery.trim()) {
      const q = modelQuery.trim().toLowerCase()
      list = list.filter((m) => m.name.toLowerCase().includes(q))
    }
    return list.sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name))
  }, [cars, selectedBrand, modelQuery])

  // Auto-advance when there is only one option (disabled on backwards navigation)
  useEffect(() => {
    if (step === "model" && selectedBrand && models.length === 1 && !isBackNav) {
      handleSelectModel(models[0].name)
    }
  }, [step, selectedBrand, models, isBackNav])

  const engines = useMemo(() => {
    if (!selectedBrand || !selectedModel) return [] as { key: string; cylindree: string; energie: string; count: number }[]
    const subset = cars.filter((c) => c.marque === selectedBrand && c.modele === selectedModel)
    const counts = new Map<string, { cylindree: string; energie: string; count: number }>()
    for (const c of subset) {
      const key = `${c.cylindree}|${c.energie}`
      const prev = counts.get(key) || { cylindree: c.cylindree, energie: c.energie, count: 0 }
      counts.set(key, { cylindree: prev.cylindree, energie: prev.energie, count: prev.count + 1 })
    }
    let list = Array.from(counts.entries()).map(([key, v]) => ({ key, cylindree: v.cylindree, energie: v.energie, count: v.count }))
    if (engineQuery.trim()) {
      const q = engineQuery.trim().toLowerCase()
      list = list.filter((e) => `${e.cylindree} ${e.energie}`.toLowerCase().includes(q))
    }
    return list.sort((a, b) => (b.count - a.count) || (Number.parseInt(a.cylindree) - Number.parseInt(b.cylindree)))
  }, [cars, selectedBrand, selectedModel, engineQuery])

  useEffect(() => {
    if (step === "engine" && selectedBrand && selectedModel && engines.length === 1 && !isBackNav) {
      handleSelectEngine(engines[0].key)
    }
  }, [step, selectedBrand, selectedModel, engines, isBackNav])

  const origins = useMemo(() => {
    if (!selectedBrand || !selectedModel || !selectedEngineKey) return [] as { name: string; count: number }[]
    const [cyl, eng] = selectedEngineKey.split("|")
    const subset = cars.filter((c) => c.marque === selectedBrand && c.modele === selectedModel && c.cylindree === cyl && c.energie === eng)
    const counts = new Map<string, number>()
    for (const c of subset) counts.set(c.paysOrigine, (counts.get(c.paysOrigine) || 0) + 1)
    let list = Array.from(counts.entries()).map(([name, count]) => ({ name, count }))
    if (originQuery.trim()) {
      const q = originQuery.trim().toLowerCase()
      list = list.filter((o) => o.name.toLowerCase().includes(q))
    }
    return list.sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name))
  }, [cars, selectedBrand, selectedModel, selectedEngineKey, originQuery])

  useEffect(() => {
    if (step === "origin" && selectedBrand && selectedModel && selectedEngineKey && origins.length === 1 && !isBackNav) {
      handleSelectOrigin(origins[0].name)
    }
  }, [step, selectedBrand, selectedModel, selectedEngineKey, origins, isBackNav])

  useEffect(() => {
    if (step === "summary" && previewCar && !didSelectRef.current) {
      didSelectRef.current = true
      onSelect(previewCar)
    }
  }, [step, previewCar, onSelect])

  const finalMatches = useMemo(() => {
    if (!selectedBrand || !selectedModel || !selectedEngineKey || !selectedOrigin) return [] as CarBrowserCarData[]
    const [cyl, eng] = selectedEngineKey.split("|")
    return cars.filter(
      (c) => c.marque === selectedBrand && c.modele === selectedModel && c.cylindree === cyl && c.energie === eng && c.paysOrigine === selectedOrigin,
    )
  }, [cars, selectedBrand, selectedModel, selectedEngineKey, selectedOrigin])

  const brandLabel = t.calculator?.labels?.brand ?? "Brand"
  const modelLabel = t.calculator?.labels?.model ?? "Model"
  const engineLabel = t.calculator?.labels?.engine ?? "Engine"
  const originLabel = t.calculator?.labels?.origin ?? "Origin"

  const handleSelectBrand = (brand: string) => {
    setIsBackNav(false)
    setSelectedBrand(brand)
    setStep("model")
  }
  const handleSelectModel = (model: string) => {
    setIsBackNav(false)
    setSelectedModel(model)
    setStep("engine")
  }
  const handleSelectEngine = (key: string) => {
    setIsBackNav(false)
    setSelectedEngineKey(key)
    setStep("origin")
  }
  const handleSelectOrigin = (origin: string) => {
    setIsBackNav(false)
    setSelectedOrigin(origin)
    const [cyl, eng] = (selectedEngineKey || "|").split("|")
    const matches = cars.filter(
      (c) => c.marque === selectedBrand && c.modele === selectedModel && c.cylindree === cyl && c.energie === eng && c.paysOrigine === origin,
    )
    if (matches.length > 0) {
      setPreviewCar(matches[0])
    } else {
      setPreviewCar(null)
    }
    didSelectRef.current = false
    setStep("summary")
  }

  return (
    <div className={`space-y-4 ${language === "ar" ? "text-right" : ""}`} dir={language === "ar" ? "rtl" : "ltr"}>
      <div className={`flex items-center justify-between ${language === "ar" ? "flex-row-reverse" : ""}`}>
        <div className={`${language === "ar" ? "order-2" : "order-1"}`}>
          <Breadcrumb>
            <BreadcrumbList className={`${language === "ar" ? "flex-row-reverse" : ""}`}> 
              <BreadcrumbItem>
                {language === "ar" ? (
                  step === "origin" ? (
                    <BreadcrumbPage>{originLabel}</BreadcrumbPage>
                  ) : isStepAvailable("origin") ? (
                    <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); resetTo("origin") }}>{originLabel}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{originLabel}</BreadcrumbPage>
                  )
                ) : (
                  step === "brand" ? (
                    <BreadcrumbPage>{brandLabel}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); resetTo("brand") }}>{brandLabel}</BreadcrumbLink>
                  )
                )}
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {language === "ar" ? (
                  step === "engine" ? (
                    <BreadcrumbPage>{engineLabel}</BreadcrumbPage>
                  ) : isStepAvailable("engine") ? (
                    <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); resetTo("engine") }}>{engineLabel}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{engineLabel}</BreadcrumbPage>
                  )
                ) : (
                  step === "model" ? (
                    <BreadcrumbPage>{modelLabel}</BreadcrumbPage>
                  ) : isStepAvailable("model") ? (
                    <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); resetTo("model") }}>{modelLabel}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{modelLabel}</BreadcrumbPage>
                  )
                )}
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {language === "ar" ? (
                  step === "model" ? (
                    <BreadcrumbPage>{modelLabel}</BreadcrumbPage>
                  ) : isStepAvailable("model") ? (
                    <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); resetTo("model") }}>{modelLabel}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{modelLabel}</BreadcrumbPage>
                  )
                ) : (
                  step === "engine" ? (
                    <BreadcrumbPage>{engineLabel}</BreadcrumbPage>
                  ) : isStepAvailable("engine") ? (
                    <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); resetTo("engine") }}>{engineLabel}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{engineLabel}</BreadcrumbPage>
                  )
                )}
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {language === "ar" ? (
                  step === "brand" ? (
                    <BreadcrumbPage>{brandLabel}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); resetTo("brand") }}>{brandLabel}</BreadcrumbLink>
                  )
                ) : (
                  step === "origin" ? (
                    <BreadcrumbPage>{originLabel}</BreadcrumbPage>
                  ) : isStepAvailable("origin") ? (
                    <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); resetTo("origin") }}>{originLabel}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{originLabel}</BreadcrumbPage>
                  )
                )}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className={`${language === "ar" ? "order-1 mr-auto" : "order-2 ml-auto"}`}>
          {((selectedBrand || selectedModel || selectedEngineKey || selectedOrigin) || (brandQuery || modelQuery || engineQuery || originQuery)) && (
            <Button variant="ghost" size="sm" onClick={() => resetTo("brand")}> {t.common?.reset ?? "Reset"} </Button>
          )}
        </div>
      </div>

      {step === "brand" && (
        <div className="space-y-3">
          {!hideInputs && (
            <Input placeholder={t.common?.search ?? "Search brand"} value={brandQuery} onChange={(e) => { setBrandQuery(e.target.value); setBrandPage(1) }} dir={language === "ar" ? "rtl" : "ltr"} className={`${language === "ar" ? "text-right" : ""}`} />
          )}
          <div className={`flex flex-wrap gap-2 sm:gap-3 ${language === "ar" ? "justify-end" : ""}`}>
            {pagedBrands.map((b) => (
              <button
                key={b.name}
                type="button"
                className={`inline-flex items-center gap-2 rounded-md border bg-card text-card-foreground shadow-sm px-2 py-1 whitespace-nowrap hover:shadow-md transition ${language === "ar" ? "flex-row-reverse" : ""}`}
                onClick={() => handleSelectBrand(b.name)}
              >
                <span className={`text-xs leading-tight font-medium ${language === "ar" ? "text-right" : ""}`}>{b.name}</span>
                <Badge variant="secondary" className="text-[10px] px-1 py-0">{b.count} {t.calculator?.labels?.model ?? "models"}</Badge>
              </button>
            ))}
          </div>
          { !brandQuery.trim() && (
            <div className="flex justify-center gap-2 pt-1">
              { brandPage > 1 && (
                <Button variant="outline" onClick={() => setBrandPage(1)}>{t.common?.showLess ?? "Show less"}</Button>
              ) }
              { pagedBrands.length < brands.length && (
                <Button variant="outline" onClick={() => setBrandPage((p) => p + 1)}>{t.common?.showMore ?? "Show more"}</Button>
              ) }
            </div>
          ) }
        </div>
      )}

      {step === "model" && selectedBrand && (
        <div className="space-y-3">
          {!hideInputs && (
            <Input placeholder={t.common?.search ?? "Search model"} value={modelQuery} onChange={(e) => setModelQuery(e.target.value)} dir={language === "ar" ? "rtl" : "ltr"} className={`${language === "ar" ? "text-right" : ""}`} />
          )}
          <div className={`flex flex-wrap gap-2 sm:gap-3 ${language === "ar" ? "justify-end" : ""}`}>
            {models.map((m) => (
              <button
                key={m.name}
                type="button"
                className={`inline-flex items-center gap-2 rounded-md border bg-card text-card-foreground shadow-sm px-2 py-1 whitespace-nowrap hover:shadow-md transition ${language === "ar" ? "flex-row-reverse" : ""}`}
                onClick={() => handleSelectModel(m.name)}
              >
                <span className={`text-xs leading-tight font-medium ${language === "ar" ? "text-right" : ""}`}>{m.name}</span>
                <Badge variant="secondary" className="text-[10px] px-1 py-0">{m.count} {t.calculator?.labels?.engine ?? "engines"}</Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "engine" && selectedBrand && selectedModel && (
        <div className="space-y-3">
          {!hideInputs && (
            <Input placeholder={t.common?.search ?? "Search engine"} value={engineQuery} onChange={(e) => setEngineQuery(e.target.value)} dir={language === "ar" ? "rtl" : "ltr"} className={`${language === "ar" ? "text-right" : ""}`} />
          )}
          <div className={`flex flex-wrap gap-2 sm:gap-3 ${language === "ar" ? "justify-end" : ""}`}>
            {engines.map((e) => (
              <button
                key={e.key}
                type="button"
                className={`inline-flex items-center gap-2 rounded-md border bg-card text-card-foreground shadow-sm px-2 py-1 whitespace-nowrap hover:shadow-md transition ${language === "ar" ? "flex-row-reverse" : ""}`}
                onClick={() => handleSelectEngine(e.key)}
              >
                <span className={`text-xs leading-tight font-medium ${language === "ar" ? "text-right" : ""}`}>{e.cylindree}cc • {e.energie}</span>
                <Badge variant="secondary" className="text-[10px] px-1 py-0">{e.count} {t.calculator?.labels?.origin ?? "origins"}</Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "origin" && selectedEngineKey && (
        <div className="space-y-3">
          {!hideInputs && (
            <Input placeholder={t.common?.search ?? "Search origin"} value={originQuery} onChange={(e) => setOriginQuery(e.target.value)} dir={language === "ar" ? "rtl" : "ltr"} className={`${language === "ar" ? "text-right" : ""}`} />
          )}
          <div className={`flex flex-wrap gap-2 sm:gap-3 ${language === "ar" ? "justify-end" : ""}`}>
            {origins.map((o) => (
              <button
                key={o.name}
                type="button"
                className={`inline-flex items-center gap-2 rounded-md border bg-card text-card-foreground shadow-sm px-2 py-1 whitespace-nowrap hover:shadow-md transition ${language === "ar" ? "flex-row-reverse" : ""}`}
                onClick={() => handleSelectOrigin(o.name)}
              >
                <span className={`text-xs leading-tight font-medium ${language === "ar" ? "text-right" : ""}`}>{o.name}</span>
                <Badge variant="secondary" className="text-[10px] px-1 py-0">{o.count} {t.common?.search ?? "matches"}</Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "summary" && previewCar && null}
    </div>
  )
}


