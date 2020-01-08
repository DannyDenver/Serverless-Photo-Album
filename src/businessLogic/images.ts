import { ImagesAccess } from "../dataLayer/imagesAccess"
import { Image } from "../models/Image"
import * as uuid from 'uuid'

const imagesAccess = new ImagesAccess()

export async function getImage(imageId: string): Promise<Image> {
  return imagesAccess.getImage(imageId)
}

export async function getImagesPerGroup(
    groupId: string
): Promise<Image[]> {
    return imagesAccess.getImagesPerGroup(groupId)
}

export function getUploadUrl(imageId: string) {
    return imagesAccess.getUploadUrl(imageId)
}

export async function createImage(groupId: string, event: any) {
    const imageId = uuid.v4()
    
    const timestamp = new Date().toISOString()
    const newImage = JSON.parse(event.body)
    const bucketName = process.env.IMAGES_S3_BUCKET
    
    const image: Image = {
        groupId,
        timestamp,
        imageId,
        ...newImage,
        imageUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`
    }

    return imagesAccess.createImage(image)
}
