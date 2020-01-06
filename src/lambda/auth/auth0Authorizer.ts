import { CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import 'source-map-support/register'
import { JwtToken } from '../../auth/JwtToken'

import * as middy from 'middy'
import { secretsManager } from 'middy/middlewares'

const jwt = require('jsonwebtoken');

const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD

export const handler = middy(async (event: CustomAuthorizerEvent, context): Promise<CustomAuthorizerResult> => {
    try {
        const decodedToken = verifyToken(event.authorizationToken, context.AUTH0_SECRET[secretField])
        console.log('User was authorized')

        return {
            principalId: decodedToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }
    } catch(e) {
        console.log('User was not authorized', e)

        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
    }
})

function verifyToken(authHeader: string, secret: string): JwtToken {
    if (!authHeader) {
        throw new Error('No authorization header')
    }

    if (!authHeader.toLocaleLowerCase().startsWith('bearer ')) {
        throw new Error('Invalid authorization header')
    }

    const split = authHeader.split(' ')
    const token = split[1]

    console.log(token)
    console.log(secret)
    return jwt.verify(token, secret, { algorithms: ["HS256"]}) as JwtToken
}

handler.use(
    secretsManager({
        cache: true,
        cacheExpiryInMillis: 60000,
        throwOnFailedCall: true,
        secrets: {
            AUTH0_SECRET: secretId
        }
    })
)
