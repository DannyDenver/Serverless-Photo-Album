import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Image } from '../models/Image'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export class ImagesAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly imagesTable = process.env.IMAGES_TABLE,
    private readonly imageIdIndex = process.env.IMAGE_ID_INDEX,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = +process.env.SIGNED_URL_EXPIRATION) {
  }

  async getImage(imageId: string): Promise<Image> {
    console.log('Getting image')

    const result = await this.docClient.query({
      TableName: this.imagesTable,
      IndexName: this.imageIdIndex,
      KeyConditionExpression: 'imageId = :imageId',
      ExpressionAttributeValues: {
        ':imageId': imageId
      }
    }).promise()

    return result.Items[0] as Image
  }

  async getImagesPerGroup(groupId: string): Promise<Image[]> {
    const result = await this.docClient.query({
      TableName: this.imagesTable,
      KeyConditionExpression: 'groupId = :groupId',
      ExpressionAttributeValues: {
        ':groupId': groupId
      },
      ScanIndexForward: false // traverse in reverse order
    }).promise()

    return result.Items as Image[]
  }

  async createImage(image: Image) {
    console.log('Storing new item: ', image)

    await this.docClient.put({
      TableName: this.imagesTable,
      Item: image
    }).promise()

    return image
  }

  getUploadUrl(imageId: string) {
    return s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: imageId,
      Expires: this.urlExpiration
    })
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')

    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  return new XAWS.DynamoDB.DocumentClient()
}
