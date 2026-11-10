---
short: Standard atmosphere
tables:
  - id: standard-atmosphere
    title: ICAO standard atmosphere by altitude
    caption: "Density ratio σ, its square root, pressure ratio δ, temperature, temperature ratio θ and the speed of sound in the standard atmosphere. Temperature falls at a constant rate up to the tropopause at 36,089 ft and is constant above it to 80,000 ft. The °C and inHg columns are converted here from the source's °F and δ, using 29.92 inHg at sea level."
    source: 1
    pages: "Figure 1.1, p. 5; pp. 2, 4"
    columns:
      - { key: alt, label: Altitude (ft) }
      - { key: sigma, label: Density ratio σ, code: true }
      - { key: root, label: "√σ", code: true }
      - { key: delta, label: Pressure ratio δ, code: true }
      - { key: inhg, label: Pressure (inHg), code: true }
      - { key: tf, label: "Temperature (°F)", code: true }
      - { key: tc, label: "Temperature (°C)", code: true }
      - { key: theta, label: Temperature ratio θ, code: true }
      - { key: a, label: Speed of sound (kt), code: true }
    rows:
      - { alt: "0", sigma: "1.0000", root: "1.0000", delta: "1.0000", inhg: "29.92", tf: "59.00", tc: "15.0", theta: "1.0000", a: "661.7" }
      - { alt: "1,000", sigma: "0.9711", root: "0.9854", delta: "0.9644", inhg: "28.85", tf: "55.43", tc: "13.0", theta: "0.9931", a: "659.5" }
      - { alt: "2,000", sigma: "0.9428", root: "0.9710", delta: "0.9298", inhg: "27.82", tf: "51.87", tc: "11.0", theta: "0.9862", a: "657.2" }
      - { alt: "3,000", sigma: "0.9151", root: "0.9566", delta: "0.8962", inhg: "26.81", tf: "48.30", tc: "9.1", theta: "0.9794", a: "654.9" }
      - { alt: "4,000", sigma: "0.8881", root: "0.9424", delta: "0.8637", inhg: "25.84", tf: "44.74", tc: "7.1", theta: "0.9725", a: "652.6" }
      - { alt: "5,000", sigma: "0.8617", root: "0.9283", delta: "0.8320", inhg: "24.89", tf: "41.17", tc: "5.1", theta: "0.9656", a: "650.3" }
      - { alt: "6,000", sigma: "0.8359", root: "0.9143", delta: "0.8014", inhg: "23.98", tf: "37.60", tc: "3.1", theta: "0.9587", a: "647.9" }
      - { alt: "7,000", sigma: "0.8106", root: "0.9004", delta: "0.7716", inhg: "23.09", tf: "34.04", tc: "1.1", theta: "0.9519", a: "645.6" }
      - { alt: "8,000", sigma: "0.7860", root: "0.8866", delta: "0.7428", inhg: "22.22", tf: "30.47", tc: "−0.9", theta: "0.9450", a: "643.3" }
      - { alt: "9,000", sigma: "0.7620", root: "0.8729", delta: "0.7148", inhg: "21.39", tf: "26.90", tc: "−2.8", theta: "0.9381", a: "640.9" }
      - { alt: "10,000", sigma: "0.7385", root: "0.8593", delta: "0.6877", inhg: "20.58", tf: "23.34", tc: "−4.8", theta: "0.9312", a: "638.6" }
      - { alt: "15,000", sigma: "0.6292", root: "0.7932", delta: "0.5643", inhg: "16.88", tf: "5.51", tc: "−14.7", theta: "0.8969", a: "626.7" }
      - { alt: "20,000", sigma: "0.5328", root: "0.7299", delta: "0.4595", inhg: "13.75", tf: "−12.32", tc: "−24.6", theta: "0.8625", a: "614.6" }
      - { alt: "25,000", sigma: "0.4481", root: "0.6694", delta: "0.3711", inhg: "11.10", tf: "−30.15", tc: "−34.5", theta: "0.8281", a: "602.2" }
      - { alt: "30,000", sigma: "0.3741", root: "0.6117", delta: "0.2970", inhg: "8.89", tf: "−47.98", tc: "−44.4", theta: "0.7937", a: "589.5" }
      - { alt: "35,000", sigma: "0.3099", root: "0.5567", delta: "0.2353", inhg: "7.04", tf: "−65.82", tc: "−54.3", theta: "0.7594", a: "576.6" }
      - { alt: "36,089 (tropopause)", sigma: "0.2971", root: "0.5450", delta: "0.2234", inhg: "6.68", tf: "−69.70", tc: "−56.5", theta: "0.7519", a: "573.8" }
      - { alt: "40,000", sigma: "0.2462", root: "0.4962", delta: "0.1851", inhg: "5.54", tf: "−69.70", tc: "−56.5", theta: "0.7519", a: "573.8" }
      - { alt: "45,000", sigma: "0.1936", root: "0.4400", delta: "0.1455", inhg: "4.35", tf: "−69.70", tc: "−56.5", theta: "0.7519", a: "573.8" }
      - { alt: "50,000", sigma: "0.1522", root: "0.3902", delta: "0.1145", inhg: "3.43", tf: "−69.70", tc: "−56.5", theta: "0.7519", a: "573.8" }
      - { alt: "55,000", sigma: "0.1197", root: "0.3460", delta: "0.0900", inhg: "2.69", tf: "−69.70", tc: "−56.5", theta: "0.7519", a: "573.8" }
      - { alt: "60,000", sigma: "0.0941", root: "0.3068", delta: "0.0708", inhg: "2.12", tf: "−69.70", tc: "−56.5", theta: "0.7519", a: "573.8" }
      - { alt: "65,000", sigma: "0.0740", root: "0.2721", delta: "0.0557", inhg: "1.67", tf: "−69.70", tc: "−56.5", theta: "0.7519", a: "573.8" }
      - { alt: "70,000", sigma: "0.0582", root: "0.2413", delta: "0.0438", inhg: "1.31", tf: "−69.70", tc: "−56.5", theta: "0.7519", a: "573.8" }
      - { alt: "75,000", sigma: "0.0458", root: "0.2140", delta: "0.0344", inhg: "1.03", tf: "−69.70", tc: "−56.5", theta: "0.7519", a: "573.8" }
      - { alt: "80,000", sigma: "0.0360", root: "0.1897", delta: "0.0271", inhg: "0.81", tf: "−69.70", tc: "−56.5", theta: "0.7519", a: "573.8" }
      - { alt: "85,000", sigma: "0.0280", root: "0.1673", delta: "0.0213", inhg: "0.64", tf: "−64.80", tc: "−53.8", theta: "0.7613", a: "577.4" }
      - { alt: "90,000", sigma: "0.0217", root: "0.1472", delta: "0.0168", inhg: "0.50", tf: "−56.57", tc: "−49.2", theta: "0.7772", a: "583.4" }
      - { alt: "95,000", sigma: "0.0169", root: "0.1299", delta: "0.0134", inhg: "0.40", tf: "−48.34", tc: "−44.6", theta: "0.7931", a: "589.3" }
      - { alt: "100,000", sigma: "0.0132", root: "0.1149", delta: "0.0107", inhg: "0.32", tf: "−40.11", tc: "−40.1", theta: "0.8089", a: "595.2" }
