export type SupportedLanguage = "en" | "fr" | "ar"

type Dictionary = {
  theme: {
    light: string
    dark: string
    system: string
  }
  language: {
    english: string
    french: string
    arabic: string
    label: string
  }
  actions: {
    toggleTheme: string
    exportPDF?: string
  }
  currencies?: {
    USD: string
    EUR: string
    DZD: string
  }
  common?: {
    search: string
    reset: string
    history: string
    clearAll: string
    load: string
    share: string
    delete: string
    retrying: string
    retry: string
    updated: string
  }
  calculator?: {
    appTitle: string
    tagline: string
    searchDatabaseTitle: string
    searchDatabaseDescription: string
    searchCarModel: string
    searchPlaceholder: string
    searchPlaceholderLoading: string
    selectCarAge: string
    selectEngineSize: string
    brandNew: string
    lessThan1: string
    lessThan2: string
    lessThan3: string
    used: string
    currentRates: string
    manualEntry: string
    searchDatabase: string
    calculationHistory: string
    recentCalculations: string
    noCalculationsYet: string
    historyWillAppear: string
    findFromList: string
    usingReferencePrice: string
    details: string
    detailedBreakdown: string
    selectedVehicle: string
    calculationResults: string
    vehicleInfo: string
    carPrice: string
    exchangeRate: string
    ageCategory: string
    engineSize: string
    engineSizeInfo?: string
    vehicleClass: string
    dutyRateApplied: string
    rateStructure: string
    importCostCalculation?: string
    customsFee: string
    inDzd: string
    customsFeeDzd: string
    portFee: string
    totalCost: string
    additionalFees: string
    newCarLabel: string
    usedCarLabel: string
    newCarRatesLabel: string
    usedCarRatesLabel: string
    engineLeq18: string
    engineGt18: string
    labels?: {
      brand: string
      model: string
      year: string
      engine: string
      fuel: string
      origin: string
      entryMode: string
      engineSize: string
      currency?: string
      oneYear: string
      totalImportCost: string
      inclTaxes: string
      carAge: string
      new: string
      twoYears: string
      threePlusYears: string
      customsShort: string
      totalShort: string
    }
    manualEntryDescription?: string
    manualEntryHelp?: string
    carPriceLabel?: string
    enterPriceIn?: string
    currentRateLabel?: string
    noCarsFound?: string
  }
  aria?: {
    dbInfo: string
    retryCars: string
    ageInfo: string
    ageSelect: string
    manualInfo: string
    engineInfo: string
    viewBreakdown: string
    visitAuthority: string
  }
  notes?: {
    calculationNotes: string
    important: string
    estimatesDisclaimer: string
    estimatesBullet?: string
    ageInfo: string
    rateStructureNew: string
    rateStructureUsed: string
    howItWorks: string
    step1: string
    step2: string
    step3: string
    step4: string
    exchangeAuto?: string
    portFeesBullet?: string
    engineThreshold?: string
    usedClassificationBullet?: string
    footerLead: string
    footerAuthority: string
    footerTail: string
  }
  toasts?: {
    carDbLoadedTitle: string
    carDbLoadedDescPrefix: string
    vehiclesNoun: string
    carDbErrorTitle: string
    carDbErrorDesc: string
    ratesUpdatedTitle: string
    ratesUpdatedDesc: string
    ratesFailedTitle: string
    ratesFailedDesc: string
    favAddedTitle: string
    favRemovedTitle: string
    favDesc: string
    linkCopiedTitle: string
    linkCopiedDesc: string
    shareFailedTitle: string
    shareFailedDesc: string
    calcLoadedTitle: string
    calcLoadedDesc: string
    missingInfoTitle: string
    missingInfoDesc: string
    invalidPriceTitle: string
    invalidPriceDesc: string
    historyClearedTitle: string
    historyClearedDesc: string
    entryDeletedTitle: string
    entryDeletedDesc: string
    exportedTitle: string
    exportedDesc: string
    nothingToExportTitle: string
    nothingToExportDesc: string
    printFailedTitle: string
    printFailedDesc: string
    linkCopiedToClipboardTitle: string
    linkCopiedToClipboardDesc: string
  }
}

