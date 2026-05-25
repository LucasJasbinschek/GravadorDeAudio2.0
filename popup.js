document.addEventListener('DOMContentLoaded', () => {
  const recordButton = document.getElementById('recordButton');
  const stopButton = document.getElementById('stopButton');
  const playButton = document.getElementById('playButton');
  const uploadButton = document.getElementById('uploadButton');
  const copyButton = document.getElementById('copyButton');
  const statusDiv = document.getElementById('status');
  const resultDiv = document.getElementById('result');
  const audioLink = document.getElementById('audioLink');
  const expiryInfo = document.getElementById('expiryInfo');
  
  const audioRecorder = new AudioRecorder();
  let isRecording = false;

  // Configuração dos ouvintes de eventos
  recordButton.addEventListener('click', async () => {
    isRecording = await audioRecorder.startRecording();
    if (isRecording) {
      statusDiv.textContent = "Gravando...";
      recordButton.disabled = true;
      stopButton.disabled = false;
      playButton.disabled = true;
      uploadButton.disabled = true;
    } else {
      statusDiv.textContent = "Erro ao iniciar gravacao";
    }
  });

  stopButton.addEventListener('click', () => {
    const stopped = audioRecorder.stopRecording();
    if (stopped) {
      statusDiv.textContent = "Gravacao concluida!";
      recordButton.disabled = false;
      stopButton.disabled = true;
      playButton.disabled = false;
      uploadButton.disabled = false;
      isRecording = false;
    }
  });

  playButton.addEventListener('click', () => {
    const played = audioRecorder.playRecording();
    if (played) {
      statusDiv.textContent = "Reproduzindo gravacao...";
      playButton.disabled = true;
      
      audioRecorder.audio.addEventListener('ended', () => {
        statusDiv.textContent = "Gravacao concluida!";
        playButton.disabled = false;
      });
    }
  });

  uploadButton.addEventListener('click', async () => {
    statusDiv.textContent = "Enviando para tmpfiles.org, aguarde um momento.";
    uploadButton.disabled = true;
    
    try {
      const audioBlob = audioRecorder.getAudioBlob();
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');
      
      const response = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.status && data.data) {
        const downloadUrl = data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
        audioLink.href = downloadUrl;
        audioLink.textContent = downloadUrl;
        resultDiv.classList.remove('hidden');
        statusDiv.textContent = " Upload concluido!";
        expiryInfo.textContent = "O arquivo ficara disponivel por 7 dias";
      } else {
        throw new Error(data.message || 'Falha no upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      statusDiv.textContent = ` Erro no upload: ${error.message}`;
    } finally {
      uploadButton.disabled = false;
    }
  });

  copyButton.addEventListener('click', () => {
    const link = audioLink.href;
    navigator.clipboard.writeText(link).then(() => {
      copyButton.textContent = "Copiado!";
      setTimeout(() => {
        copyButton.textContent = "Copiar Link";
      }, 2000);
    });
  });
});