"use client"

import { DialogDescription } from "@/components/ui/dialog"

import { useRef } from "react"

import { DialogTrigger } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calculator,
  Car,
  Info,
  RefreshCw,
  Search,
  ChevronDown,
  History,
  Download,
  Trash2,
  Star,
  StarOff,
  Share2,
  CheckCircle,
  Gauge,
  FileText,
  Clock,
  RotateCcw,
  Menu,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/components/language-provider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"

import { useRouter, useSearchParams } from "next/navigation"

interface CalculationResult {
  customsFee: number
  vat: number
  totalFee: number
  breakdown: {
    baseFee: number
    ageFactor: number
    typeFactor: number
  }
  ageCategory: string
  currency: string
  exchangeRate: number
  engineSizeCC: number
}

interface CarData {
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

interface CalculationHistory {
  id: string
  timestamp: Date
  carDetails: {
    brand: string
    model: string
    price: number
    currency: string
    type: string
    age: string
    engineSize: string
  }
  result: CalculationResult
  exchangeRate: number
  ageCategory: string
  usedPrice?: number
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []

  // Create matrix
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  // Fill matrix
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

function calculateRelevanceScore(car: CarData, searchTerm: string): number {
  const searchLower = searchTerm.toLowerCase()
  const marque = car.marque.toLowerCase()
  const modele = car.modele.toLowerCase()
  const fullName = `${marque} ${modele}`

  // Exact matches get highest score
  if (marque === searchLower || modele === searchLower || fullName === searchLower) {
    return 1000
  }

  // Starts with matches get high score
  if (marque.startsWith(searchLower) || modele.startsWith(searchLower) || fullName.startsWith(searchLower)) {
    return 900
  }

  // Contains matches get medium score
  if (marque.includes(searchLower) || modele.includes(searchLower) || fullName.includes(searchLower)) {
    return 800
  }

  // Calculate Levenshtein distance for fuzzy matching
  const marqueDistance = levenshteinDistance(searchLower, marque)
  const modeleDistance = levenshteinDistance(searchLower, modele)
  const fullNameDistance = levenshteinDistance(searchLower, fullName)

  // Get the best (minimum) distance
  const bestDistance = Math.min(marqueDistance, modeleDistance, fullNameDistance)

  // Convert distance to score (lower distance = higher score)
  // Only consider matches with distance <= 3 for reasonable fuzzy matching
  if (bestDistance <= 3) {
    return 700 - bestDistance * 100
  }

  // Check for partial matches in engine specs
  if (car.energie.toLowerCase().includes(searchLower) || car.cylindree.includes(searchTerm)) {
    return 600
  }

  return 0 // No match
}

export default function CustomsCalculator() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, formatNumber, formatTime, language, formatCurrency } = useLanguage()

  const [carPrice, setCarPrice] = useState("")
  const [carType, setCarType] = useState("new") // Set "new" as default car type for brand new vehicles
  const [carAge, setCarAge] = useState("new") // Set "new" as default car age instead of empty string
  const [exchangeRate, setExchangeRate] = useState("270")
  const [eurExchangeRate, setEurExchangeRate] = useState("290")
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [highlightCard, setHighlightCard] = useState(false)
  const [isFetchingRate, setIsFetchingRate] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const [carData, setCarData] = useState<CarData[]>([])
  const [selectedCar, setSelectedCar] = useState("")
  const [isLoadingCars, setIsLoadingCars] = useState(false)
  const [useReferencePrice, setUseReferencePrice] = useState(false)
  const [selectedCarCurrency, setSelectedCarCurrency] = useState("USD")