export const dictionaries: Record<SupportedLanguage, Dictionary> = {
  en: {
    theme: { light: "Light", dark: "Dark", system: "System" },
    language: { english: "English", french: "French", arabic: "Arabic", label: "Language" },
    actions: { toggleTheme: "Toggle theme", exportPDF: "Export PDF" },
    currencies: { USD: "USD", EUR: "EUR", DZD: "DZD" },
    common: {
      search: "Search",
      reset: "Reset",
      history: "History",
      clearAll: "Clear All",
      load: "Load",
      share: "Share",
      delete: "Delete",
      retrying: "Retrying...",
      retry: "Retry",
      updated: "Updated:",
    },
    calculator: {
      appTitle: "Car Import Customs Calculator",
      tagline: "Calculate customs fees and taxes for importing vehicles into Algeria. Get accurate estimates based on current regulations and exchange rates.",
      searchDatabaseTitle: "Search Official Car Database",
      searchDatabaseDescription: "Search from the official Algerian customs reference database with pre-approved prices and",
      searchCarModel: "Search Car Model",
      searchPlaceholder: "Search by brand, model, or engine...",
      searchPlaceholderLoading: "Loading cars...",
      selectCarAge: "Select car age",
      selectEngineSize: "Select engine size",
      brandNew: "Brand New",
      lessThan1: "Less than 1 year",
      lessThan2: "Less than 2 years",
      lessThan3: "Less than 3 years",
      used: "Used",
      currentRates: "Current Rates:",
      manualEntry: "Manual Entry",
      searchDatabase: "Search Database",
      calculationHistory: "Calculation History",
      recentCalculations: "Your recent customs fee calculations",
      noCalculationsYet: "No calculations yet",
      historyWillAppear: "Your calculation history will appear here",
      findFromList: "Find your car from the official Algerian customs reference list",
      usingReferencePrice: "Using official Algerian customs reference price for the selected vehicle.",
      details: "Details",
      detailedBreakdown: "Detailed Cost Breakdown",
      selectedVehicle: "Selected Vehicle",
      calculationResults: "Calculation Results",
      vehicleInfo: "Vehicle Information",
      carPrice: "Car Price:",
      exchangeRate: "Exchange Rate:",
      ageCategory: "Age Category:",
      engineSize: "Engine Size:",
      engineSizeInfo: "Engine displacement in cubic centimeters affects customs calculations.",
      vehicleClass: "Vehicle Classification:",
      dutyRateApplied: "Duty Rate Applied:",
      rateStructure: "Rate Structure:",
      importCostCalculation: "Import Cost Calculation",
      customsFee: "Customs Fee:",
      inDzd: "In DZD:",
      customsFeeDzd: "Customs Fee (DZD):",
      portFee: "Port Fee",
      totalCost: "Total Cost:",
      additionalFees: "Additional Fees",
      newCarLabel: "New Car",
      usedCarLabel: "Used Car",
      newCarRatesLabel: "New Car Rates",
      usedCarRatesLabel: "Used Car Rates",
      engineLeq18: "≤1.8L Engine",
      engineGt18: ">1.8L Engine",
      labels: {
        brand: "Brand",
        model: "Model",
        year: "Year",
        engine: "Engine",
        fuel: "Fuel",
        origin: "Origin",
        entryMode: "Entry Mode",
        engineSize: "Engine Size",
        currency: "Currency",
        oneYear: "1 Year",
        totalImportCost: "Total Import Cost",
        inclTaxes: "Including all taxes and fees",
        carAge: "Car Age",
        new: "New",
        twoYears: "2 Years",
        threePlusYears: "3+ Years",
        customsShort: "Customs",
        totalShort: "Total",
      },
      manualEntryDescription: "Enter your vehicle details manually if not found in the database",
      manualEntryHelp: "Use this if your car is not found in the official database or if you want to calculate with a different price.",
      carPriceLabel: "Car Price",
      enterPriceIn: "Enter price in ",
      currentRateLabel: "Current rate:",
      noCarsFound: "No cars found matching",
    },
    aria: {
      dbInfo: "Information about car database",
      retryCars: "Retry loading car data",
      ageInfo: "Information about car age categories",
      ageSelect: "Select car age category",
      manualInfo: "Information about manual entry",
      engineInfo: "Information about engine size",
      viewBreakdown: "View detailed cost breakdown",
      visitAuthority: "Visit Algerian Customs Authority website",
    },
    notes: {
      calculationNotes: "Calculation Notes",
      important: "Important:",
      estimatesDisclaimer: "These calculations are estimates based on standard rates. Actual fees may vary depending on specific vehicle characteristics, current regulations, and exchange rate fluctuations. Please consult with Algerian customs authorities for official calculations.",
      estimatesBullet: "All calculations are estimates and may vary from actual customs fees",
      ageInfo: "Car age affects customs rates. New cars have higher fees but different regulations.",
      rateStructureNew: "New cars ≤1.8L: 40% | New cars >1.8L: 141%",
      rateStructureUsed: "Used cars ≤1.8L: 20% | Used cars >1.8L: 121%",
      howItWorks: "How It Works",
      step1: "The car's age category determines if it's treated as new (Brand New) or used (Less than 1-3 years)",
      step2: "New cars: 40% (≤1.8L) or 141% (>1.8L) + 300,000 DZD port fee\nUsed cars: 20% (≤1.8L) or 121% (>1.8L) + 150,000 DZD port fee",
      step3: "The customs duty is calculated as: (Car Price × Rate) + Port Fee",
      step4: "The final amount is converted to Algerian Dinars using the current exchange rate",
      exchangeAuto: "Exchange rates are updated automatically from official sources",
      portFeesBullet: "Port fees: New cars (300,000 DZD), Used cars (150,000 DZD)",
      engineThreshold: "Engine size threshold at 1.8L determines duty rate tier",
      usedClassificationBullet: '"Used" classification applies to cars less than 1-3 years old',
      footerLead: "For official information, visit the",
      footerAuthority: "Algerian Customs Authority",
      footerTail: "or contact your local customs office.",
    },
    toasts: {
      carDbLoadedTitle: "Car database loaded",
      carDbLoadedDescPrefix: "Successfully loaded",
      vehiclesNoun: "vehicles",
      carDbErrorTitle: "Error loading car database",
      carDbErrorDesc: "Please check your connection and try again",
      ratesUpdatedTitle: "Exchange rates updated",
      ratesUpdatedDesc: "Latest rates have been fetched successfully",
      ratesFailedTitle: "Failed to update exchange rates",
      ratesFailedDesc: "Using default rates. Please try again later.",
      favAddedTitle: "Added to favorites",
      favRemovedTitle: "Removed from favorites",
      favDesc: "Your favorite calculations are saved locally",
      linkCopiedTitle: "Link copied",
      linkCopiedDesc: "The URL with your inputs has been copied to the clipboard.",
      shareFailedTitle: "Share failed",
      shareFailedDesc: "Please try again or copy manually",
      calcLoadedTitle: "Calculation loaded",
      calcLoadedDesc: "Previous calculation has been restored",
      missingInfoTitle: "Missing information",
      missingInfoDesc: "Please fill in all required fields",
      invalidPriceTitle: "Invalid price",
      invalidPriceDesc: "Please enter a valid car price",
      historyClearedTitle: "History cleared",
      historyClearedDesc: "All calculation history has been removed",
      entryDeletedTitle: "Entry deleted",
      entryDeletedDesc: "The calculation has been removed from history.",
      exportedTitle: "Calculation exported",
      exportedDesc: "Download started successfully",
      nothingToExportTitle: "Nothing to export",
      nothingToExportDesc: "Please calculate first.",
      printFailedTitle: "Failed to open print dialog",
      printFailedDesc: "Please try again.",
      linkCopiedToClipboardTitle: "Link copied to clipboard",
      linkCopiedToClipboardDesc: "Share this URL to let others see your calculation",
    },
  },
  fr: {
    theme: { light: "Clair", dark: "Sombre", system: "Système" },
    language: { english: "Anglais", french: "Français", arabic: "Arabe", label: "Langue" },
    actions: { toggleTheme: "Changer le thème", exportPDF: "Exporter en PDF" },
    currencies: { USD: "USD", EUR: "EUR", DZD: "DZD" },
    common: {
      search: "Rechercher",
      reset: "Réinitialiser",
      history: "Historique",
      clearAll: "Tout effacer",
      load: "Charger",
      share: "Partager",
      delete: "Supprimer",
      retrying: "Nouvelle tentative...",
      retry: "Réessayer",
      updated: "Mis à jour :",
    },
    calculator: {
      appTitle: "Calculateur des droits de douane à l'importation",
      tagline: "Calculez les droits et taxes pour l'importation de véhicules en Algérie, selon la réglementation et les taux de change en vigueur.",
      searchDatabaseTitle: "Rechercher dans la base officielle des voitures",
      searchDatabaseDescription: "Recherchez dans la référence officielle des douanes algériennes avec des prix pré-approuvés et",
      searchCarModel: "Rechercher un modèle",
      searchPlaceholder: "Marque, modèle ou moteur...",
      searchPlaceholderLoading: "Chargement des voitures...",
      selectCarAge: "Sélectionner l'âge de la voiture",
      selectEngineSize: "Sélectionner la cylindrée",
      brandNew: "Neuve",
      lessThan1: "Moins d'un an",
      lessThan2: "Moins de deux ans",
      lessThan3: "Moins de trois ans",
      used: "Occasion",
      currentRates: "Taux actuels :",
      manualEntry: "Saisie manuelle",
      searchDatabase: "Base de données",
      calculationHistory: "Historique des calculs",
      recentCalculations: "Vos derniers calculs de droits de douane",
      noCalculationsYet: "Aucun calcul pour l'instant",
      historyWillAppear: "Votre historique des calculs apparaîtra ici",
      findFromList: "Trouvez votre voiture dans la liste officielle de référence des douanes algériennes",
      usingReferencePrice: "Utilisation du prix de référence officiel des douanes algériennes pour le véhicule sélectionné.",
      details: "Détails",
      detailedBreakdown: "Détail du coût",
      selectedVehicle: "Véhicule sélectionné",
      calculationResults: "Résultats du calcul",
      vehicleInfo: "Informations sur le véhicule",
      carPrice: "Prix du véhicule :",
      exchangeRate: "Taux de change :",
      ageCategory: "Catégorie d'âge :",
      engineSize: "Cylindrée :",
      engineSizeInfo: "La cylindrée en centimètres cubes influence le calcul des droits.",
      vehicleClass: "Classification du véhicule :",
      dutyRateApplied: "Taux appliqué :",
      rateStructure: "Structure du taux :",
      importCostCalculation: "Calcul du coût d'importation",
      customsFee: "Droit de douane :",
      inDzd: "بالدينار الجزائري:",
      customsFeeDzd: "Droit de douane (DZD) :",
      portFee: "Frais de port",
      totalCost: "Coût total :",
      additionalFees: "Frais supplémentaires",
      newCarLabel: "Voiture neuve",
      usedCarLabel: "Voiture d'occasion",
      newCarRatesLabel: "Taux voiture neuve",
      usedCarRatesLabel: "Taux voiture d'occasion",
      engineLeq18: "Moteur ≤1,8L",
      engineGt18: "Moteur >1,8L",
      labels: {
        brand: "Marque",
        model: "Modèle",
        year: "Année",
        engine: "Moteur",
        fuel: "Carburant",
        origin: "Origine",
        entryMode: "Mode d'entrée",
        engineSize: "Cylindrée",
        currency: "Devise",
        oneYear: "1 an",
        totalImportCost: "Coût total d'importation",
        inclTaxes: "Incluant toutes taxes et frais",
        carAge: "Âge du véhicule",
        new: "Neuve",
        twoYears: "2 ans",
        threePlusYears: "3+ ans",
        customsShort: "Droits",
        totalShort: "Total",
      },
      manualEntryDescription: "Saisissez manuellement les détails du véhicule s'il est introuvable dans la base",
      manualEntryHelp: "Utilisez ceci si votre véhicule n'est pas dans la base officielle ou si vous souhaitez calculer avec un prix différent.",
      carPriceLabel: "Prix du véhicule",
      enterPriceIn: "Entrez le prix en ",
      currentRateLabel: "Taux actuel :",
      noCarsFound: "Aucune voiture trouvée correspondant à",
      
    },
    aria: {
      dbInfo: "Informations sur la base de données des voitures",
      retryCars: "Réessayer de charger les données",
      ageInfo: "Informations sur les catégories d'âge des voitures",
      ageSelect: "Sélectionner la catégorie d'âge",
      manualInfo: "Informations sur la saisie manuelle",
      engineInfo: "Informations sur la cylindrée",
      viewBreakdown: "Voir le détail des coûts",
      visitAuthority: "Visiter le site de l'administration des douanes algériennes",
    },
    notes: {
      calculationNotes: "Notes de calcul",
      important: "Important :",
      estimatesDisclaimer: "Ces calculs sont des estimations basées sur des taux standards. Les frais réels peuvent varier selon les caractéristiques du véhicule, la réglementation en vigueur et les fluctuations du taux de change. Veuillez consulter l'administration des douanes algériennes pour des calculs officiels.",
      estimatesBullet: "Ces calculs sont des estimations et peuvent différer des frais réels",
      ageInfo: "L'âge du véhicule influence les taux de douane. Les véhicules neufs ont des frais plus élevés et des règles différentes.",
      rateStructureNew: "Voitures neuves ≤1,8L : 40% | >1,8L : 141%",
      rateStructureUsed: "Voitures d'occasion ≤1,8L : 20% | >1,8L : 121%",
      howItWorks: "Comment ça marche",
      step1: "L'âge du véhicule détermine s'il est considéré comme neuf (Neuve) ou d'occasion (moins de 1 à 3 ans)",
      step2: "Neuf : 40% (≤1,8L) ou 141% (>1,8L) + 300 000 DZD de frais de port\nOccasion : 20% (≤1,8L) ou 121% (>1,8L) + 150 000 DZD de frais de port",
      step3: "Le droit de douane se calcule : (Prix du véhicule × Taux) + Frais de port",
      step4: "Le montant final est converti en dinars algériens selon le taux de change actuel",
      exchangeAuto: "Les taux de change sont mis à jour automatiquement à partir de sources officielles",
      portFeesBullet: "Frais de port : Neuf (300 000 DZD), Occasion (150 000 DZD)",
      engineThreshold: "Seuil de cylindrée à 1,8L détermine le palier du taux",
      usedClassificationBullet: 'La classification "Occasion" s\'applique aux véhicules de moins de 1 à 3 ans',
      footerLead: "Pour des informations officielles, visitez",
      footerAuthority: "l'administration des douanes algériennes",
      footerTail: "ou contactez votre bureau de douane local.",
    },
    toasts: {
      carDbLoadedTitle: "Base de données des voitures chargée",
      carDbLoadedDescPrefix: "Chargement réussi de",
      vehiclesNoun: "véhicules",
      carDbErrorTitle: "Erreur de chargement de la base",
      carDbErrorDesc: "Veuillez vérifier votre connexion et réessayer",
      ratesUpdatedTitle: "Taux de change mis à jour",
      ratesUpdatedDesc: "Les derniers taux ont été récupérés avec succès",
      ratesFailedTitle: "Échec de mise à jour des taux",
      ratesFailedDesc: "Utilisation des taux par défaut. Réessayez plus tard.",
      favAddedTitle: "Ajouté aux favoris",
      favRemovedTitle: "Retiré des favoris",
      favDesc: "Vos calculs favoris sont enregistrés localement",
      linkCopiedTitle: "Lien copié",
      linkCopiedDesc: "L'URL avec vos entrées a été copiée dans le presse-papiers.",
      shareFailedTitle: "Échec du partage",
      shareFailedDesc: "Veuillez réessayer ou copier manuellement",
      calcLoadedTitle: "Calcul chargé",
      calcLoadedDesc: "Le calcul précédent a été restauré",
      missingInfoTitle: "Informations manquantes",
      missingInfoDesc: "Veuillez remplir tous les champs requis",
      invalidPriceTitle: "Prix invalide",
      invalidPriceDesc: "Veuillez saisir un prix valide",
      historyClearedTitle: "Historique effacé",
      historyClearedDesc: "Tout l'historique des calculs a été supprimé",
      entryDeletedTitle: "Entrée supprimée",
      entryDeletedDesc: "Le calcul a été supprimé de l'historique.",
      exportedTitle: "Calcul exporté",
      exportedDesc: "Téléchargement démarré avec succès",
      nothingToExportTitle: "Rien à exporter",
      nothingToExportDesc: "Veuillez d'abord effectuer un calcul.",
      printFailedTitle: "Échec d'ouverture de la boîte d'impression",
      printFailedDesc: "Veuillez réessayer.",
      linkCopiedToClipboardTitle: "Lien copié dans le presse-papiers",
      linkCopiedToClipboardDesc: "Partagez cette URL pour permettre de voir votre calcul",
    },
  },
  ar: {
    theme: { light: "فاتح", dark: "داكن", system: "النظام" },
    language: { english: "الإنجليزية", french: "الفرنسية", arabic: "العربية", label: "اللغة" },
    actions: { toggleTheme: "تغيير النمط", exportPDF: "تصدير PDF" },
    currencies: { USD: "دولار", EUR: "يورو", DZD: "دج" },
    common: {
      search: "بحث",
      reset: "إعادة تعيين",
      history: "السجل",
      clearAll: "مسح الكل",
      load: "تحميل",
      share: "مشاركة",
      delete: "حذف",
      retrying: "إعادة المحاولة...",
      retry: "إعادة المحاولة",
      updated: "آخر تحديث:",
    },
    calculator: {
      appTitle: "حاسبة رسوم جمارك السيارات",
      tagline: "احسب رسوم وضرائب استيراد المركبات إلى الجزائر وفق الأنظمة الحالية وأسعار الصرف.",
      searchDatabaseTitle: "البحث في قاعدة السيارات الرسمية",
      searchDatabaseDescription: "ابحث في مرجع الجمارك الجزائري الرسمي مع أسعار معتمدة مسبقًا و",
      searchCarModel: "ابحث عن طراز السيارة",
      searchPlaceholder: "ابحث بالعلامة أو الطراز أو المحرك...",
      searchPlaceholderLoading: "جاري تحميل السيارات...",
      selectCarAge: "اختر عمر السيارة",
      selectEngineSize: "اختر سعة المحرك",
      brandNew: "جديدة",
      lessThan1: "أقل من سنة",
      lessThan2: "أقل من سنتين",
      lessThan3: "أقل من ثلاث سنوات",
      used: "مستعملة",
      currentRates: "الأسعار الحالية:",
      manualEntry: "إدخال يدوي",
      searchDatabase: "قاعدة البيانات",
      calculationHistory: "سجل الحسابات",
      recentCalculations: "أحدث حسابات رسوم الجمارك",
      noCalculationsYet: "لا توجد حسابات بعد",
      historyWillAppear: "سيظهر سجل حساباتك هنا",
      findFromList: "اعثر على سيارتك من القائمة المرجعية الرسمية للجمارك الجزائرية",
      usingReferencePrice: "يتم استخدام السعر المرجعي الرسمي للجمارك الجزائرية للمركبة المحددة.",
      details: "تفاصيل",
      detailedBreakdown: "تفصيل التكلفة",
      selectedVehicle: "المركبة المختارة",
      calculationResults: "نتائج الحساب",
      vehicleInfo: "معلومات المركبة",
      carPrice: "سعر السيارة:",
      exchangeRate: "سعر الصرف:",
      ageCategory: "فئة العمر:",
      engineSize: "سعة المحرك:",
      engineSizeInfo: "إزاحة المحرك بالسنتيمتر المكعب تؤثر على حساب الرسوم الجمركية.",
      vehicleClass: "تصنيف المركبة:",
      dutyRateApplied: "النسبة المطبقة:",
      rateStructure: "هيكل النسبة:",
      importCostCalculation: "حساب تكلفة الاستيراد",
      customsFee: "رسوم الجمارك:",
      inDzd: "بالدينار الجزائري:",
      customsFeeDzd: "رسوم الجمارك (DZD):",
      portFee: "رسوم الميناء",
      totalCost: "التكلفة الإجمالية:",
      additionalFees: "رسوم إضافية",
      newCarLabel: "سيارة جديدة",
      usedCarLabel: "سيارة مستعملة",
      newCarRatesLabel: "نِسَب سيارات جديدة",
      usedCarRatesLabel: "نِسَب سيارات مستعملة",
      engineLeq18: "محرك ≤1.8ل",
      engineGt18: "محرك >1.8ل",
      labels: {
        brand: "العلامة",
        model: "الطراز",
        year: "السنة",
        engine: "المحرك",
        fuel: "الوقود",
        origin: "المنشأ",
        entryMode: "طريقة الإدخال",
        engineSize: "سعة المحرك",
        currency: "العملة",
        oneYear: "سنة واحدة",
        totalImportCost: "التكلفة الإجمالية للاستيراد",
        inclTaxes: "شاملة جميع الضرائب والرسوم",
        carAge: "عمر السيارة",
        new: "جديدة",
        twoYears: "سنتان",
        threePlusYears: "3+ سنوات",
        customsShort: "جمارك",
        totalShort: "الإجمالي",
      },
      manualEntryDescription: "أدخل بيانات مركبتك يدويًا إذا لم يتم العثور عليها في قاعدة البيانات",
      manualEntryHelp: "استخدم هذا الخيار إذا لم تكن سيارتك في القاعدة الرسمية أو إذا أردت الحساب بسعر مختلف.",
      carPriceLabel: "سعر السيارة",
      enterPriceIn: "أدخل السعر بال",
      currentRateLabel: "السعر الحالي:",
      noCarsFound: "لا توجد سيارات مطابقة",
    },
    aria: {
      dbInfo: "معلومات عن قاعدة بيانات السيارات",
      retryCars: "إعادة تحميل بيانات السيارات",
      ageInfo: "معلومات عن فئات عمر السيارات",
      ageSelect: "اختر فئة عمر السيارة",
      manualInfo: "معلومات عن الإدخال اليدوي",
      engineInfo: "معلومات عن سعة المحرك",
      viewBreakdown: "عرض تفاصيل التكلفة",
      visitAuthority: "زيارة موقع إدارة الجمارك الجزائرية",
    },
    notes: {
      calculationNotes: "ملاحظات الحساب",
      important: "مهم:",
      estimatesDisclaimer: "هذه الحسابات تقديرية بناءً على نسب قياسية. قد تختلف الرسوم الفعلية حسب مواصفات المركبة والأنظمة الحالية وتقلّبات سعر الصرف. يُرجى مراجعة إدارة الجمارك الجزائرية للحسابات الرسمية.",
      estimatesBullet: "هذه الحسابات تقديرية وقد تختلف عن الرسوم الفعلية",
      ageInfo: "يؤثر عمر المركبة على نسب الرسوم. السيارات الجديدة أعلى رسوماً ولها أنظمة مختلفة.",
      rateStructureNew: "السيارات الجديدة ≤1.8ل: 40% | >1.8ل: 141%",
      rateStructureUsed: "السيارات المستعملة ≤1.8ل: 20% | >1.8ل: 121%",
      howItWorks: "كيف تعمل",
      step1: "يحدد عمر المركبة ما إذا كانت تُعامل كجديدة أو مستعملة (أقل من 1-3 سنوات)",
      step2: "الجديدة: 40% (≤1.8ل) أو 141% (>1.8ل) + 300,000 دج رسوم الميناء\nالمستعملة: 20% (≤1.8ل) أو 121% (>1.8ل) + 150,000 دج رسوم الميناء",
      step3: "يُحسب الرسم: (سعر السيارة × النسبة) + رسوم الميناء",
      step4: "يتم تحويل المبلغ النهائي إلى الدينار الجزائري حسب سعر الصرف الحالي",
      exchangeAuto: "يتم تحديث أسعار الصرف تلقائيًا من مصادر رسمية",
      portFeesBullet: "رسوم الميناء: الجديدة (300,000 دج)، المستعملة (150,000 دج)",
      engineThreshold: "حد سعة المحرك عند 1.8ل يحدد شريحة النسبة",
      usedClassificationBullet: "تصنيف \"مستعملة\" ينطبق على السيارات أقل من 1-3 سنوات",
      footerLead: "للحصول على معلومات رسمية، قم بزيارة",
      footerAuthority: "المديرية العامة للجمارك الجزائرية",
      footerTail: "أو تواصل مع مكتب الجمارك المحلي.",
    },
    toasts: {
      carDbLoadedTitle: "تم تحميل قاعدة بيانات السيارات",
      carDbLoadedDescPrefix: "تم تحميل",
      vehiclesNoun: "سيارات",
      carDbErrorTitle: "فشل تحميل قاعدة البيانات",
      carDbErrorDesc: "يرجى التحقق من الاتصال والمحاولة مرة أخرى",
      ratesUpdatedTitle: "تم تحديث أسعار الصرف",
      ratesUpdatedDesc: "تم جلب آخر الأسعار بنجاح",
      ratesFailedTitle: "فشل تحديث أسعار الصرف",
      ratesFailedDesc: "سيتم استخدام الأسعار الافتراضية. يرجى المحاولة لاحقاً.",
      favAddedTitle: "تمت الإضافة إلى المفضلة",
      favRemovedTitle: "تمت الإزالة من المفضلة",
      favDesc: "يتم حفظ حساباتك المفضلة محلياً",
      linkCopiedTitle: "تم نسخ الرابط",
      linkCopiedDesc: "تم نسخ الرابط مع مدخلاتك إلى الحافظة.",
      shareFailedTitle: "فشل المشاركة",
      shareFailedDesc: "يرجى المحاولة مرة أخرى أو النسخ يدوياً",
      calcLoadedTitle: "تم تحميل الحساب",
      calcLoadedDesc: "تمت استعادة الحساب السابق",
      missingInfoTitle: "معلومات ناقصة",
      missingInfoDesc: "يرجى ملء جميع الحقول المطلوبة",
      invalidPriceTitle: "سعر غير صالح",
      invalidPriceDesc: "يرجى إدخال سعر صالح",
      historyClearedTitle: "تم مسح السجل",
      historyClearedDesc: "تم حذف جميع سجلات الحساب",
      entryDeletedTitle: "تم حذف الإدخال",
      entryDeletedDesc: "تمت إزالة الحساب من السجل.",
      exportedTitle: "تم تصدير الحساب",
      exportedDesc: "تم بدء التنزيل بنجاح",
      nothingToExportTitle: "لا يوجد ما يتم تصديره",
      nothingToExportDesc: "يرجى الحساب أولاً.",
      printFailedTitle: "فشل فتح نافذة الطباعة",
      printFailedDesc: "يرجى المحاولة مرة أخرى.",
      linkCopiedToClipboardTitle: "تم نسخ الرابط إلى الحافظة",
      linkCopiedToClipboardDesc: "شارك هذا الرابط ليتمكن الآخرون من رؤية حسابك",
    },
  },
}

export function isRightToLeft(language: SupportedLanguage): boolean {
  return language === "ar"
}

export const DEFAULT_LANGUAGE: SupportedLanguage = "en"


