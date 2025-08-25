// Script to fetch the complete HTML content from the original calculator
async function fetchOriginalCalculator() {
  try {
    const response = await fetch(
      "https://www-carvoyage-info.filesusr.com/html/8880f9_433d93e07c5335b380d5c114fa68208f.html",
    )
    const html = await response.text()

    console.log("=== COMPLETE HTML CONTENT ===")
    console.log(html)

    // Extract JavaScript code
    const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi)
    if (scriptMatches) {
      console.log("\n=== JAVASCRIPT CODE ===")
      scriptMatches.forEach((script, index) => {
        console.log(`Script ${index + 1}:`)
        console.log(script)
        console.log("---")
      })
    }

    // Look for calculation functions
    const calcFunctionMatch = html.match(/function\s+calculate[^{]*{[^}]*}/gi)
    if (calcFunctionMatch) {
      console.log("\n=== CALCULATION FUNCTIONS ===")
      calcFunctionMatch.forEach((func) => {
        console.log(func)
      })
    }
  } catch (error) {
    console.error("Error fetching original calculator:", error)
  }
}

fetchOriginalCalculator()
