// AudioWorklet: forward mono 32-bit PCM from the microphone to the page.
// No HTTP/WebSocket or remote audio processing. The worker never sees the stream.
class PCMRecorder extends AudioWorkletProcessor {
 constructor() {
  super(); this.active = true;
  this.port.onmessage = e => { if (e.data === 'stop') this.active = false; };
 }
 process(inputs) {
  const channel = inputs[0]?.[0];
  if (this.active && channel?.length) {
   const copy = new Float32Array(channel);
   this.port.postMessage(copy.buffer, [copy.buffer]);
  }
  return true;
 }
}
registerProcessor('oversweep-pcm-recorder', PCMRecorder);
