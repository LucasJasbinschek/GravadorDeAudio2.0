class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.audioBlob = null;
    this.audioUrl = null;
    this.audio = new Audio();
    this.stream = null;
  }

  async startRecording() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];
      
      this.mediaRecorder.addEventListener("dataavailable", event => {
        this.audioChunks.push(event.data);
      });

      this.mediaRecorder.addEventListener("stop", () => {
        this.audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
        this.audioUrl = URL.createObjectURL(this.audioBlob);
        this.audio.src = this.audioUrl;
      });

      this.mediaRecorder.start();
      return true;
    } catch (error) {
      console.error("Error starting recording:", error);
      return false;
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
      this.stream.getTracks().forEach(track => track.stop());
      return true;
    }
    return false;
  }

  playRecording() {
    if (this.audioUrl) {
      this.audio.play();
      return true;
    }
    return false;
  }

  getAudioBlob() {
    return this.audioBlob;
  }
}

