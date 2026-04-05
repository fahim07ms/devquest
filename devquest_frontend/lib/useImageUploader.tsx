import { toast } from 'sonner'
import api from '@/lib/api'

export const useImageUploader = () => {
    return async (file: File): Promise<string | undefined> => {
        const fd = new FormData()
        fd.append('upload', file)

        try {
            const response = await api.post('/api/posts/create/image-upload', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })

            const secure_url: string = response.data?.secure_url
            toast.success('Image uploaded.')
            return secure_url
        } catch (error) {
            console.error('Image upload error:', error)
            toast.error('Failed to upload image.')
            return undefined
        }
    }
}