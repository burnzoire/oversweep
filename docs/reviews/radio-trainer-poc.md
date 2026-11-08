# Military radio trainer — POC review

Status: **Drafted / not technically validated**. Scope: fictional USAF-oriented ground frequency, one aircraft, taxi clearance, hold-short readback and Tower handoff. Not actual ATC training guidance.

## Objective

Evaluate a microphone-to-transcription-to-controller-to-voice loop before authoring operationally accurate military, carrier, wartime or uncontrolled-airfield scenarios. The sample phrases are invented and illustrative, not independently sourced aviation claims.

## Design and publication

- Direct URL only: `/experiences/radio-trainer/`; `publication: unlisted`.
- No Manual wrapper, catalogue card, navigation, homepage count or cross-link.
- Public-by-URL after deployment; `noindex,nofollow` is not access control.
- Does not change existing experience publication rules for published or excluded trainers.

## Speech / inference boundaries

- Browser `SpeechRecognition` can be remote-backed; local offline STT has not been verified.
- Controller state machine is pure and deterministic. It accepts limited callsign/request/readback patterns.
- Optional WebLLM model is experimental, downloaded on demand, never required to run the exercise.
- The LLM currently cannot alter approved clearances; only literal output is accepted. This is a loader and latency POC, **not** an open conversational ATC.
- Voice output uses system `speechSynthesis`; currently no neural TTS or band-limited voice filtering. Radio key sound is separate Web Audio, not realistic voice processing.
- No user API key, paid inference, server or telemetry is used.

## Engineering checks

- `npm run check`: regression tests, Astro check, type-check, production build, output checks.
- `npm run check:review`: base-path output and no excluded/unlisted leakage.
- `npm run check:dev`: standalone URL and assets over HTTP.
- Manual smoke test: Chrome/Edge HTTPS microphone permission; speak callsign; inspect transcript and readback result; voice selection and playback; restart; screen reader keyboard focus; narrow-screen layout.
- Test on unsupported WebGPU, disabled microphone, denied permissions, blocked CDN and offline conditions; should retain typed deterministic mode.

## Not covered / future acceptance

1. Browser-local Whisper STT with aviation error corpus.
2. Functional neural TTS and radio speech filtering.
3. Natural LLM interpretation without inventing clearance fields.
4. Independent cited military procedure profiles for USAF/USN/NATO and sim differences.
5. Actual microphone, latency, accessibility and 30-minute stability evidence.

Do not mark Technically Validated or release as operational guidance based on this proof of concept.
