import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { groupExists } from '../../businessLogic/groups'
import { getImagesPerGroup } from '../../businessLogic/images'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

  const images = await getImagesPerGroup(groupId)
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: images
    })
  }
}