  const [searchTerm, setSearchTerm] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredCars, setFilteredCars] = useState<CarData[]>([])

  const [selectedCarDetails, setSelectedCarDetails] = useState<CarData | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)

  const [calculationHistory, setCalculationHistory] = useState<CalculationHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [errorState, setErrorState] = useState<string | null>(null)
  const { toast } = useToast()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const [favorites, setFavorites] = useState<string[]>([])
  const [isSharing, setIsSharing] = useState(false)
  const [copiedCalculation, setCopiedCalculation] = useState<string | null>(null)
  const [userPreferences, setUserPreferences] = useState({
    defaultCurrency: "USD",
    autoCalculate: true,
    saveHistory: true,
  })

  const [entryMode, setEntryMode] = useState<"search" | "manual">("search")
  const [engineSize, setEngineSize] = useState("")
  const [calculatedEngineSize, setCalculatedEngineSize] = useState("")
  const [manualCarData, setManualCarData] = useState({
    engineSize: "",
    price: "",
  })
  const [manualCurrency, setManualCurrency] = useState("USD")

  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<CarData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [didHydrateFromURL, setDidHydrateFromURL] = useState(false)
  const pdfRef = useRef<HTMLDivElement>(null)
  const breakdownRef = useRef<HTMLDivElement>(null)
  const [suppressNextHistory, setSuppressNextHistory] = useState(false)

  const getHistoryKey = (args: {
    brand: string
    model: string
    price: number
    currency: string
    ageCategory: string
    engineSizeCC: string | number
  }) => {
    const brand = (args.brand || "Manual Entry").toLowerCase()
    const model = (args.model || "Custom").toLowerCase()
    const price = Number(args.price || 0)
    const currency = (args.currency || "USD").toUpperCase()
    const age = (args.ageCategory || "new").toLowerCase()
    const engine = String(args.engineSizeCC || "").trim()
    return `${brand}|${model}|${price}|${currency}|${age}|${engine}`
  }

  // Build query params from current state
  const buildQueryParams = (): URLSearchParams => {
    const params = new URLSearchParams()
    if (entryMode === "search" && selectedCarDetails) {
      params.set("brand", selectedCarDetails.marque)
      params.set("model", selectedCarDetails.modele)
      params.set("numero", selectedCarDetails.numero)
      if (carPrice) params.set("price", carPrice)
      params.set("engine", selectedCarDetails.cylindree)
      params.set("currency", selectedCarDetails.currency)
    } else if (entryMode === "manual") {
      params.set("brand", "Manual Entry")
      params.set("model", "Custom Vehicle")
      if (manualCarData.price) params.set("price", manualCarData.price)
      if (manualCarData.engineSize) params.set("engine", manualCarData.engineSize)
      params.set("currency", manualCurrency)
    }
    if (carAge) params.set("age", carAge)
    params.set("mode", entryMode)
    return params
  }

  // Keep URL query params in sync with input changes (only after initial hydration from URL)
  useEffect(() => {
    if (!didHydrateFromURL) return
    try {
      const params = buildQueryParams()
      const newQuery = params.toString()
      const currentQuery = window.location.search.replace(/^\?/, "")
      if (newQuery !== currentQuery) {
        const relativeUrl = `${window.location.pathname}?${newQuery}`
        router.replace(relativeUrl)
      }
    } catch (err) {
      // no-op: window may be unavailable in rare cases
    }
  }, [didHydrateFromURL, entryMode, selectedCarDetails, carPrice, manualCarData.price, manualCarData.engineSize, manualCurrency, carAge])

  useEffect(() => {
    if (didHydrateFromURL) return
    const brand = searchParams.get("brand") || ""
    const model = searchParams.get("model") || ""
    const numero = searchParams.get("numero") || ""
    const price = searchParams.get("price") || ""
    const engine = searchParams.get("engine") || ""
    const age = searchParams.get("age") || ""
    const currency = searchParams.get("currency") || ""
    const entryModeParam = searchParams.get("mode") || ""

    // No params => mark hydration complete so future state changes sync to URL
    if (!brand && !model && !numero && !price && !engine && !age && !currency && !entryModeParam) {
      if (!didHydrateFromURL) setDidHydrateFromURL(true)
      return
    }

    // Determine intended mode
    let intendedMode: "manual" | "search"
    if (entryModeParam === "manual") intendedMode = "manual"
    else if (entryModeParam === "search") intendedMode = "search"
    else intendedMode = !brand && price && engine ? "manual" : "search"

    if (intendedMode === "manual") {
      // Manual mode from params
      const resolvedCurrency = currency || manualCurrency || "USD"
      const resolvedAge = age || carAge || "new"
      setEntryMode("manual")
      setSelectedCarDetails(null)
      if (price) setCarPrice(price)
      if (engine) setEngineSize(engine)
      setManualCarData({ price: price || manualCarData.price, engineSize: engine || manualCarData.engineSize })
      setManualCurrency(resolvedCurrency)
      setCarAge(resolvedAge)

      if (price && resolvedAge && (engine || manualCarData.engineSize)) {
        const rateStr = resolvedCurrency === "EUR" ? eurExchangeRate : exchangeRate
        calculateCustomsFee(price, resolvedAge, rateStr, resolvedCurrency, engine || manualCarData.engineSize)
      }
      setDidHydrateFromURL(true)
      return
    }

    // Search mode from params
    setEntryMode("search")
    setSelectedCar("")

    // If we have car data, try to find the matching car
    if (carData.length > 0 && (numero || brand || model)) {
      const brandLower = brand.toLowerCase()
      const modelLower = model.toLowerCase()
      const found = numero
        ? carData.find((c) => c.numero === numero)
        : carData.find(
            (c) =>
              (!brand || c.marque.toLowerCase() === brandLower) && (!model || c.modele.toLowerCase() === modelLower),
          )

      if (found) {
        setSelectedCarDetails(found)
        setSelectedCarCurrency(found.currency || currency || "USD")
        const resolvedAge = age || "new"
        setCarAge(resolvedAge)
        const foundId = `${found.marque}-${found.modele}-${found.numero}`
        setSelectedCar(foundId)
        setSearchTerm(`${found.marque} ${found.modele} (${found.cylindree}cc, ${found.energie}, ${found.currency})`)

        // Prefer price from params; else derive from reference based on age
        let derivedPrice = price
        if (!derivedPrice) {
          switch (resolvedAge) {
            case "new":
              derivedPrice = String(found.neuf || "")
              break
            case "less-than-1":
              derivedPrice = String(found.moinsUn || "")
              break
            case "less-than-2":
              derivedPrice = String(found.moinsDeux || "")
              break
            case "less-than-3":
              derivedPrice = String(found.moinsTrois || "")
              break
            default:
              derivedPrice = String(found.neuf || "")
          }
        }
        if (derivedPrice) setCarPrice(derivedPrice)

        const resolvedCurrency = currency || found.currency || "USD"
        const rateStr = resolvedCurrency === "EUR" ? eurExchangeRate : exchangeRate
        const resolvedEngine = engine || found.cylindree

        if (derivedPrice && resolvedAge && resolvedEngine) {
          calculateCustomsFee(derivedPrice, resolvedAge, rateStr, resolvedCurrency, resolvedEngine, found)
        }
        setDidHydrateFromURL(true)
      } else if (price && engine) {
        // Fallback to manual calculation if car not found but essential fields exist
        const resolvedCurrency = currency || "USD"
        const resolvedAge = age || "new"
        setEntryMode("manual")
        setSelectedCarDetails(null)
        setManualCarData({ price, engineSize: engine })
        setManualCurrency(resolvedCurrency)
        setCarAge(resolvedAge)
        const rateStr = resolvedCurrency === "EUR" ? eurExchangeRate : exchangeRate
        calculateCustomsFee(price, resolvedAge, rateStr, resolvedCurrency, engine)
        setDidHydrateFromURL(true)
      }
    }
    // If nothing matched, still mark hydration complete to enable sync
    if (!didHydrateFromURL) setDidHydrateFromURL(true)
  }, [searchParams, carData, eurExchangeRate, exchangeRate, didHydrateFromURL])

  const handleReset = () => {
    setSelectedCarDetails(null)
    setResult(null)
    setCarAge("new")
    setCarPrice("")
    setEngineSize("")
    setSearchTerm("")
    setFilteredCars([])
    setIsSearching(false)
    setEntryMode("search")
    setManualCarData({ engineSize: "", price: "" })
    setCalculatedEngineSize("")
  }

  const fetchCarData = async () => {
    setIsLoadingCars(true)
    setErrorState(null)
    try {
      const response = await fetch("/data/DZ%20Car%20Customs.csv")

      if (!response.ok) {
        throw new Error(`Failed to fetch car data: ${response.status}`)
      }

      const csvText = await response.text()

      const lines = csvText.split("\n")
      const headers = lines[0].split(",")

      const cars: CarData[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",")
        if (values.length >= 13) {
          cars.push({
            numero: values[0]?.replace(/"/g, "") || "",
            marque: values[2]?.replace(/"/g, "") || "",
            modele: values[3]?.replace(/"/g, "") || "",
            energie: values[4]?.replace(/"/g, "") || "",
            cylindree: values[5]?.replace(/"/g, "") || "",
            annee: values[6]?.replace(/"/g, "") || "",
            paysOrigine: values[7]?.replace(/"/g, "") || "",
            neuf: Number.parseFloat(values[8]?.replace(/"/g, "") || "0"),
            moinsUn: Number.parseFloat(values[9]?.replace(/"/g, "") || "0"),
            moinsDeux: Number.parseFloat(values[10]?.replace(/"/g, "") || "0"),
            moinsTrois: Number.parseFloat(values[11]?.replace(/"/g, "") || "0"),
            currency: values[12]?.replace(/"/g, "") || "USD",
          })
        }
      }

      setCarData(cars)
      setFilteredCars(cars.slice(0, 50))
      toast({
        title: t.toasts?.carDbLoadedTitle ?? "Car database loaded",
        description: `${t.toasts?.carDbLoadedDescPrefix ?? "Successfully loaded"} ${cars.length} ${t.toasts?.vehiclesNoun ?? "vehicles"}`,
      })
      console.log("[v0] Loaded", cars.length, "cars from CSV")
    } catch (error) {
      console.log("[v0] Error fetching car data:", error)
      setErrorState(t.toasts?.carDbErrorDesc ?? "Failed to load car database. Please try again.")
      toast({
        title: t.toasts?.carDbErrorTitle ?? "Error loading car database",
        description: t.toasts?.carDbErrorDesc ?? "Please check your connection and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCars(false)
    }
  }

  const retryFetchCarData = async () => {
    setIsRetrying(true)
    await fetchCarData()
    setIsRetrying(false)
  }

  const fetchExchangeRate = async () => {
    setIsFetchingRate(true)
    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD")
      const data = await response.json()

      if (data.rates && data.rates.DZD) {
        const usdRate = data.rates.DZD.toFixed(2)
        setExchangeRate(usdRate)
        console.log("[v0] USD exchange rate fetched successfully:", usdRate)
      } else {
        console.log("[v0] DZD rate not found in response")
        setExchangeRate("270")
      }

      const eurResponse = await fetch("https://api.exchangerate-api.com/v4/latest/EUR")
      const eurData = await eurResponse.json()

      if (eurData.rates && eurData.rates.DZD) {
        const eurRate = eurData.rates.DZD.toFixed(2)
        setEurExchangeRate(eurRate)
        console.log("[v0] EUR exchange rate fetched successfully:", eurRate)
      } else {
        console.log("[v0] EUR to DZD rate not found in response")
        setEurExchangeRate("290")
      }

      setLastUpdated(new Date())
      toast({
        title: t.toasts?.ratesUpdatedTitle ?? "Exchange rates updated",
        description: t.toasts?.ratesUpdatedDesc ?? "Latest rates have been fetched successfully",
      })
    } catch (error) {
      console.log("[v0] Error fetching exchange rate:", error)
      toast({
        title: t.toasts?.ratesFailedTitle ?? "Failed to update exchange rates",
        description: t.toasts?.ratesFailedDesc ?? "Using default rates. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsFetchingRate(false)
    }
  }

  const handleCarSelection = (carId: string) => {
    setSelectedCar(carId)
    const car = carData.find((c) => `${c.marque}-${c.modele}-${c.numero}` === carId)

    if (car) {
      setSelectedCarDetails(car)
      setSelectedCarCurrency(car.currency)
      setSearchTerm(`${car.marque} ${car.modele} (${car.cylindree}cc, ${car.energie}, ${car.currency})`)
      // Sync URL with exact selected car (including unique numero) so the Selected Vehicle card stays in sync
      try {
        const params = buildQueryParams()
        params.set("numero", car.numero)
        const relativeUrl = `${window.location.pathname}?${params.toString()}`
        router.replace(relativeUrl)
      } catch {}
      setShowDropdown(false)

      console.log("[v0] Car selected:", car)

      if (carAge) {
        let price = 0
        switch (carAge) {
          case "new":
            price = car.neuf
            break
          case "less-than-1":
            price = car.moinsUn
            break
          case "less-than-2":
            price = car.moinsDeux
            break
          case "less-than-3":
            price = car.moinsTrois
            break
        }

        if (price > 0) {
          setCarPrice(price.toString())
          setUseReferencePrice(true)
          const currentRate = car.currency === "EUR" ? eurExchangeRate : exchangeRate
          calculateCustomsFee(price.toString(), carAge, currentRate, car.currency, car.cylindree, car)
        }
      }
    }
  }

  const handleAgeSelection = (age: string) => {
    setCarAge(age)

    if (selectedCar) {
      const car = carData.find((c) => `${c.marque}-${c.modele}-${c.numero}` === selectedCar)

      if (car) {
        let price = 0
        switch (age) {
          case "new":
            price = car.neuf
            break
          case "less-than-1":
            price = car.moinsUn
            break
          case "less-than-2":
            price = car.moinsDeux
            break
          case "less-than-3":
            price = car.moinsTrois
            break
        }

        if (price > 0) {
          setCarPrice(price.toString())
          setUseReferencePrice(true)
          const currentRate = car.currency === "EUR" ? eurExchangeRate : exchangeRate
          calculateCustomsFee(price.toString(), age, currentRate, car.currency, car.cylindree, car)
        }
      }
    }
  }

  const toggleFavorite = (calculationId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(calculationId)
        ? prev.filter((id) => id !== calculationId)
        : [...prev, calculationId]
      localStorage.setItem("customs-calculator-favorites", JSON.stringify(newFavorites))
      return newFavorites
    })

    toast({
      title: favorites.includes(calculationId) ? (t.toasts?.favRemovedTitle ?? "Removed from favorites") : (t.toasts?.favAddedTitle ?? "Added to favorites"),
      description: t.toasts?.favDesc ?? "Your favorite calculations are saved locally",
    })
  }

  const shareCalculation = async () => {
    setIsSharing(true)

    try {
      // Create URL with current form data as parameters
      const params = buildQueryParams()
      const relativeUrl = `${window.location.pathname}?${params.toString()}`
      router.replace(relativeUrl)

      // Copy the full URL to clipboard
      const shareUrl = `${window.location.origin}${relativeUrl}`
        await navigator.clipboard.writeText(shareUrl)
        toast({
        title: t.toasts?.linkCopiedTitle ?? "Link copied",
        description: t.toasts?.linkCopiedDesc ?? "The URL with your inputs has been copied to the clipboard.",
        })
    } catch (error) {
      console.log("[v0] Share failed:", error)
      toast({
        title: t.toasts?.shareFailedTitle ?? "Share failed",
        description: t.toasts?.shareFailedDesc ?? "Please try again or copy manually",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const loadCalculationFromHistory = (calculation: CalculationHistory) => {
    // Avoid duplicating a new history entry from the recalculation triggered by state restoration
    setSuppressNextHistory(true)
    const isManual = calculation.carDetails.brand === "Manual Entry"

    // Set mode and populate fields based on the stored calculation
    if (isManual) {
      setEntryMode("manual")
      setSelectedCarDetails(null)
      setManualCarData({
        price: calculation.carDetails.price.toString(),
        engineSize: calculation.carDetails.engineSize.toString(),
      })
      setManualCurrency(calculation.carDetails.currency)
    } else {
      setEntryMode("search")
      // try to find a matching car from database for better context
      const brandLower = calculation.carDetails.brand.toLowerCase()
      const modelLower = calculation.carDetails.model.toLowerCase()
      const found = carData.find(
        (c) => c.marque.toLowerCase() === brandLower && c.modele.toLowerCase() === modelLower,
      )
      if (found) {
        setSelectedCarDetails(found)
        setSelectedCar(`${found.marque}-${found.modele}-${found.numero}`)
        setSelectedCarCurrency(found.currency || calculation.carDetails.currency)
        setSearchTerm(`${found.marque} ${found.modele} (${found.cylindree}cc, ${found.energie}, ${found.currency})`)
      } else {
        setSelectedCarDetails(null)
        setSelectedCar("")
        setSelectedCarCurrency(calculation.carDetails.currency)
      }
      setCarPrice(calculation.carDetails.price.toString())
    }

    setCarType(calculation.carDetails.type)
    setCarAge(calculation.ageCategory)
    setCalculatedEngineSize(calculation.carDetails.engineSize)

    if (calculation.carDetails.currency === "EUR") {
      setEurExchangeRate(calculation.exchangeRate.toString())
    } else {
      setExchangeRate(calculation.exchangeRate.toString())
    }

    setResult(calculation.result)
    setShowHistory(false)

    // Immediately sync URL with loaded calculation
    try {
      const params = new URLSearchParams()
      if (isManual) {
        params.set("brand", "Manual Entry")
        params.set("model", "Custom Vehicle")
        params.set("price", calculation.carDetails.price.toString())
        params.set("engine", calculation.carDetails.engineSize.toString())
        params.set("currency", calculation.carDetails.currency)
        params.set("age", calculation.ageCategory)
        params.set("mode", "manual")
      } else {
        params.set("brand", calculation.carDetails.brand)
        params.set("model", calculation.carDetails.model)
        params.set("price", calculation.carDetails.price.toString())
        params.set("engine", calculation.carDetails.engineSize.toString())
        params.set("currency", calculation.carDetails.currency)
        params.set("age", calculation.ageCategory)
        params.set("mode", "search")
      }
      const relativeUrl = `${window.location.pathname}?${params.toString()}`
      router.replace(relativeUrl)
    } catch {}

    toast({
      title: t.toasts?.calcLoadedTitle ?? "Calculation loaded",
      description: t.toasts?.calcLoadedDesc ?? "Previous calculation has been restored",
    })
  }

  const getCurrentRate = () => {
    return selectedCarCurrency === "EUR" ? eurExchangeRate : exchangeRate
  }

  const calculateCustomsFee = async (
    priceOverride?: string,
    typeOverride?: string,
    rateOverride?: string,
    currencyOverride?: string,
    engineSizeCCOverride?: string,
    carSnapshot?: CarData | null,
  ) => {
    const currentPrice = priceOverride || carPrice || "0"
    const currentType = typeOverride || carAge || "new"
    const currentCurrency = currencyOverride || (entryMode === "manual" ? manualCurrency : selectedCarCurrency) || "USD"
    const currentRate = rateOverride || (currentCurrency === "EUR" ? eurExchangeRate : exchangeRate) || "270"

    console.log("[v0] Calculating with values:", { currentPrice, currentType, currentRate, currentCurrency })

    if (!currentPrice || !currentType || !currentRate) {
      toast({
        title: t.toasts?.missingInfoTitle ?? "Missing information",
        description: t.toasts?.missingInfoDesc ?? "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsCalculating(true)
    setHighlightCard(false)

    await new Promise((resolve) => setTimeout(resolve, 800))

    const price = Number.parseFloat(currentPrice)
    const rate = Number.parseFloat(currentRate)

    if (price <= 0) {
      toast({
        title: t.toasts?.invalidPriceTitle ?? "Invalid price",
        description: t.toasts?.invalidPriceDesc ?? "Please enter a valid car price",
        variant: "destructive",
      })
      setIsCalculating(false)
      return
    }

    const shippingFeeUSD = 2000
    const shippingFee = currentCurrency === "EUR" ? shippingFeeUSD * 0.85 : shippingFeeUSD
    const totalCarCost = price + shippingFee

    let customsAmount = 0
    let portFeeDZD = 0

    // Get engine size from override first, then selected car or manual entry
    const engineSize = engineSizeCCOverride
      ? Number.parseFloat(engineSizeCCOverride) / 1000
      : selectedCarDetails?.cylindree
      ? Number.parseFloat(selectedCarDetails.cylindree) / 1000 // Convert cc to liters for database cars
      : manualCarData.engineSize
        ? Number.parseFloat(manualCarData.engineSize) / 1000 // Convert cc to liters for manual entry
        : 0

    const engineSizeCC = engineSizeCCOverride
      ? engineSizeCCOverride
      : selectedCarDetails?.cylindree
      ? selectedCarDetails.cylindree
      : manualCarData.engineSize
        ? manualCarData.engineSize
        : "0"

    setCalculatedEngineSize(engineSizeCC)

    if (currentType === "new") {
      // New cars: 141% for over 1.8L, 40% for 1.8L and under
      if (engineSize > 1.8) {
        customsAmount = totalCarCost * 1.41
      } else {
        customsAmount = totalCarCost * 0.4
      }
      portFeeDZD = 300000
    } else {
      // Used cars: 121% for over 1.8L, 20% for 1.8L and under
      if (engineSize > 1.8) {
        customsAmount = totalCarCost * 1.21
      } else {
        customsAmount = totalCarCost * 0.2
      }
      portFeeDZD = 150000
    }

    const customsDZD = customsAmount * rate
    const totalDZD = Math.round(customsDZD + portFeeDZD)

    console.log("[v0] Calculation result:", {
      customsAmount,
      portFeeDZD,
      totalDZD,
      currency: currentCurrency,
      engineSize,
    })

    const actualCustomsPercentage =
      currentType === "new" ? (engineSize > 1.8 ? 1.41 : 0.4) : engineSize > 1.8 ? 1.21 : 0.2

    const calculationResult: CalculationResult = {
      customsFee: customsAmount,
      vat: 0,
      totalFee: totalDZD,
      breakdown: {
        baseFee: customsAmount,
        ageFactor: 1.0,
        typeFactor: actualCustomsPercentage,
      },
      ageCategory: currentType,
      currency: currentCurrency,
      exchangeRate: rate,
      engineSizeCC: Number(engineSizeCC),
    }

    const brandForHistory = carSnapshot?.marque || selectedCarDetails?.marque || "Manual Entry"
    const modelForHistory = carSnapshot?.modele || selectedCarDetails?.modele || "Custom"
    const historyEntry: CalculationHistory = {
      id: getHistoryKey({
        brand: brandForHistory,
        model: modelForHistory,
        price,
        currency: currentCurrency,
        ageCategory: carAge,
        engineSizeCC,
      }),
      timestamp: new Date(),
      carDetails: {
        brand: brandForHistory,
        model: modelForHistory,
        price: price,
        currency: currentCurrency,
        type: currentType,
        age: currentType,
        engineSize: String(engineSizeCC),
      },
      result: calculationResult,
      exchangeRate: rate,
      ageCategory: carAge,
    }

    if (userPreferences.saveHistory && !suppressNextHistory) {
      setCalculationHistory((prev) => {
        const newKey = historyEntry.id
        const head = prev[0]
        const nowTs = Date.now()
        const shouldReplaceHead =
          !!head &&
          head.carDetails.brand === historyEntry.carDetails.brand &&
          head.carDetails.model === historyEntry.carDetails.model &&
          Math.abs(nowTs - new Date(head.timestamp).getTime()) < 2000 &&
          head.carDetails.price !== historyEntry.carDetails.price
        const base = shouldReplaceHead ? prev.slice(1) : prev
        const filtered = base.filter(
          (h) =>
            getHistoryKey({
              brand: h.carDetails.brand,
              model: h.carDetails.model,
              price: h.carDetails.price,
              currency: h.carDetails.currency,
              ageCategory: h.ageCategory,
              engineSizeCC: h.carDetails.engineSize,
            }) !== newKey,
        )
        return [historyEntry, ...filtered].slice(0, 10)
      })
    }
    if (suppressNextHistory) setSuppressNextHistory(false)

    console.log("[v0] Setting result state:", calculationResult)
    const hadResult = !!result
    setResult(calculationResult)
    setIsCalculating(false)

    setHighlightCard(true)
    setTimeout(() => setHighlightCard(false), 3000)

    try {
      const isSmallScreen = window.matchMedia && window.matchMedia('(max-width: 640px)').matches
      if (isSmallScreen && pdfRef.current) {
        pdfRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } catch {}
  }

  const clearHistory = () => {
    setCalculationHistory([])
    toast({
      title: t.toasts?.historyClearedTitle ?? "History cleared",
      description: t.toasts?.historyClearedDesc ?? "All calculation history has been removed",
    })
  }

  const deleteHistoryItem = (calculationId: string) => {
    setCalculationHistory((prev) => prev.filter((h) => h.id !== calculationId))
    setFavorites((prev) => prev.filter((id) => id !== calculationId))
    toast({
      title: t.toasts?.entryDeletedTitle ?? "Entry deleted",
      description: t.toasts?.entryDeletedDesc ?? "The calculation has been removed from history.",
    })
  }

  const exportCalculation = (calculation: CalculationHistory) => {
    const exportData = {
      vehicle: `${calculation.carDetails.brand} ${calculation.carDetails.model}`,
      price: `${calculation.carDetails.price} ${calculation.carDetails.currency}`,
      type: calculation.carDetails.type,
      age: calculation.ageCategory,
      customsFee: `${calculation.result.customsFee.toFixed(2)} ${calculation.carDetails.currency}`,
      totalFee: `${calculation.result.totalFee.toLocaleString()} DZD`,
      exchangeRate: calculation.exchangeRate,
      calculatedOn: calculation.timestamp.toLocaleString(),
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `customs-calculation-${calculation.id}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: t.toasts?.exportedTitle ?? "Calculation exported",
      description: t.toasts?.exportedDesc ?? "Download started successfully",
    })
  }

  const formatDZD = (amount: number) => {
    const currentRate = selectedCarCurrency === "EUR" ? eurExchangeRate : exchangeRate
    const dzdAmount = amount * Number.parseFloat(currentRate || "270")
    return new Intl.NumberFormat("ar-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 2,
    }).format(dzdAmount)
  }

  useEffect(() => {
    fetchExchangeRate()
    fetchCarData()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDropdown])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCars(carData.slice(0, 50))
    } else {
      const searchResults = carData
        .map((car) => ({
          car,
          score: calculateRelevanceScore(car, searchTerm),
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
        .map(({ car }) => car)

      setFilteredCars(searchResults)
    }
  }, [searchTerm, carData])

  const carOptions = carData.map((car) => ({
    id: `${car.marque}-${car.modele}-${car.numero}`,
    label: `${car.marque} ${car.modele} (${car.cylindree}cc, ${car.energie}, ${car.currency})`,
    car: car,
  }))

  useEffect(() => {
    const savedHistory = localStorage.getItem("customs-calculator-history")
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        setCalculationHistory(
          parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
            exchangeRate: Number(item.exchangeRate),
            ageCategory: item.ageCategory,
            carDetails: {
              ...item.carDetails,
              price: Number(item.carDetails?.price ?? 0),
              engineSize: String(item.carDetails?.engineSize ?? ""),
              currency: String(item.carDetails?.currency ?? "USD"),
              type: String(item.carDetails?.type ?? "new"),
              age: String(item.carDetails?.age ?? item.ageCategory ?? "new"),
              brand: String(item.carDetails?.brand ?? "Manual Entry"),
              model: String(item.carDetails?.model ?? "Custom"),
            },
            result: {
              ...item.result,
              customsFee: Number(item.result?.customsFee ?? 0),
              vat: Number(item.result?.vat ?? 0),
              totalFee: Number(item.result?.totalFee ?? 0),
              exchangeRate: Number(item.result?.exchangeRate ?? item.exchangeRate ?? 0),
              engineSizeCC: Number(item.result?.engineSizeCC ?? item.carDetails?.engineSize ?? 0),
              breakdown: {
                ...item.result?.breakdown,
                baseFee: Number(item.result?.breakdown?.baseFee ?? 0),
                ageFactor: Number(item.result?.breakdown?.ageFactor ?? 0),
                typeFactor: Number(item.result?.breakdown?.typeFactor ?? 0),
              },
            },
          })),
        )
      } catch (error) {
        console.log("[v0] Error loading history:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (calculationHistory.length > 0) {
      localStorage.setItem("customs-calculator-history", JSON.stringify(calculationHistory))
    }
  }, [calculationHistory])

  useEffect(() => {
    const savedPreferences = localStorage.getItem("customs-calculator-preferences")
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences)
        setUserPreferences(parsed)
      } catch (error) {
        console.log("[v0] Error loading preferences:", error)
      }
    }

    const savedFavorites = localStorage.getItem("customs-calculator-favorites")
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites)
        setFavorites(parsed)
      } catch (error) {
        console.log("[v0] Error loading favorites:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("customs-calculator-preferences", JSON.stringify(userPreferences))
  }, [userPreferences])

  const canCalculate =
    (entryMode === "search" && selectedCarDetails && !!carAge) ||
    (entryMode === "manual" && !!manualCarData.price && !!carAge && !!manualCarData.engineSize)

  const calculateCustoms = () => {
    if (entryMode === "search" && selectedCarDetails) {
      calculateCustomsFee(undefined, undefined, undefined, undefined, selectedCarDetails.cylindree, selectedCarDetails)
    } else if (entryMode === "manual" && manualCarData.price) {
      calculateCustomsFee(manualCarData.price, carAge, undefined, manualCurrency, manualCarData.engineSize)
    }
  }

  // Auto-calculate on manual entry changes when all fields are present
  useEffect(() => {
    if (entryMode !== "manual") return
    if (!manualCarData.price || !manualCarData.engineSize || !carAge) return
    calculateCustomsFee(manualCarData.price, carAge, undefined, manualCurrency, manualCarData.engineSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryMode, manualCarData.price, manualCarData.engineSize, carAge, manualCurrency])

  const resetForm = () => {
    setCarPrice("")
    setCarType("new")
    setCarAge("new")
    setEngineSize("")
    setSelectedCar("")
    setSelectedCarDetails(null)
    setSearchTerm("")
    console.log("[v0] Clearing result state in resetForm")
    setResult(null)
    setUseReferencePrice(false)
    setManualCarData({ engineSize: "", price: "" })
    setCalculatedEngineSize("")
  }

  const exportToPDF = async () => {
    const target = pdfRef.current
    if (!target) {
      toast({ title: t.toasts?.nothingToExportTitle ?? "Nothing to export", description: t.toasts?.nothingToExportDesc ?? "Please calculate first.", variant: "destructive" })
      return
    }

    try {
      // Hidden iframe print (avoids popup blockers, preserves CSS)
      const iframe = document.createElement("iframe")
      iframe.setAttribute("aria-hidden", "true")
      iframe.style.position = "fixed"
      iframe.style.right = "0"
      iframe.style.bottom = "0"
      iframe.style.width = "0"
      iframe.style.height = "0"
      iframe.style.border = "0"
      document.body.appendChild(iframe)

      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (!doc) throw new Error("Unable to access print frame")

      const docClass = document.documentElement.className
      const lightDocClass = (docClass || "").replace(/\bdark\b/g, "").trim()
      const headHtml = Array.from(document.head.querySelectorAll('link[rel="stylesheet"], style'))
        .map((n) => n.outerHTML)
        .join("\n")
      const printableHtml = target.outerHTML + (breakdownRef.current ? breakdownRef.current.outerHTML : "")

      doc.open()
      doc.write(`<!doctype html>
<html class="${lightDocClass}" lang="${language}" dir="${language === "ar" ? "rtl" : "ltr"}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${headHtml}
    <style>
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      :root { color-scheme: light; }
      body { background: #fff; color: #0a0a0a; padding: 24px; }
      .print-container { max-width: 900px; margin: 0 auto; }
      .print-only { display: block !important; }
      /* Remove borders/shadows and hide buttons in result card when printing */
      .print-container .result-print [data-slot="card"] { border: 0 !important; box-shadow: none !important; }
      .print-container .result-print .border,
      .print-container .result-print .border-t,
      .print-container .result-print .border-b,
      .print-container .result-print .border-l,
      .print-container .result-print .border-r { border: 0 !important; }
      .print-container .result-print button,
      .print-container .result-print [role="button"] { display: none !important; }
    </style>
  </head>
  <body>
    <div class="print-container">${printableHtml}</div>
  </body>
</html>`)
      doc.close()

      const cleanup = () => {
        try { document.body.removeChild(iframe) } catch {}
        window.removeEventListener("afterprint", cleanup)
      }
      window.addEventListener("afterprint", cleanup)

      setTimeout(() => {
        const win = iframe.contentWindow
        if (!win) return cleanup()
        win.focus()
        win.print()
        setTimeout(cleanup, 1500)
      }, 350)
    } catch (err) {
      console.log("[v0] iFrame print failed:", err)
      toast({ title: t.toasts?.printFailedTitle ?? "Failed to open print dialog", description: t.toasts?.printFailedDesc ?? "Please try again.", variant: "destructive" })
    }
  }

  const shareCalculationHistory = async (calculation: CalculationHistory) => {
    setIsSharing(true)

    try {
      // Create URL with calculation data as parameters
      const params = new URLSearchParams()
      const isManual = calculation.carDetails.brand === "Manual Entry"
      if (isManual) {
        params.set("brand", "Manual Entry")
        params.set("model", "Custom Vehicle")
        params.set("price", calculation.carDetails.price.toString())
        params.set("engine", calculation.carDetails.engineSize.toString())
        params.set("currency", calculation.carDetails.currency)
        params.set("age", calculation.ageCategory)
        params.set("mode", "manual")
      } else {
        params.set("brand", calculation.carDetails.brand)
        params.set("model", calculation.carDetails.model)
        params.set("price", calculation.carDetails.price.toString())
        params.set("engine", calculation.carDetails.engineSize.toString())
        params.set("currency", calculation.carDetails.currency)
        params.set("age", calculation.ageCategory)
        params.set("mode", "search")
      }

      const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`

      await navigator.clipboard.writeText(shareUrl)
      setCopiedCalculation(calculation.id)
      setTimeout(() => setCopiedCalculation(null), 2000)
      toast({
        title: t.toasts?.linkCopiedToClipboardTitle ?? "Link copied to clipboard",
        description: t.toasts?.linkCopiedToClipboardDesc ?? "Share this URL to let others see your calculation",
      })
    } catch (error) {
      console.log("[v0] Share failed:", error)
      toast({
        title: t.toasts?.shareFailedTitle ?? "Share failed",
        description: t.toasts?.shareFailedDesc ?? "Please try again or copy manually",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  useEffect(() => {
    if (showDetailedBreakdown) {
      // Remove focus from any focused element when dialog opens
      setTimeout(() => {
        const activeElement = document.activeElement as HTMLElement
        if (activeElement && activeElement.blur) {
          activeElement.blur()
        }
      }, 0)
    }
  }, [showDetailedBreakdown])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <TooltipProvider>
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
          <div className="text-center mb-3 sm:mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 flex items-center gap-2 sm:hidden">
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open menu">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side={language === "ar" ? "right" : "left"} className="w-80">
                    <SheetHeader>
                      <SheetTitle>{t.calculator?.appTitle ?? "Car Import Customs Calculator"}</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 space-y-3">
                      <Button
                        variant="ghost"
                        onClick={() => { setEntryMode("search"); setIsMenuOpen(false) }}
                        className={`w-full justify-start h-11 ${entryMode === "search" ? "bg-muted/70" : ""}`}
                      >
                        <Search className="h-4 w-4 mr-2" /> {t.calculator?.searchDatabase ?? "Search Database"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => { setEntryMode("manual"); setSelectedCarDetails(null); setResult(null); setIsMenuOpen(false) }}
                        className={`w-full justify-start h-11 ${entryMode === "manual" ? "bg-muted/70" : ""}`}
                      >
                        <Calculator className="h-4 w-4 mr-2" /> {t.calculator?.manualEntry ?? "Manual Entry"}
                      </Button>
                      <Button variant="ghost" onClick={handleReset} className="w-full justify-start h-11">
                        <RotateCcw className="h-4 w-4 mr-2" /> {t.common?.reset ?? "Reset"}
                      </Button>
                      <Button variant="ghost" onClick={() => { setShowHistory(true); setIsMenuOpen(false) }} className="w-full justify-start h-11">
                        <History className="h-4 w-4 mr-2" /> {t.common?.history ?? "History"}
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              <div className="hidden sm:block flex-1" />
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-primary/10 rounded-full animate-pulse">
                  <Car className="h-6 w-6 sm:h-8 sm:w-8 text-primary" aria-hidden="true" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight sm:mt-0 mt-1">
                  {t.calculator?.appTitle ?? "Car Import Customs Calculator"}
                </h1>
              </div>
              <div className="flex-1 flex justify-end gap-2">
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2 leading-relaxed">
              {t.calculator?.tagline ?? "Calculate customs fees and taxes for importing vehicles into Algeria. Get accurate estimates based on current regulations and exchange rates."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium">{t.calculator?.currentRates ?? "Current Rates:"}</span>
                <span>1 $ = {formatNumber(Number(exchangeRate))} {t.currencies?.DZD ?? "DZD"}</span>
                <span>•</span>
                <span>1 € = {formatNumber(Number(eurExchangeRate))} {t.currencies?.DZD ?? "DZD"}</span>
              </div>
              {lastUpdated && (
                <div className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  <span>{t.common?.updated ?? "Updated:"} {formatTime(lastUpdated)}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-0 sm:mt-6">
              <div className="hidden sm:flex flex-col sm:flex-row gap-2 sm:gap-4 p-1 bg-muted/30 rounded-lg">
                <Button
                  variant={entryMode === "search" ? "default" : "ghost"}
                  onClick={() => setEntryMode("search")}
                  className="flex items-center gap-2 min-h-[44px] px-4 sm:px-6"
                >
                  <Search className="h-4 w-4" />
                  {t.calculator?.searchDatabase ?? "Search Database"}
                </Button>
                <Button
                  variant={entryMode === "manual" ? "default" : "ghost"}
                  onClick={() => {
                    setEntryMode("manual")
                    setSelectedCarDetails(null) // Clear selected car when switching to manual
                    setResult(null) // Clear previous results
                  }}
                  className="flex items-center gap-2 min-h-[44px] px-4 sm:px-6"
                >
                  <Calculator className="h-4 w-4" />
                  {t.calculator?.manualEntry ?? "Manual Entry"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex items-center gap-2 min-h-[44px] px-4 sm:px-6 bg-transparent"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t.common?.reset ?? "Reset"}
                </Button>
              </div>

              <Dialog open={showHistory} onOpenChange={setShowHistory}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent hover:bg-muted/50 transition-all duration-200 min-h-[44px] px-4 hover:scale-105 active:scale-95 hidden sm:flex"
                    aria-label={`View calculation history (${calculationHistory.length} items)`}
                  >
                    <History className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden xs:inline">{t.common?.history ?? "History"}</span> ({calculationHistory.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="mx-2 sm:mx-4 max-w-[calc(100vw-1rem)] sm:max-w-4xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">{t.calculator?.calculationHistory ?? "Calculation History"}</DialogTitle>
                    <DialogDescription className="text-sm">{t.calculator?.recentCalculations ?? "Your recent customs fee calculations"}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 sm:space-y-4">
                    {calculationHistory.length === 0 ? (
                      <div className="text-center text-muted-foreground py-6 sm:py-8">
                        <History className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                        <p className="text-sm sm:text-base">{t.calculator?.noCalculationsYet ?? "No calculations yet"}</p>
                        <p className="text-xs sm:text-sm">{t.calculator?.historyWillAppear ?? "Your calculation history will appear here"}</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearHistory}
                            className="gap-2 bg-transparent hover:bg-destructive/10 hover:text-destructive transition-colors min-h-[44px]"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden xs:inline">{t.common?.clearAll ?? "Clear All"}</span>
                          </Button>
                        </div>
                        {calculationHistory.map((calc) => (
                          <Card key={calc.id} className="p-3 sm:p-4 hover:shadow-md transition-shadow">
                            <div className="flex flex-col gap-3 sm:gap-4">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="secondary" className="animate-in fade-in-50 text-xs">
                                    {calc.carDetails.type === "new" ? (t.calculator?.newCarLabel ?? "New Car") : (t.calculator?.usedCarLabel ?? "Used Car")}
                                  </Badge>
                                  <span className="font-medium text-sm sm:text-base break-words">
                                    {calc.carDetails.brand} {calc.carDetails.model}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleFavorite(calc.id)}
                                    className="h-auto p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 min-h-[44px] min-w-[44px]"
                                  >
                                    {favorites.includes(calc.id) ? (
                                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    ) : (
                                      <StarOff className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </Button>
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground">
                                  {(t.calculator?.carPrice ?? "Car Price:") + " "}{formatNumber(Number(calc.carDetails.price))} {calc.carDetails.currency === "USD" ? "$" : calc.carDetails.currency === "EUR" ? "€" : (t.currencies?.DZD ?? "DZD")} • {(t.calculator?.labels?.totalShort ?? "Total") + ":"}{" "}
                                  <span className="font-semibold text-primary">
                                    {formatNumber(calc.result.totalFee)} {t.currencies?.DZD ?? "DZD"}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">{formatTime(calc.timestamp as unknown as Date)}</div>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => loadCalculationFromHistory(calc)}
                                  className="gap-2 hover:bg-primary/10 transition-colors min-h-[44px] flex-1 sm:flex-none"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                  <span className="hidden xs:inline">{t.common?.load ?? "Load"}</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => shareCalculationHistory(calc)}
                                  disabled={isSharing}
                                  className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors min-h-[44px] flex-1 sm:flex-none"
                                >
                                  {copiedCalculation === calc.id ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Share2 className="h-4 w-4" />
                                  )}
                                  <span className="hidden xs:inline">{t.common?.share ?? "Share"}</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteHistoryItem(calc.id)}
                                  className="gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors min-h-[44px] flex-1 sm:flex-none"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="hidden xs:inline">{t.common?.delete ?? "Delete"}</span>
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-6 sm:py-8 md:py-12 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-3 sm:gap-6 md:gap-8 mb-4 sm:mb-8">
            {/* Left Column - Search/Manual Entry Cards */}
            <div className="space-y-6">
              {entryMode === "search" && (
                <Card className={`shadow-lg hover:shadow-xl transition-all duration-300 ${language === "ar" ? "border-r-4 border-r-primary/20" : "border-l-4 border-l-primary/20"}`}>
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Search className="h-5 w-5 text-primary" aria-hidden="true" />
                      {t.calculator?.searchDatabaseTitle ?? "Search Official Car Database"}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1"
                            aria-label={t.aria?.dbInfo ?? "Information about car database"}
                          >
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <p className="max-w-xs">
                            {t.calculator?.searchDatabaseDescription ?? "Search from the official Algerian customs reference database with pre-approved prices and"} specifications.
                          </p>
                        </PopoverContent>
                      </Popover>
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {t.calculator?.findFromList ?? "Find your car from the official Algerian customs reference list"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {errorState && (
                      <Alert
                        variant="destructive"
                        className={`animate-in slide-in-from-top-2 ${language === "ar" ? "border-r-4 border-r-destructive" : "border-l-4 border-l-destructive"}`}
                      >
                        <Info className="h-4 w-4" aria-hidden="true" />
                        <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-sm">{errorState}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={retryFetchCarData}
                            disabled={isRetrying}
                            className="bg-transparent hover:bg-destructive/10 transition-colors min-h-[44px] w-full sm:w-auto"
                            aria-label={t.aria?.retryCars ?? "Retry loading car data"}
                          >
                            {isRetrying ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin mr-1" aria-hidden="true" />
                                <span>{t.common?.retrying ?? "Retrying..."}</span>
                              </>
                            ) : (
                              t.common?.retry ?? "Retry"
                            )}
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2 relative" ref={dropdownRef}>
                      <Label htmlFor="car-search" className="text-sm font-medium">
                        {t.calculator?.searchCarModel ?? "Search Car Model"}
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="car-search"
                          autoComplete="off"
                          type="text"
                          placeholder={isLoadingCars ? (t.calculator?.searchPlaceholderLoading ?? "Loading cars...") : (t.calculator?.searchPlaceholder ?? "Search by brand, model, or engine...")}
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setShowDropdown(true)
                            setSelectedCar("")
                            setUseReferencePrice(false)
                          }}
                          onFocus={() => {
                            setSearchTerm("")
                            setShowDropdown(true)
                            setSelectedCar("")
                            setUseReferencePrice(false)
                          }}
                          disabled={!carAge || isLoadingCars}
                          className="pl-10 pr-10 hover:bg-muted/30 focus:bg-background transition-colors min-h-[48px] text-base"
                        />
                        <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>

                      {isLoadingCars && (
                        <div className="space-y-2 mt-2 animate-in fade-in-50">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      )}

                      {showDropdown && filteredCars.length > 0 && !isLoadingCars && (
                        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto animate-in fade-in-0 slide-in-from-top-2 sm:max-h-72">
                          {filteredCars.map((car) => {
                            const carId = `${car.marque}-${car.modele}-${car.numero}`
                            return (
                              <button
                                key={carId}
                                type="button"
                                className="w-full px-3 py-4 text-left hover:bg-muted/50 focus:bg-muted/50 focus:outline-none border-b border-border/50 last:border-b-0 transition-colors duration-150 min-h-[60px]"
                                onClick={() => handleCarSelection(carId)}
                              >
                                <div className="font-medium text-sm">
                                  {car.marque} {car.modele}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {car.cylindree}cc • {car.energie} • {car.paysOrigine}
                                  {car.currency && ` • ${car.currency}`}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {showDropdown && searchTerm && filteredCars.length === 0 && !isLoadingCars && (
                        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-3 animate-in fade-in-0">
                          <p className="text-sm text-muted-foreground">{t.calculator?.noCarsFound ?? "No cars found matching"} "{searchTerm}"</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="car-age" className="text-sm font-medium flex items-center gap-2">
                        {t.calculator?.selectCarAge ?? "Car Age Category"}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1"
                              aria-label="Information about car age categories"
                            >
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <p className="max-w-xs">{t.notes?.ageInfo ?? "Car age affects customs rates. New cars have higher fees but different regulations."}</p>
                          </PopoverContent>
                        </Popover>
                      </Label>
                      <Select value={carAge} onValueChange={handleAgeSelection}>
                        <SelectTrigger
                          className="hover:bg-muted/50 transition-colors min-h-[48px] focus:ring-2 focus:ring-primary/20"
                          aria-label={t.aria?.ageSelect ?? "Select car age category"}
                        >
                          <SelectValue placeholder={t.calculator?.selectCarAge ?? "Select car age"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">{t.calculator?.brandNew ?? "Brand New"}</SelectItem>
                          <SelectItem value="less-than-1">{t.calculator?.lessThan1 ?? "Less than 1 year"}</SelectItem>
                          <SelectItem value="less-than-2">{t.calculator?.lessThan2 ?? "Less than 2 years"}</SelectItem>
                          <SelectItem value="less-than-3">{t.calculator?.lessThan3 ?? "Less than 3 years"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {useReferencePrice && (
                      <Alert className="animate-in slide-in-from-left-2">
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {t.calculator?.usingReferencePrice ?? "Using official Algerian customs reference price for the selected vehicle."}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              {entryMode === "manual" && (
                <Card className={`shadow-lg hover:shadow-xl transition-all duration-300 ${language === "ar" ? "border-r-4 border-r-primary/20" : "border-l-4 border-l-primary/20"}`}>
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Calculator className="h-5 w-5 text-primary" aria-hidden="true" />
                      {t.calculator?.manualEntry ?? "Manual Entry"}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1"
                            aria-label={t.aria?.manualInfo ?? "Information about manual entry"}
                          >
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <p className="max-w-xs">
                            {t.calculator?.manualEntryHelp ?? "Use this if your car is not found in the official database or if you want to calculate with a different price."}
                          </p>
                        </PopoverContent>
                      </Popover>
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {t.calculator?.manualEntryDescription ?? "Enter your vehicle details manually if not found in the database"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="manual-price" className="text-sm font-medium">
                        {t.calculator?.carPriceLabel ?? "Car Price"}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="manual-price"
                          type="number"
                          inputMode="decimal"
                          enterKeyHint="done"
                          step="0.01"
                          placeholder={`${t.calculator?.enterPriceIn ?? "Enter price in"}${manualCurrency === "USD" ? t.currencies?.USD ?? "USD" : t.currencies?.EUR ?? "EUR"}`}
                          value={manualCarData.price}
                          onChange={(e) => setManualCarData((prev) => ({ ...prev, price: e.target.value }))}
                          className="hover:bg-muted/50 transition-colors min-h-[48px] focus:ring-2 focus:ring-primary/20 flex-1"
                          aria-label={`Car price in ${manualCurrency}`}
                        />
                        <Select value={manualCurrency} onValueChange={setManualCurrency}>
                          <SelectTrigger className="w-16 h-8 text-base font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">$</SelectItem>
                            <SelectItem value="EUR">€</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-muted-foreground">{t.calculator?.currentRateLabel ?? "Current rate:"} 1 {manualCurrency === "USD" ? "$" : "€"} = {manualCurrency === "USD" ? exchangeRate : eurExchangeRate} {t.currencies?.DZD ?? "DZD"}</p>
                    </div>

                    <Label htmlFor="engine-size" className="text-sm font-medium flex items-center gap-2">
                      {t.calculator?.engineSize ?? "Engine Size (cc)"}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1"
                            aria-label={t.aria?.engineInfo ?? "Information about engine size"}
                          >
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <p className="max-w-xs">
                            {t.calculator?.engineSizeInfo ?? "Engine displacement in cubic centimeters affects customs calculations."}
                          </p>
                        </PopoverContent>
                      </Popover>
                    </Label>
                    <div className="relative">
                      <ChevronDown className="absolute left-3 [dir=rtl]:right-3 [dir=rtl]:left-auto top-3 h-4 w-4 text-muted-foreground z-10 pointer-events-none" aria-hidden="true" />
                      <select
                        id="engine-size"
                        value={manualCarData.engineSize}
                        onChange={(e) => setManualCarData((prev) => ({ ...prev, engineSize: e.target.value }))}
                        className="w-full pl-12 pr-10 py-3 border border-input bg-background hover:bg-muted/30 focus:bg-background transition-colors min-h-[48px] text-base rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none"
                      >
                        <option value="">{t.calculator?.selectEngineSize ?? "Select engine size"}</option>
                        <option value="1800">{t.calculator?.engineLeq18 ?? "≤ 1.8L"}</option>
                        <option value="1801">{t.calculator?.engineGt18 ?? "> 1.8L"}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="car-age-manual" className="text-sm font-medium flex items-center gap-2">
                        {t.calculator?.selectCarAge ?? "Car Age Category"}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1"
                              aria-label={t.aria?.ageInfo ?? "Information about car age categories"}
                            >
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <p className="max-w-xs">{t.notes?.ageInfo ?? "Car age affects customs rates. New cars have higher fees but different regulations."}</p>
                          </PopoverContent>
                        </Popover>
                      </Label>
                      <Select value={carAge} onValueChange={setCarAge}>
                        <SelectTrigger
                          className="hover:bg-muted/50 transition-colors min-h-[48px] focus:ring-2 focus:ring-primary/20"
                          aria-label={t.aria?.ageSelect ?? "Select car age category"}
                        >
                          <SelectValue placeholder={t.calculator?.selectCarAge ?? "Select car age"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">{t.calculator?.brandNew ?? "Brand New"}</SelectItem>
                          <SelectItem value="less-than-1">{t.calculator?.used ?? "Used"}</SelectItem>
                        </SelectContent>
                      </Select>
                      
                    </div>
                    {/* Auto-calculation enabled; button removed as requested */}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Selected Vehicle Card */}
            <div className="space-y-6">
              {(selectedCarDetails || (entryMode === "manual" && result)) && (
                <div ref={pdfRef} className="result-print">
                <Card
                  className={`border-2 shadow-lg transition-all duration-500 ${
                    highlightCard ? "border-primary bg-primary/5 shadow-primary/20 shadow-xl" : "border-primary/20"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        {entryMode === "search" && selectedCarDetails ? (t.calculator?.selectedVehicle ?? "Selected Vehicle") : (t.calculator?.calculationResults ?? "Calculation Results")}
                      </CardTitle>
                      {result && (
                        <Dialog open={showDetailedBreakdown} onOpenChange={setShowDetailedBreakdown}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-muted/50 transition-colors bg-transparent"
                              aria-label={t.aria?.viewBreakdown ?? "View detailed cost breakdown"}
                            >
                              <Info className="mr-1 h-3 w-3" aria-hidden="true" />
                              {t.calculator?.details ?? "Details"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2" tabIndex={-1}>
                                <Calculator className="h-5 w-5" />
                                {t.calculator?.detailedBreakdown ?? "Detailed Cost Breakdown"}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* Vehicle Information */}
                              <div className="bg-muted/30 rounded-lg p-3">
                                <h4 className="font-semibold text-sm mb-2 text-muted-foreground">{t.calculator?.vehicleInfo ?? "Vehicle Information"}</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div className="flex justify-between">
                                    <span>{t.calculator?.carPrice ?? "Car Price:"}</span>
                                    <span className="font-semibold">
                                      {formatNumber(
                                        entryMode === "search" && selectedCarDetails
                                          ? Number.parseFloat(carPrice)
                                          : Number.parseFloat(manualCarData.price),
                                      )}{" "}
                                      {result.currency === "USD" ? "$" : result.currency === "EUR" ? "€" : (t.currencies?.DZD ?? "DZD")}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{t.calculator?.exchangeRate ?? "Exchange Rate:"}</span>
                                    <span className="font-semibold">1 {result.currency === "USD" ? "$" : result.currency === "EUR" ? "€" : (t.currencies?.DZD ?? "DZD")} = {result.exchangeRate.toFixed(2)} {t.currencies?.DZD ?? "DZD"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{t.calculator?.ageCategory ?? "Age Category:"}</span>
                                    <span className="font-semibold">
                                      {result.ageCategory === "new"
                                        ? (t.calculator?.brandNew ?? "Brand New")
                                        : result.ageCategory === "less-than-1"
                                          ? (t.calculator?.lessThan1 ?? "Less than 1 year")
                                          : result.ageCategory === "less-than-2"
                                            ? (t.calculator?.lessThan2 ?? "Less than 2 years")
                                            : result.ageCategory === "less-than-3"
                                              ? (t.calculator?.lessThan3 ?? "Less than 3 years")
                                              : (t.calculator?.used ?? "Used")}
                                      <span className="text-xs text-muted-foreground ml-1">
                                        ({result.ageCategory === "new" ? (t.calculator?.newCarRatesLabel ?? "New Car Rates") : (t.calculator?.usedCarRatesLabel ?? "Used Car Rates")})
                                      </span>
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{t.calculator?.engineSize ?? "Engine Size:"}</span>
                                    <span className="font-semibold">
                                      {result.engineSizeCC}cc
                                      <span className="text-xs text-muted-foreground ml-1">
                                        ({result.engineSizeCC <= 1800 ? (t.calculator?.engineLeq18 ?? "≤1.8L Engine") : (t.calculator?.engineGt18 ?? ">1.8L Engine")})
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3">
                                <h4 className="font-semibold text-sm mb-2 text-purple-700 dark:text-purple-400">{t.calculator?.dutyRateApplied ?? "Applied Duty Rate"}</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>{t.calculator?.vehicleClass ?? "Vehicle Classification:"}</span>
                                    <span className="font-semibold">
                                      {result.ageCategory === "new" ? (t.calculator?.newCarLabel ?? "New Car") : (t.calculator?.usedCarLabel ?? "Used Car")} + {result.engineSizeCC <= 1800 ? (t.calculator?.engineLeq18 ?? "≤1.8L Engine") : (t.calculator?.engineGt18 ?? ">1.8L Engine")}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{t.calculator?.dutyRateApplied ?? "Duty Rate Applied:"}</span>
                                    <span className="font-semibold text-purple-700 dark:text-purple-400">
                                      {result.ageCategory === "new"
                                        ? result.engineSizeCC <= 1800
                                          ? "40%"
                                          : "141%"
                                        : result.engineSizeCC <= 1800
                                          ? "20%"
                                          : "121%"}
                                    </span>
                                  </div>
                                  <div className="text-xs text-muted-foreground bg-muted/20 rounded p-2">
                                    <strong>{t.calculator?.rateStructure ?? "Rate Structure:"}</strong>
                                    <br />• {t.notes?.rateStructureNew ?? "New cars ≤1.8L: 40% | New cars >1.8L: 141%"}
                                    <br />• {t.notes?.rateStructureUsed ?? "Used cars ≤1.8L: 20% | Used cars >1.8L: 121%"}
                                  </div>
                                </div>
                              </div>

                              {/* Customs Calculation Breakdown */}
                              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                                <h4 className="font-semibold text-sm mb-2 text-blue-700 dark:text-blue-400">{t.calculator?.customsFee ?? "Customs Fee Calculation"}</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>{t.calculator?.carPrice ?? "Car Price:"}</span>
                                    <span className="font-semibold">
                                      {formatNumber(
                                        entryMode === "search" && selectedCarDetails
                                          ? Number.parseFloat(carPrice)
                                          : Number.parseFloat(manualCarData.price),
                                      )}{" "}
                                      {result.currency === "USD" ? "$" : result.currency === "EUR" ? "€" : (t.currencies?.DZD ?? "DZD")}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{t.calculator?.dutyRateApplied ?? "Duty Rate Applied:"}</span>
                                    <span className="font-semibold">
                                      {result.breakdown.typeFactor === 0.4
                                        ? "40%"
                                        : result.breakdown.typeFactor === 1.41
                                          ? "141%"
                                          : result.breakdown.typeFactor === 0.2
                                            ? "20%"
                                            : "121%"}
                                    </span>
                                  </div>
                                  <div className="border-t border-blue-200 dark:border-blue-800 pt-2 flex justify-between font-semibold">
                                    <span>{t.calculator?.customsFee ?? "Customs Fee:"}</span>
                                    <span>{formatNumber(result.customsFee)} {result.currency === "USD" ? "$" : result.currency === "EUR" ? "€" : (t.currencies?.DZD ?? "DZD")}</span>
                                  </div>
                                  <div className="flex justify-between text-muted-foreground">
                                    <span>{t.calculator?.inDzd ?? "In DZD:"}</span>
                                    <span className="font-semibold">{Math.round(result.customsFee * result.exchangeRate).toLocaleString()} {t.currencies?.DZD ?? "DZD"}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Additional Fees */}
                              <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3">
                                <h4 className="font-semibold text-sm mb-2 text-orange-700 dark:text-orange-400">{t.calculator?.additionalFees ?? "Additional Fees"}</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>{t.calculator?.portFee ?? "Port Fee"}: ({result.ageCategory === "new" ? (t.calculator?.newCarLabel ?? "New Car") : (t.calculator?.usedCarLabel ?? "Used Car")}):</span>
                                    <span className="font-semibold">{result.ageCategory === "new" ? "300,000" : "150,000"} {t.currencies?.DZD ?? "DZD"}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Total Summary */}
                              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                <h4 className="font-semibold text-sm mb-3 text-green-700 dark:text-green-400">{t.calculator?.totalCost ?? "Total Import Cost Summary"}</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>{t.calculator?.customsFeeDzd ?? "Customs Fee (DZD):"}</span>
                                    <span className="font-semibold">{formatNumber(Math.round(result.customsFee * result.exchangeRate))} {t.currencies?.DZD ?? "DZD"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{t.calculator?.portFee ?? "Port Fee"}:</span>
                                    <span className="font-semibold">{result.ageCategory === "new" ? "300,000" : "150,000"} {t.currencies?.DZD ?? "DZD"}</span>
                                  </div>
                                  <div className="border-t border-green-200 dark:border-green-800 pt-2 flex justify-between text-lg font-bold text-green-700 dark:text-green-400">
                                    <span>{t.calculator?.totalCost ?? "Total Cost:"}</span>
                                    <span>{result.totalFee.toLocaleString()} {t.currencies?.DZD ?? "DZD"}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-muted/20 rounded-lg p-3">
                                <h4 className="font-semibold text-sm mb-2 text-muted-foreground">{t.notes?.calculationNotes ?? "Calculation Notes"}</h4>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                  <li>• {t.notes?.exchangeAuto ?? "Exchange rates are updated automatically from official sources"}</li>
                                  <li>• {t.notes?.portFeesBullet ?? "Port fees: New cars (300,000 DZD), Used cars (150,000 DZD)"}</li>
                                  <li>• {t.notes?.engineThreshold ?? "Engine size threshold at 1.8L determines duty rate tier"}</li>
                                  <li>• {t.notes?.usedClassificationBullet ?? '"Used" classification applies to cars less than 1-3 years old'}</li>
                                </ul>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedCarDetails && entryMode === "search" ? (
                      <>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">{t.calculator?.labels?.brand ?? "Brand"}</p>
                            <p className="font-semibold">{selectedCarDetails.marque}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{t.calculator?.labels?.model ?? "Model"}</p>
                            <p className="font-semibold">{selectedCarDetails.modele}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{t.calculator?.labels?.year ?? "Year"}</p>
                            <p className="font-semibold">{selectedCarDetails.annee}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{t.calculator?.labels?.engine ?? "Engine"}</p>
                            <p className="font-semibold">{selectedCarDetails.cylindree}cc</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{t.calculator?.labels?.fuel ?? "Fuel"}</p>
                            <p className="font-semibold">{selectedCarDetails.energie}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{t.calculator?.labels?.origin ?? "Origin"}</p>
                            <p className="font-semibold">{selectedCarDetails.paysOrigine}</p>
                          </div>
                        </div>
                      </>
                    ) : entryMode === "manual" && result ? (
                      <>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">{t.calculator?.labels?.entryMode ?? "Entry Mode"}</p>
                            <p className="font-semibold">{t.calculator?.manualEntry ?? "Manual Entry"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{t.calculator?.labels?.engineSize ?? "Engine Size"}</p>
                            <p className="font-semibold">{result.engineSizeCC}cc</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{t.calculator?.labels?.carAge ?? "Car Age"}</p>
                            <p className="font-semibold">
                              {carAge === "new"
                                ? (t.calculator?.labels?.new ?? "New")
                                : carAge === "1"
                                  ? (t.calculator?.labels?.oneYear ?? "1 Year")
                                  : carAge === "2"
                                    ? (t.calculator?.labels?.twoYears ?? "2 Years")
                                    : (t.calculator?.labels?.threePlusYears ?? "3+ Years")}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{t.calculator?.labels?.currency ?? "Currency"}</p>
                            <p className="font-semibold">{manualCurrency}</p>
                          </div>
                        </div>
                      </>
                    ) : null}

                    {result && (
                      <div className={selectedCarDetails ? "pt-3 border-t border-border" : ""}>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">{t.calculator?.carPrice ?? "Car Price:"}</span>
                            <span className="font-semibold">
                              {formatNumber(
                                entryMode === "search" && selectedCarDetails
                                  ? Number.parseFloat(carPrice)
                                  : Number.parseFloat(manualCarData.price),
                              )}{" "}
                              {result.currency === "USD" ? "$" : result.currency === "EUR" ? "€" : (t.currencies?.DZD ?? "DZD")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <h4 className="font-semibold text-green-700 dark:text-green-400 text-sm">{t.calculator?.importCostCalculation ?? "Import Cost Calculation"}</h4>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 text-center">
                              <p className="text-xs text-muted-foreground">{t.calculator?.labels?.customsShort ?? "Customs"}</p>
                              <p className="text-sm font-bold text-blue-700 dark:text-blue-400">
                                {Math.round(result.customsFee * result.exchangeRate).toLocaleString()} DZD
                              </p>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-2 text-center">
                              <p className="text-xs text-muted-foreground">{t.calculator?.portFee ?? "Port Fee"}</p>
                              <p className="text-sm font-bold text-orange-700 dark:text-orange-400">
                                {result.ageCategory === "new" ? "300K" : "150K"} DZD
                              </p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-2 text-center">
                              <p className="text-xs text-muted-foreground">{t.calculator?.labels?.totalShort ?? "Total"}</p>
                              <p className="text-sm font-bold text-green-700 dark:text-green-400">
                                {result.totalFee.toLocaleString()} DZD
                              </p>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted-foreground">{t.calculator?.labels?.totalImportCost ?? "Total Import Cost"}</p>
                            <p className="text-xl font-bold text-green-700 dark:text-green-400">
                              {result.totalFee.toLocaleString()} DZD
                            </p>
                            <p className="text-xs text-muted-foreground">{t.calculator?.labels?.inclTaxes ?? "Including all taxes and fees"}</p>
                          </div>

                          <div className="flex gap-2 mt-3">
                            <Button
                              onClick={exportToPDF}
                              variant="outline"
                              size="sm"
                              className="flex-1 hover:bg-muted/50 transition-colors bg-transparent"
                            >
                              <FileText className="mr-1 h-3 w-3" />
                              {t.actions?.exportPDF ?? "Export PDF"}
                            </Button>
                            <Button
                              onClick={shareCalculation}
                              variant="outline"
                              size="sm"
                              className="flex-1 hover:bg-muted/50 transition-colors bg-transparent"
                            >
                              <Share2 className="mr-1 h-3 w-3" />
                              {t.common?.share ?? "Share"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                </div>
              )}

              {result && (
                <div
                  ref={breakdownRef}
                  className="print-only"
                  style={{ display: "none" }}
                >
                  <div className="max-w-2xl mx-auto mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">{t.calculator?.detailedBreakdown ?? "Detailed Cost Breakdown"}</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-muted/30 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground">{t.calculator?.vehicleInfo ?? "Vehicle Information"}</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex justify-between">
                            <span>{t.calculator?.carPrice ?? "Car Price:"}</span>
                            <span className="font-semibold">
                              {formatNumber(
                                entryMode === "search" && selectedCarDetails
                                  ? Number.parseFloat(carPrice)
                                  : Number.parseFloat(manualCarData.price),
                              )}{" "}
                              {result.currency === "USD" ? "$" : result.currency === "EUR" ? "€" : (t.currencies?.DZD ?? "DZD")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t.calculator?.exchangeRate ?? "Exchange Rate:"}</span>
                            <span className="font-semibold">1 {result.currency === "USD" ? "$" : result.currency === "EUR" ? "€" : (t.currencies?.DZD ?? "DZD")} = {result.exchangeRate.toFixed(2)} {t.currencies?.DZD ?? "DZD"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t.calculator?.ageCategory ?? "Age Category:"}</span>
                            <span className="font-semibold">
                              {result.ageCategory === "new"
                                ? "Brand New"
                                : result.ageCategory === "less-than-1"
                                  ? "Less than 1 year"
                                  : result.ageCategory === "less-than-2"
                                    ? "Less than 2 years"
                                    : result.ageCategory === "less-than-3"
                                      ? "Less than 3 years"
                                      : "Used"}
                              <span className="text-xs text-muted-foreground ml-1">
                                ({result.ageCategory === "new" ? "New Car Rates" : "Used Car Rates"})
                              </span>
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t.calculator?.engineSize ?? "Engine Size:"}</span>
                            <span className="font-semibold">
                              {result.engineSizeCC}cc
                              <span className="text-xs text-muted-foreground ml-1">
                                ({result.engineSizeCC <= 1800 ? "≤1.8L" : ">1.8L"})
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2 text-purple-700 dark:text-purple-400">{t.calculator?.dutyRateApplied ?? "Applied Duty Rate"}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>{t.calculator?.vehicleClass ?? "Vehicle Classification:"}</span>
                            <span className="font-semibold">
                              {result.ageCategory === "new" ? (t.calculator?.newCarLabel ?? "New Car") : (t.calculator?.usedCarLabel ?? "Used Car")} + {result.engineSizeCC <= 1800 ? (t.calculator?.engineLeq18 ?? "≤1.8L Engine") : (t.calculator?.engineGt18 ?? ">1.8L Engine")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t.calculator?.dutyRateApplied ?? "Duty Rate Applied:"}</span>
                            <span className="font-semibold text-purple-700 dark:text-purple-400">
                              {result.ageCategory === "new"
                                ? result.engineSizeCC <= 1800
                                  ? "40%"
                                  : "141%"
                                : result.engineSizeCC <= 1800
                                  ? "20%"
                                  : "121%"}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground bg-muted/20 rounded p-2">
                            <strong>{t.calculator?.rateStructure ?? "Rate Structure:"}</strong>
                            <br />• {t.notes?.rateStructureNew ?? "New cars ≤1.8L: 40% | New cars >1.8L: 141%"}
                            <br />• {t.notes?.rateStructureUsed ?? "Used cars ≤1.8L: 20% | Used cars >1.8L: 121%"}
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2 text-blue-700 dark:text-blue-400">{t.calculator?.customsFee ?? "Customs Fee Calculation"}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>{t.calculator?.carPrice ?? "Car Price:"}</span>
                            <span className="font-semibold">
                              {formatNumber(
                                entryMode === "search" && selectedCarDetails
                                  ? Number.parseFloat(carPrice)
                                  : Number.parseFloat(manualCarData.price),
                              )}{" "}
                              {result.currency === "USD" ? "$" : result.currency === "EUR" ? "€" : (t.currencies?.DZD ?? "DZD")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t.calculator?.dutyRateApplied ?? "Duty Rate Applied:"}</span>
                            <span className="font-semibold">
                              {result.breakdown.typeFactor === 0.4
                                ? "40%"
                                : result.breakdown.typeFactor === 1.41
                                  ? "141%"
                                  : result.breakdown.typeFactor === 0.2
                                    ? "20%"
                                    : "121%"}
                            </span>
                          </div>
                          <div className="border-t border-blue-200 dark:border-blue-800 pt-2 flex justify-between font-semibold">
                            <span>{t.calculator?.customsFee ?? "Customs Fee:"}</span>
                            <span>{formatNumber(result.customsFee)} {result.currency === "USD" ? "$" : result.currency === "EUR" ? "€" : (t.currencies?.DZD ?? "DZD")}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>{t.calculator?.inDzd ?? "In DZD:"}</span>
                            <span className="font-semibold">{Math.round(result.customsFee * result.exchangeRate).toLocaleString()} {t.currencies?.DZD ?? "DZD"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2 text-orange-700 dark:text-orange-400">{t.calculator?.additionalFees ?? "Additional Fees"}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>{t.calculator?.portFee ?? "Port Fee"}: ({result.ageCategory === "new" ? (t.calculator?.newCarLabel ?? "New Car") : (t.calculator?.usedCarLabel ?? "Used Car")}):</span>
                            <span className="font-semibold">{result.ageCategory === "new" ? "300,000" : "150,000"} {t.currencies?.DZD ?? "DZD"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <h4 className="font-semibold text-sm mb-3 text-green-700 dark:text-green-400">{t.calculator?.totalCost ?? "Total Import Cost Summary"}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>{t.calculator?.customsFeeDzd ?? "Customs Fee (DZD):"}</span>
                            <span className="font-semibold">{formatNumber(Math.round(result.customsFee * result.exchangeRate))} {t.currencies?.DZD ?? "DZD"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t.calculator?.portFee ?? "Port Fee"}:</span>
                            <span className="font-semibold">{result.ageCategory === "new" ? "300,000" : "150,000"} {t.currencies?.DZD ?? "DZD"}</span>
                          </div>
                          <div className="border-t border-green-200 dark:border-green-800 pt-2 flex justify-between text-lg font-bold text-green-700 dark:text-green-400">
                            <span>{t.calculator?.totalCost ?? "Total Cost:"}</span>
                            <span>{result.totalFee.toLocaleString()} {t.currencies?.DZD ?? "DZD"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/20 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground">{t.notes?.calculationNotes ?? "Calculation Notes"}</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• {t.notes?.exchangeAuto ?? "Exchange rates are updated automatically from official sources"}</li>
                          <li>• {t.notes?.portFeesBullet ?? "Port fees: New cars (300,000 DZD), Used cars (150,000 DZD)"}</li>
                          <li>• {t.notes?.engineThreshold ?? "Engine size threshold at 1.8L determines duty rate tier"}</li>
                          <li>• {t.notes?.usedClassificationBullet ?? '"Used" classification applies to cars less than 1-3 years old'}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {!result && (
                  <>
                    <Alert className={`hover:bg-muted/30 transition-colors ${language === "ar" ? "border-r-4 border-r-amber-500" : "border-l-4 border-l-amber-500"} bg-amber-50/50 dark:bg-amber-950/20`}>
                      <Info className="h-4 w-4 text-amber-600" aria-hidden="true" />
                      <AlertDescription className="text-sm leading-relaxed">
                        <strong className="text-amber-800 dark:text-amber-200">{t.notes?.important ?? "Important:"}</strong> {t.notes?.estimatesDisclaimer ?? "These calculations are estimates based on standard rates. Actual fees may vary depending on specific vehicle characteristics, current regulations, and exchange rate fluctuations. Please consult with Algerian customs authorities for official calculations."}
                      </AlertDescription>
                    </Alert>

                    <Card className={`hover:shadow-md transition-all duration-300 ${language === "ar" ? "border-r-4 border-r-blue-500" : "border-l-4 border-l-blue-500"}`}>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                          <Info className="h-5 w-5 text-blue-600" aria-hidden="true" />
                          {t.notes?.howItWorks ?? "How It Works"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                        <div className="flex gap-3 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50">
                          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">1</span>
                          </div>
                          <p className="leading-relaxed">{t.notes?.step1 ?? "The car's age category determines if it's treated as new (Brand New) or used (Less than 1-3 years)"}</p>
                        </div>
                        <div className="flex gap-3 p-3 rounded-lg bg-green-50/50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/50">
                          <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-green-700 dark:text-green-300">2</span>
                          </div>
                          <p className="leading-relaxed" dangerouslySetInnerHTML={{ __html: (t.notes?.step2 ?? "New cars: 40% (≤1.8L) or 141% (>1.8L) + 300,000 DZD port fee<br />Used cars: 20% (≤1.8L) or 121% (>1.8L) + 150,000 DZD port fee").replace(/\n/g, "<br />") }} />
                        </div>
                        <div className="flex gap-3 p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/50">
                          <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-purple-700 dark:text-purple-300">3</span>
                          </div>
                          <p className="leading-relaxed">{t.notes?.step3 ?? "The customs duty is calculated as: (Car Price × Rate) + Port Fee"}</p>
                        </div>
                        <div className="flex gap-3 p-3 rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-800/50">
                          <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-orange-700 dark:text-orange-300">4</span>
                          </div>
                          <p className="leading-relaxed">{t.notes?.step4 ?? "The final amount is converted to Algerian Dinars using the current exchange rate"}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </TooltipProvider>

      

      <footer className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-muted-foreground px-2 py-4 border-t border-border/50">
        <p className="leading-relaxed">
          {t.notes?.footerLead ?? "For official information, visit the"} {" "}
          <a
            href="#"
            className="text-primary hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1"
            aria-label={t.aria?.visitAuthority ?? "Visit Algerian Customs Authority website"}
          >
            {t.notes?.footerAuthority ?? "Algerian Customs Authority"}
          </a>{" "}
          {t.notes?.footerTail ?? "or contact your local customs office."}
        </p>
      </footer>
    </div>
  )
}

export { CustomsCalculator }
