import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import config from '../config';

interface TokenPayload {
    id: string;
    email?: string;
    role?: string;
}

export class JwtService {
    private static getExpiresIn(value: string | number): SignOptions['expiresIn'] {
        if (typeof value === 'number') {
            return Math.floor(value);
        }
        // JWT library accepts time strings like '60s', '2h', '1d'
        return value as SignOptions['expiresIn'];
    }

    static generateToken(payload: TokenPayload): string {
        const options: SignOptions = {
            expiresIn: this.getExpiresIn(config.jwt.expiresIn)
        };
        return jwt.sign(payload, config.jwt.secret as Secret, options);
    }

    static generateRefreshToken(payload: TokenPayload): string {
        const options: SignOptions = {
            expiresIn: this.getExpiresIn(config.jwt.refreshExpiresIn)
        };
        return jwt.sign(payload, config.jwt.refreshSecret as Secret, options);
    }

    static verifyToken(token: string): TokenPayload {
        return jwt.verify(token, config.jwt.secret as Secret) as TokenPayload;
    }

    static verifyRefreshToken(token: string): TokenPayload {
        return jwt.verify(token, config.jwt.refreshSecret as Secret) as TokenPayload;
    }

    static rotateRefreshToken(refreshToken: string): { accessToken: string; refreshToken: string } {
        const payload = this.verifyRefreshToken(refreshToken);
        const newAccessToken = this.generateToken(payload);
        const newRefreshToken = this.generateRefreshToken(payload);
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }
} 