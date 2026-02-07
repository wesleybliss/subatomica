type UploadResult = {
    url: string
    key: string
}

export async function uploadFile(file: File, path?: string): Promise<UploadResult> {
    void file
    void path
    throw new Error('Vercel storage is not configured yet.')
}

export async function deleteFile(key: string): Promise<void> {
    void key
    throw new Error('Vercel storage is not configured yet.')
}

export async function getFileUrl(key: string): Promise<string> {
    return `vercel://stub/${key}`
}
