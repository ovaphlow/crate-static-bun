import { serve } from 'bun'
import { upload } from './router'
import { mkdirSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'

const router = (request: Request) => {
	const url = new URL(request.url)
	const path = url.pathname

	let response: Response | Promise<Response>
	switch (path) {
		case '/crate-api-static/upload':
			response = upload(request)
			break
		default:
			if (path.startsWith('/crate-api-static/public')) {
				try {
					const filePath = join(process.env.UPLOAD_DIR || '', path.replace('/crate-api-static/public', ''))
					const fileContent = readFileSync(filePath)
					response = new Response(fileContent)
				} catch (err) {
					console.error(err)
					response = new Response('Not Found', { status: 404 })
				}
			} else {
				response = new Response('Not Found', { status: 404 })
			}
	}

	// 启用CORS和安全headers
	const setSecurityHeaders = (response: Response) => {
		response.headers.set('Access-Control-Allow-Origin', '*')
		response.headers.set('X-Content-Type-Options', 'nosniff')
		response.headers.set('X-Frame-Options', 'DENY')
		response.headers.set('X-XSS-Protection', '1; mode=block')
		return response
	}

	if (response instanceof Promise) {
		return response.then((res) => setSecurityHeaders(res))
	} else {
		return setSecurityHeaders(response)
	}
}

const port = process.env.PORT || 8424

;(() => {
	const uploadDir = process.env.UPLOAD_DIR
	console.log('uploadDir:', uploadDir)
	if (uploadDir && !existsSync(uploadDir)) {
		mkdirSync(uploadDir, { recursive: true })
	}
})()

serve({
	port: port,
	fetch: router,
})

console.log(`Server is running on http://localhost:${port}`)
