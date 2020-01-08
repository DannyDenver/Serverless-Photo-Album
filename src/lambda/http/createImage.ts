import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createImage, getUploadUrl } from '../../businessLogic/images'
import { groupExists } from '../../businessLogic/groups'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const groupId = event.pathParameters.groupId

  const validGroupId = await groupExists(groupId)
  
  if (!validGroupId) {
    return {
        statusCode: 404,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            error: 'Group does not exist'
        })
    }
}

  const newItem = await createImage(groupId, event)

  const url = getUploadUrl(newItem.imageId)

  return {
    statusCode: 201,
    body: JSON.stringify({
      newItem: newItem,
      uploadUrl: url
    })
  }
})

handler.use(
  cors({
    credentials:true
  })
)