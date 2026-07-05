import api from './axios';

const parseSseData = (line) => {
  if (!line.startsWith('data:')) return null;
  // Spring WebFlux's ServerSentEventHttpMessageWriter appends the data directly 
  // after "data:" without adding a protocol space. So any space after the colon
  // is actually part of our LLM token (e.g. " be").
  return line.slice(5);
};

export const getWeeklyInsight = () => {
  // #region agent log
  const url = `${api.defaults.baseURL}/ai/insight/weekly`;
  fetch('http://127.0.0.1:7594/ingest/db39171e-b140-4f67-8b54-306ab1a549a5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4426f5'},body:JSON.stringify({sessionId:'4426f5',runId:'post-fix',location:'ai.js:getWeeklyInsight',message:'axios weekly insight URL',data:{url,baseURL:api.defaults.baseURL},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  return api.get('/ai/insight/weekly');
};
export const regenerateWeeklyInsight = () => api.post('/ai/insight/weekly/regenerate');
export const getSessionNarrative = (id) => api.post(`/ai/session/${id}/narrative`);
export const getExerciseAlternatives = (name) => api.post(`/ai/exercise/${encodeURIComponent(name)}/alternatives`);

export const streamAiChat = (message, onToken, onDone, onError) => {
  const controller = new AbortController();
  const token = localStorage.getItem('token');
  const streamUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/ai/chat/stream?message=${encodeURIComponent(message)}`;
  // #region agent log
  fetch('http://127.0.0.1:7594/ingest/db39171e-b140-4f67-8b54-306ab1a549a5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4426f5'},body:JSON.stringify({sessionId:'4426f5',runId:'post-fix',location:'ai.js:streamAiChat:start',message:'chat stream request',data:{streamUrlLen:streamUrl.length,hasToken:!!token,messageLen:message.length},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  fetch(streamUrl, {
    headers: { Authorization: `Bearer ${token}` },
    signal: controller.signal
  }).then(async (res) => {
    // #region agent log
    fetch('http://127.0.0.1:7594/ingest/db39171e-b140-4f67-8b54-306ab1a549a5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4426f5'},body:JSON.stringify({sessionId:'4426f5',runId:'post-fix',location:'ai.js:streamAiChat:response',message:'chat stream response',data:{status:res.status,ok:res.ok,contentType:res.headers.get('content-type')},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let tokenCount = 0;
    let doneCalled = false;
    let currentEventData = [];

    const finish = (reason) => {
      if (doneCalled) return;
      doneCalled = true;
      // #region agent log
      fetch('http://127.0.0.1:7594/ingest/db39171e-b140-4f67-8b54-306ab1a549a5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4426f5'},body:JSON.stringify({sessionId:'4426f5',runId:'post-fix',location:'ai.js:streamAiChat:done',message:'stream finished',data:{reason,tokenCount},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      onDone();
    };

    const processLine = (line) => {
      const cleanLine = line.endsWith('\r') ? line.slice(0, -1) : line;
      
      // Empty line means end of event
      if (!cleanLine) {
        if (currentEventData.length > 0) {
          const data = currentEventData.join('\n');
          currentEventData = [];
          if (data === '[DONE]') {
            finish('data-done');
            return true;
          }
          tokenCount++;
          onToken(data);
        }
        return false;
      }

      if (cleanLine.startsWith('event:') && cleanLine.slice(6).trim() === 'done') {
        finish('event-done');
        return true;
      }
      
      const data = parseSseData(cleanLine);
      if (data !== null) {
        currentEventData.push(data);
      }
      return false;
    };
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (processLine(line)) return;
      }
    }
    if (buffer.trim() && processLine(buffer)) return;
    finish('stream-end');
  }).catch(e => {
    // #region agent log
    if (e.name !== 'AbortError') fetch('http://127.0.0.1:7594/ingest/db39171e-b140-4f67-8b54-306ab1a549a5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4426f5'},body:JSON.stringify({sessionId:'4426f5',runId:'post-fix',location:'ai.js:streamAiChat:error',message:'chat stream error',data:{error:e.message,name:e.name},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    if (e.name !== 'AbortError') onError(e);
  });
  return () => controller.abort();
};
