jest.mock('@companieshouse/node-session-handler')

import { Session } from '@companieshouse/node-session-handler';
import { Request, Response } from 'express'
import { commonTemplateVariablesMiddleware } from '../../src/middleware/common.variables.middleware';


describe('common variable middleware tests', () => {
    it('should populate the users email from the session', async () => {
        const email = 'jblogs@example.com'
        const req: Request = { originalUrl: '', session: sessionWithEmail(email) } as Request;
        const res: Response = { locals: {} } as Response;
        const next = jest.fn();

        commonTemplateVariablesMiddleware(req, res, next)

        expect(res.locals.userEmail).toBe(email)
    })
})

function sessionWithEmail(email: string): Session {
    return {
        data: {
            signin_info: {
                user_profile: {
                    email: email
                }
            }
        }
    } as Session;
}