import { CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import 'source-map-support/register'
import { JwtToken } from '../../auth/JwtToken'

const jwt = require('jsonwebtoken');

const cert = ``

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
    try {
        const decodedToken = verifyToken(event.authorizationToken, cert)
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
}

function verifyToken(authHeader: string, cert: string): JwtToken {
    if (!authHeader) {
        throw new Error('No authorization header')
    }

    if (!authHeader.toLocaleLowerCase().startsWith('bearer ')) {
        throw new Error('Invalid authorization header')
    }

    const split = authHeader.split(' ')
    const token = split[1]

    console.log(token)
    return jwt.verify(
        token,           // Token from an HTTP header to validate
        cert,            // A certificate copied from Auth0 website
        { algorithms: ['RS256'] } // We need to specify that we use the RS256 algorithm
    ) as JwtToken
}
