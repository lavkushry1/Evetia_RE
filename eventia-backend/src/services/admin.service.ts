import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Admin } from '../models/admin.model';
import { JwtService } from './jwt.service';
import { BadRequestError, UnauthorizedError } from '../utils/errors';

export class AdminService {
    private adminRepository: Repository<Admin>;
    private jwtService: JwtService;

    constructor() {
        this.adminRepository = AppDataSource.getRepository(Admin);
        this.jwtService = new JwtService();
    }

    async login(email: string, password: string): Promise<{ token: string; admin: Partial<Admin> }> {
        // Special case for default admin credentials
        if (email === 'admin@example.com' && password === 'admin123') {
            const token = this.jwtService.generateToken({ 
                id: 'default-admin',
                email,
                role: 'admin'
            });

            return { 
                token,
                admin: { 
                    id: 'default-admin',
                    email,
                    role: 'admin'
                }
            };
        }

        const admin = await this.adminRepository.findOne({ where: { email } });
        
        if (!admin) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const isValidPassword = await admin.comparePassword(password);
        if (!isValidPassword) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const token = this.jwtService.generateToken({ 
            id: admin.id, 
            email: admin.email,
            role: 'admin'
        });

        const { passwordHash, ...adminWithoutPassword } = admin;
        return { token, admin: adminWithoutPassword };
    }

    async createAdmin(email: string, password: string): Promise<Admin> {
        const existingAdmin = await this.adminRepository.findOne({ where: { email } });
        if (existingAdmin) {
            throw new BadRequestError('Admin with this email already exists');
        }

        const admin = this.adminRepository.create({ email });
        await admin.setPassword(password);
        
        return this.adminRepository.save(admin);
    }

    async getAdminById(id: string): Promise<Admin | null> {
        return this.adminRepository.findOne({ where: { id } });
    }

    async validateToken(token: string): Promise<Admin> {
        const decoded = this.jwtService.verifyToken(token);
        if (!decoded || decoded.role !== 'admin') {
            throw new UnauthorizedError('Invalid token');
        }

        const admin = await this.getAdminById(decoded.id);
        if (!admin) {
            throw new UnauthorizedError('Admin not found');
        }

        return admin;
    }
} 