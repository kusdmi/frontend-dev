import { getApiBaseUrl } from './config'
import type { MessageImage } from '@/entities/chat/types'

interface UploadedFileResponse {
  id: string
}

export async function uploadImageAsFile(
  accessToken: string,
  image: MessageImage
): Promise<string> {
  const base = getApiBaseUrl()
  const blob = await fetch(image.dataUrl).then((res) => res.blob())
  const ext = blob.type === 'image/png' ? 'png' : 'jpg'
  const fileName = image.name || `image.${ext}`

  const formData = new FormData()
  formData.append('purpose', 'general')
  formData.append('file', blob, fileName)

  const res = await fetch(`${base}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    body: formData,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`files ${res.status}: ${text}`)
  }

  const data = (await res.json()) as UploadedFileResponse
  if (!data?.id) {
    throw new Error('files: нет id загруженного файла')
  }
  return data.id
}
