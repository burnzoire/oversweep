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

## Revision 3 — local speech recognition prototype (8 November 2026)

- Capture microphone with `getUserMedia` and an `AudioWorklet` forwarding raw mono PCM. No microphone stream is opened by Web Speech, WebSocket, or third-party API.
- On PTT release, downsample native input to mono 16 kHz (area-weighted box filter) and pass samples into a dedicated local Whisper worker. Audio is not sent to a cloud STT service.
- Runtime: pinned `@huggingface/transformers@3.8.1` JavaScript fetched from a static CDN and `Xenova/whisper-tiny.en` weights downloaded from Hugging Face; **static asset downloads are required on first use**. Inference runs within the browser worker. Availability and offline reuse depend on the browser cache and dependency host; no offline service worker exists.
- Construct a contextual prompt before transcription, prioritising Falcon Air Base, Viper Two One, agencies, runway 27, taxiway Alpha, radio frequencies, current stage and expected phraseology. Prompt-token acceptance in Transformers.js is **experimental**. Unsupported prompting falls back explicitly to unconditioned local Whisper; results cannot be assumed vocabulary-biased.
- The first model may take time to download and run, depending on hardware. No throughput or latency claims until browser tests.
- The transcript is presented for **manual correction and transmission**, not directly accepted as an operationally correct readback. Avoid automatically recasting unidentified numbers as a callsign.
- The old browser `SpeechRecognition` path is removed, not retained as fallback. Browser voice synthesis is disabled by default because individual implementations may be remote-backed; opt-in only. Kokoro inference is intended local but still needs end-to-end browser validation.
- Experimental LLM remains a text-processing feature only. There is no cloud inference endpoint and no API key.

### Required manual checks before acceptance

1. First-use download and subsequent cached reload, with network requests inspected to verify no raw audio leaves the browser.
2. Confirm microphone permission and release-to-transcribe on Chromium Windows and mobile browsers; enforce the 25-second capture limit and track permission denial.
3. Test Whisper context injection with `Viper Two One` vs. `5421`, runway/frequency readbacks and noise; compare unconditioned case when prompt-token support fails.
4. Verify every JS/ONNX dependency works within the static Pages build and under the `/oversweep/` base path.
5. Test on-device neural audio loading separately; no published claims of natural ATC quality without listening tests.

## Revision 5 — contextual transcription corrections

- Real observation: Whisper output "Falcon Grant 521 request taxi." despite scenario indicating Falcon Ground / Viper 21.
- Root limitation: previous model prompt used plain vocabulary token IDs, lacking Whisper's `<|startofprev|>` marker. The revised builder uses tokenizer-native `get_prompt_ids` where present, otherwise verifies a correctly prefixed tokenization. Actual browser model acceptance and accuracy benefit remain unverified.
- Add reviewable, scenario-bound correction proposals. "Falcon Grant" and ambiguous "521" in the initial Ground + request taxi callsign slot can propose "Falcon Ground Viper 21 request taxi". The raw transcript and each change are shown; the text is editable and not sent until the pilot selects Transmit.
- Numeric substitution is limited to the expected callsign position. Do not rewrite arbitrary runway, altitude, frequency or other callsign numbers.
- Regression tests cover the exact observed line, unrelated numbers, and proper Whisper prefix formation.

Still required: live browser regression against recorded audio, prompt effectiveness measurement, and protection from incorrect callsign substitutions.
