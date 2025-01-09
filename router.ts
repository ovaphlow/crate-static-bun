import { promises as fs } from 'fs'

export const upload = async (request: Request) => {
	if (request.method !== 'POST') {
		return new Response('Method Not Allowed', { status: 405 })
	}

	const uploadDir = process.env.UPLOAD_DIR
	if (!uploadDir) {
		return new Response('Upload directory not configured', { status: 500 })
	}

	const contentType = request.headers.get('Content-Type') || ''
	if (!contentType.startsWith('multipart/form-data')) {
		return new Response('Incorrect MIME type', { status: 400 })
	}

	const formData = await request.formData()
	const file = formData.get('file') as File
	if (!file) {
		return new Response('No file uploaded', { status: 400 })
	}

	const appID = (formData.get('app_id') as string) || ''

	const appDir = `${uploadDir}/${appID}`
	try {
		await fs.access(appDir)
	} catch {
		await fs.mkdir(appDir, { recursive: true })
	}

	const arrayBuffer = await file.arrayBuffer()
	const buffer = Buffer.from(arrayBuffer)

	const now = new Date()
	const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}${String(now.getMilliseconds()).padStart(3, '0')}`
	const randomString = generateRandomString(16)
	const fileAffix = file.name.split('.').pop()
	const filePath = `${appDir}/${timestamp}-${randomString}.${fileAffix}`

	await fs.writeFile(filePath, new Uint8Array(buffer))

	return new Response(
		JSON.stringify({
			filePath: `${timestamp}-${randomString}.${fileAffix}`,
			appID: appID,
		}),
		{
			headers: {
				'content-type': 'application/json; charset=UTF-8',
			},
		},
	)
}

function generateRandomString(length: number) {
	const characters = '0123456789abcdef'
	let result = ''
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length)
		result += characters[randomIndex]
	}
	return result
}
