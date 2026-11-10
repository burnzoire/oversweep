---
short: Units and conversions
tables:
  - id: conversion-factors
    title: Conversion factors
    caption: "Multiply a value in the first unit by the factor to get the second. Factors marked exact are definitions; the reverse factors are their reciprocals, rounded here. The mile is the statute mile; the nautical mile is the international one, exactly 1,852 m."
    source: 1
    pages: "Table 8, p. 10; App. B.8, pp. 48–53"
    groupBy: quantity
    columns:
      - { key: quantity, label: Quantity }
      - { key: from, label: From }
      - { key: to, label: To }
      - { key: factor, label: Multiply by, code: true }
      - { key: note, label: Note }
    rows:
      - { quantity: Distance, from: "Nautical miles (NM)", to: "Kilometres (km)", factor: "1.852", note: Exact }
      - { quantity: Distance, from: "Kilometres", to: "Nautical miles", factor: "0.539 957", note: Reciprocal }
      - { quantity: Distance, from: "Nautical miles", to: "Statute miles (mi)", factor: "1.150 779", note: "From 1,852 m ÷ 1,609.344 m" }
      - { quantity: Distance, from: "Statute miles", to: "Nautical miles", factor: "0.868 976", note: Reciprocal }
      - { quantity: Distance, from: "Statute miles", to: "Kilometres", factor: "1.609 344", note: Exact }
      - { quantity: Height, from: "Feet (ft)", to: "Metres (m)", factor: "0.3048", note: Exact }
      - { quantity: Height, from: "Metres", to: "Feet", factor: "3.280 840", note: Reciprocal }
      - { quantity: Speed, from: "Knots (kt)", to: "Kilometres per hour (km/h)", factor: "1.852", note: "Exact: 1 kt is 1 NM per hour" }
      - { quantity: Speed, from: "Knots", to: "Metres per second (m/s)", factor: "0.514 444", note: "1,852 ÷ 3,600" }
      - { quantity: Speed, from: "Knots", to: "Miles per hour (mph)", factor: "1.150 779", note: "As for distance" }
      - { quantity: Speed, from: "Miles per hour", to: "Kilometres per hour", factor: "1.609 344", note: Exact }
      - { quantity: Speed, from: "Feet per minute (ft/min)", to: "Metres per second", factor: "0.005 08", note: Exact }
      - { quantity: Pressure, from: "Inches of mercury (inHg)", to: "Hectopascals (hPa)", factor: "33.863 89", note: "1 hPa is 1 millibar" }
      - { quantity: Pressure, from: "Hectopascals or millibars", to: "Inches of mercury", factor: "0.029 530", note: Reciprocal }
      - { quantity: Mass, from: "Pounds (lb)", to: "Kilograms (kg)", factor: "0.453 592 4", note: "Avoirdupois pound" }
      - { quantity: Mass, from: "Kilograms", to: "Pounds", factor: "2.204 622", note: Reciprocal }
      - { quantity: Volume, from: "US gallons (gal)", to: "Litres (L)", factor: "3.785 412", note: null }
      - { quantity: Volume, from: "Litres", to: "US gallons", factor: "0.264 172", note: Reciprocal }
      - { quantity: Volume, from: "Imperial gallons", to: "Litres", factor: "4.546 09", note: "UK and Canadian gallon" }
      - { quantity: Temperature, from: "Degrees Fahrenheit (°F)", to: "Degrees Celsius (°C)", factor: "(°F − 32) ÷ 1.8", note: "A formula, not a factor" }
      - { quantity: Temperature, from: "Degrees Celsius", to: "Degrees Fahrenheit", factor: "°C × 1.8 + 32", note: Its inverse }
  - id: fuel-weights
    title: Standard weights of fuel, oil and water
    caption: "Pounds per US gallon at two temperatures. Fuel gets lighter as it warms, so the same tankful weighs less on a hot day. Use the aircraft's own figures where its flight manual gives them, and actual weights where they are known."
    source: 2
    pages: "p. 3-4, Figure 3-4"
    columns:
      - { key: fluid, label: Fluid }
      - { key: f32, label: "lb per US gal at 32 °F (0 °C)" }
      - { key: f59, label: "lb per US gal at 59 °F (15 °C)" }
    rows:
      - { fluid: "Aviation gasoline (AVGAS)", f32: "6.14", f59: "6.01" }
      - { fluid: "Jet A and Jet A-1", f32: "6.75", f59: "6.68" }
      - { fluid: Water, f32: "8.35", f59: "8.33" }
      - { fluid: Oil, f32: "7.50", f59: "7.43" }
sources:
  - n: 1
    title: "NIST Special Publication 811, Guide for the Use of the International System of Units (SI)"
    publisher: "National Institute of Standards and Technology, US Department of Commerce"
    date: "2008 edition"
    url: https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication811e2008.pdf
    accessed: 10 November 2026
    note: "Read by printed page: Table 8, the nautical mile and knot, p. 10; Appendix B.8, factors for units listed alphabetically, pp. 48–53. Reciprocals and the nautical-to-statute ratio are computed from those factors."
  - n: 2
    title: "Aircraft Weight and Balance Handbook (FAA-H-8083-1B)"
    publisher: Federal Aviation Administration
    url: https://www.faa.gov/sites/faa.gov/files/2023-09/Weight_Balance_Handbook.pdf
    accessed: 10 November 2026
    note: "Read p. 3-4, Standard Weights and Figure 3-4. A civil handbook: military fuels are not listed."
---

## About these tables

Aviation mixes unit systems: distance in nautical miles, speed in knots, height in feet or metres, the altimeter setting in inches of mercury or hectopascals, and fuel in pounds, kilograms, gallons or litres. The conversion factors come from the US national standards laboratory's guide to units [[1]](#source-1).

Fuel weight depends on its temperature. The fuel table gives the FAA's standard weights per gallon at two temperatures [[2]](#source-2).