sources:
  - n: 1
    title: "NAVWEPS 00-80T-80, Aerodynamics for Naval Aviators"
    publisher: "US Navy, Office of the Chief of Naval Operations (H. H. Hurt, Jr.)"
    date: "revised January 1965"
    url: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/00-80T-80.pdf
    accessed: 10 November 2026
    note: "Read by printed page: standard sea-level pressure, p. 2; pressure and density altitude, p. 4; Figure 1.1, Standard Altitude Table, p. 5; true and equivalent airspeed, p. 14; speed of sound and Mach number, p. 202. The figure also gives kinematic viscosity, left out here. The FAA's copy of the Navy manual."
---

## About this table

The standard atmosphere is the average atmosphere that aircraft performance and instruments are measured against. An altimeter set to 29.92 inHg reads pressure altitude: the altitude in this table with the same pressure as the air outside. Density altitude is the altitude in this table with the same density [[1]](#source-1).

**True airspeed.** The airspeed indicator is calibrated for sea-level density, so true airspeed is equivalent airspeed divided by √σ: at 40,000 ft, where √σ is about 0.5, the aircraft flies about twice as fast as the equivalent airspeed [[1]](#source-1).

**Mach number.** Mach number is true airspeed divided by the speed of sound. The speed of sound depends only on the air's temperature, which is why it falls with height up to the tropopause and is constant above it [[1]](#source-1).
