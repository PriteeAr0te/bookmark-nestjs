import { Injectable, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService
    ) { }

    async signup(dto: AuthDto) {
        //generate password
        const passwordHash = await argon.hash(dto.password);

        try {
            //save user in user
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash: passwordHash,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    createdAt: true,
                    updatedAt: true,
                }
            })

            // delete user.hash

            return {
                user,
                token: await this.signToken(user.id, user.email)
            };

        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ConflictException('User already exists');
                }
            }

            throw error;
        }
    };

    async signin(dto: AuthDto) {
        console.log("dto: ", dto)
        //find user
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            }
        })
        //if user not found throw exception
        if (!user) {
            throw new ForbiddenException('User does not exist.')
        }

        //compare passwords
        const passwordMathch = await argon.verify(user.hash, dto.password)

        //if password incorrect throw exception
        if (!passwordMathch) {
            throw new ForbiddenException('Invalid Credentials')
        }

        const { hash, ...userWithoutHash } = user;

        //return user
        return {
            user: userWithoutHash,
            token: await this.signToken(user.id, user.email)
        }
    }

    async signToken(
        userId: number,
        email: string
    ): Promise<{ access_token: string }> {
        const payload = {
            sub: userId,
            email
        }

        const secret = this.config.get('JWT_SECRET')

        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: secret
        })

        return {
            access_token: token
        }
    }
}