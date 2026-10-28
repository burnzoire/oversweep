export const manualSubjects = [
  { slug: "flight-fundamentals", title: "Flight Fundamentals" },
  { slug: "airfield-operations", title: "Airfield Operations" },
  { slug: "radio-communications", title: "Radio Communications" },
  { slug: "navigation", title: "Navigation" },
  { slug: "instrument-flight", title: "Instrument Flight" },
  { slug: "flight-planning", title: "Flight Planning" },
  { slug: "formation-flying", title: "Formation Flying" },
  { slug: "air-to-air-refuelling", title: "Air-to-Air Refuelling" },
  { slug: "naval-operations", title: "Naval Operations" },
  { slug: "air-combat", title: "Air Combat" },
  { slug: "sensors-situational-awareness", title: "Sensors & Situational Awareness" },
  { slug: "air-to-ground-operations", title: "Air-to-Ground Operations" },
  { slug: "abnormal-operations", title: "Abnormal Operations" },
] as const;

// `summary` describes the category on the Encyclopedia landing grid.
export const encyclopediaCategories = [
  { slug: "aircraft", title: "Aircraft", summary: "Fighters, attack aircraft, trainers, transports and helicopters: role, performance, armament and service history." },
  { slug: "ordnance", title: "Ordnance", summary: "Missiles, bombs, rockets and guns: how they are guided, their reach and how they are employed." },
  { slug: "threat-systems", title: "Threat Systems", summary: "Surface-to-air missile systems: radars, guidance, engagement limits and what they show on a radar warning receiver." },
  { slug: "radar-sensors", title: "Radar & Sensors", summary: "Airborne radars, targeting pods and warning receivers: what they detect and how." },
  { slug: "airfields-carriers", title: "Airfields & Carriers", summary: "Real-world airfields of every service and country, their history and units, and how DCS World and Falcon BMS maps represent them." },
  { slug: "terminology", title: "Terminology", summary: "Brevity words, abbreviations and terms used across the services." },
  { slug: "reference-data", title: "Reference Data", summary: "Tables pilots look things up in: units, conversions and codes." },
] as const;
