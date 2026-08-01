// Decap CMS Git Gateway
// 部署后，将此 Worker URL 替换 admin/config.yml 中的 endpoint 字段

const GITHUB = 'https://api.github.com'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname.replace('/gateway', '')

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Expose-Headers': 'Link',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    const headers = {
      'Authorization': `token ${env.GITHUB_TOKEN}`,
      'User-Agent': 'DecapCMS-GitGateway',
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': request.headers.get('Content-Type') || 'application/json',
    }

    let body = null
    if (!['GET', 'DELETE'].includes(request.method)) {
      body = await request.text()
    }

    try {
      const resp = await fetch(`${GITHUB}${path}${url.search}`, {
        method: request.method,
        headers,
        body,
      })
      const text = await resp.text()
      return new Response(text, {
        status: resp.status,
        headers: {
          'Content-Type': resp.headers.get('Content-Type') || 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Link': resp.headers.get('Link') || '',
        },
      })
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }
  },
}
