---
short: Time zones and date-time groups
tables:
  - id: time-zone-letters
    title: Military time zone letters
    caption: "Each 15° band of longitude is a time zone named by a letter, read as its phonetic word: 0600 in zone R is written 0600R and spoken “zero six hundred Romeo”. The zone description is the correction to apply to the zone's time to get UTC. J (Juliett) is not a zone: it means the observer's local time."
    source: 1
    groupBy: side
    columns:
      - { key: side, label: Side of Greenwich }
      - { key: letter, label: Letter, code: true }
      - { key: word, label: Spoken }
      - { key: offset, label: Offset from UTC }
      - { key: description, label: Zone description, code: true }
      - { key: longitude, label: Longitude band }
    rows:
      - { side: "Greenwich", letter: "Z", word: Zulu, offset: "UTC", description: "0", longitude: "7.5° W to 7.5° E" }
      - { side: "East: ahead of UTC", letter: "A", word: Alfa, offset: "UTC+1", description: "−1", longitude: "7.5° E to 22.5° E" }
      - { side: "East: ahead of UTC", letter: "B", word: Bravo, offset: "UTC+2", description: "−2", longitude: "22.5° E to 37.5° E" }
      - { side: "East: ahead of UTC", letter: "C", word: Charlie, offset: "UTC+3", description: "−3", longitude: "37.5° E to 52.5° E" }
      - { side: "East: ahead of UTC", letter: "D", word: Delta, offset: "UTC+4", description: "−4", longitude: "52.5° E to 67.5° E" }
      - { side: "East: ahead of UTC", letter: "E", word: Echo, offset: "UTC+5", description: "−5", longitude: "67.5° E to 82.5° E" }
      - { side: "East: ahead of UTC", letter: "F", word: Foxtrot, offset: "UTC+6", description: "−6", longitude: "82.5° E to 97.5° E" }
      - { side: "East: ahead of UTC", letter: "G", word: Golf, offset: "UTC+7", description: "−7", longitude: "97.5° E to 112.5° E" }
      - { side: "East: ahead of UTC", letter: "H", word: Hotel, offset: "UTC+8", description: "−8", longitude: "112.5° E to 127.5° E" }
      - { side: "East: ahead of UTC", letter: "I", word: India, offset: "UTC+9", description: "−9", longitude: "127.5° E to 142.5° E" }
      - { side: "East: ahead of UTC", letter: "K", word: Kilo, offset: "UTC+10", description: "−10", longitude: "142.5° E to 157.5° E" }
      - { side: "East: ahead of UTC", letter: "L", word: Lima, offset: "UTC+11", description: "−11", longitude: "157.5° E to 172.5° E" }
      - { side: "East: ahead of UTC", letter: "M", word: Mike, offset: "UTC+12", description: "−12", longitude: "172.5° E to 180°" }
      - { side: "West: behind UTC", letter: "N", word: November, offset: "UTC−1", description: "+1", longitude: "7.5° W to 22.5° W" }
      - { side: "West: behind UTC", letter: "O", word: Oscar, offset: "UTC−2", description: "+2", longitude: "22.5° W to 37.5° W" }
      - { side: "West: behind UTC", letter: "P", word: Papa, offset: "UTC−3", description: "+3", longitude: "37.5° W to 52.5° W" }
      - { side: "West: behind UTC", letter: "Q", word: Quebec, offset: "UTC−4", description: "+4", longitude: "52.5° W to 67.5° W" }
      - { side: "West: behind UTC", letter: "R", word: Romeo, offset: "UTC−5", description: "+5", longitude: "67.5° W to 82.5° W" }
      - { side: "West: behind UTC", letter: "S", word: Sierra, offset: "UTC−6", description: "+6", longitude: "82.5° W to 97.5° W" }
      - { side: "West: behind UTC", letter: "T", word: Tango, offset: "UTC−7", description: "+7", longitude: "97.5° W to 112.5° W" }
      - { side: "West: behind UTC", letter: "U", word: Uniform, offset: "UTC−8", description: "+8", longitude: "112.5° W to 127.5° W" }
      - { side: "West: behind UTC", letter: "V", word: Victor, offset: "UTC−9", description: "+9", longitude: "127.5° W to 142.5° W" }
      - { side: "West: behind UTC", letter: "W", word: Whiskey, offset: "UTC−10", description: "+10", longitude: "142.5° W to 157.5° W" }
      - { side: "West: behind UTC", letter: "X", word: X-ray, offset: "UTC−11", description: "+11", longitude: "157.5° W to 172.5° W" }
      - { side: "West: behind UTC", letter: "Y", word: Yankee, offset: "UTC−12", description: "+12", longitude: "172.5° W to 180°" }
  - id: date-time-group
    title: US military date-time group formats
    caption: "DD is the day of the month, HHMM(SS) the time, Z the zone letter, mmm the month's first three letters and YY the year. The group may be written with or without spaces."
    source: 2
    columns:
      - { key: format, label: Format, code: true }
      - { key: example, label: Example, code: true }
      - { key: use, label: Used for }
    rows:
      - { format: DDHHMMSSZmmmYY, example: 09143005ZNOV26, use: "Full time, such as software timestamps" }
      - { format: DDHHMMZmmmYY, example: 091430ZNOV26, use: "Shortened time, such as a timestamp written by hand" }
      - { format: DDHHMMZ, example: 091430Z, use: "Short time, such as in planning" }
sources:
  - n: 1
    title: "Military time zone"
    publisher: Wikipedia
    url: https://en.wikipedia.org/wiki/Military_time_zone
    accessed: 10 November 2026
    note: "Read the description and the table of zones. The article cites Allied Communications Publication ACP 121, which could not be read from the authoring environment."
  - n: 2
    title: "Date–time group"
    publisher: Wikipedia
    url: https://en.wikipedia.org/wiki/Date-time_group
    accessed: 10 November 2026
    note: "Read the US military date-time group section. The examples are written for this table in the formats it gives."
---

## About these tables

The Zulu zone, Z, is Coordinated Universal Time (UTC), the time at the Greenwich meridian [[1]](#source-1). Other zones are named by letters too, and a time is written with its zone letter after it [[1]](#source-1).

Messages, orders and plans carry a date-time group (DTG): the day, the time and the zone letter, with the month and year when they are needed [[2]](#source-2).
