// Test Worker - simplified version
var gyuanpalace_worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // API status endpoint
    if (path === '/api/palace/status') {
      return new Response(JSON.stringify({
        system: "记忆宫殿分身系统",
        concept: "最我",
        version: "2.3.0",
        mode: "multi-clone-collaboration",
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString('zh-CN')
      }), {
        headers: { 'content-type': 'application/json' }
      });
    }
    
    // Agent list endpoint
    if (path === '/api/agent/list') {
      return new Response(JSON.stringify({
        agents: []
      }), {
        headers: { 'content-type': 'application/json' }
      });
    }
    
    // Tasks endpoint
    if (path === '/api/tasks/active') {
      return new Response(JSON.stringify({
        tasks: [],
        count: 0
      }), {
        headers: { 'content-type': 'application/json' }
      });
    }
    
    // Default: forward to Pages
    const pagesUrl = 'https://gyuanpalace-xyz.pages.dev' + path + url.search;
    return await fetch(pagesUrl, {
      method: request.method,
      headers: request.headers,
      redirect: 'follow'
    });
  }
};

addEventListener('fetch', event => {
  event.respondWith(gyuanpalace_worker_default.fetch(event.request, globalThis));
});
