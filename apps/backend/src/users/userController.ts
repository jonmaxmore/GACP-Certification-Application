import { Request, Response } from 'express';

// Import the Use Case (CommonJS module)
// We use require here because the project is a mix of JS/TS and the use case doesn't have type definitions yet.
const RegisterUserUseCase = require('../../modules/auth-farmer/application/use-cases/register-usecase');

export class UserController {
    private registerUserUseCase: any;

    constructor(registerUserUseCase?: any) {
        this.registerUserUseCase = registerUserUseCase;
    }

    /**
     * Register a new user (Farmer)
     * Supports Individual and Corporate farmers
     */
    public register = async (req: Request, res: Response): Promise<Response> => {
        try {
            const {
                email,
                password,
                firstName,
                lastName,
                phoneNumber,
                idCard,
                laserCode,
                // New Fields
                corporateId,
                farmerType, // 'individual' | 'corporate'
                farmingExperience,
                // Address
                address,
                province,
                district,
                subDistrict,
                zipCode,
                postalCode,
                metadata
            } = req.body;

            // Execute Use Case
            const result = await this.registerUserUseCase.execute({
                email,
                password,
                firstName,
                lastName,
                phoneNumber,
                idCard,
                idCardImage: req.file ? req.file.path : null,
                laserCode,
                corporateId,
                farmerType,
                farmingExperience,
                address,
                province,
                district,
                subdistrict: subDistrict, // Map subDistrict to subdistrict
                zipCode: postalCode || zipCode,
                metadata
            });

            return res.status(201).json({
                success: true,
                message: 'User registered successfully. Please verify your email.',
                data: {
                    user: {
                        id: result.user.id,
                        email: result.user.email,
                        firstName: result.user.firstName,
                        lastName: result.user.lastName,
                        status: result.user.status,
                        farmerType: result.user.farmerType,
                        isEmailVerified: result.user.isEmailVerified,
                    },
                },
                verificationToken: result.verificationToken,
            });

        } catch (error: any) {
            console.error('[UserController] Registration error:', error);

            if (
                error.message.includes('already exists') ||
                error.message.includes('already registered')
            ) {
                return res.status(409).json({
                    success: false,
                    error: error.message,
                });
            }

            if (error.message.includes('Invalid') || error.message.includes('required')) {
                return res.status(400).json({
                    success: false,
                    error: error.message,
                });
            }

            return res.status(500).json({
                success: false,
                error: 'Registration failed. Please try again.',
            });
        }
    }
}
