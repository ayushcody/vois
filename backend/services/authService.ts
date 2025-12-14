import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

interface User {
    id: string;
    username: string;
    passwordHash: string;
    role: 'admin' | 'voter' | 'auditor';
    permissions: string[];
    createdAt: number;
}

interface Session {
    userId: string;
    token: string;
    expiresAt: number;
}

const USERS_PATH = path.resolve(__dirname, '../data/users.json');
const SESSIONS_PATH = path.resolve(__dirname, '../data/sessions.json');
const JWT_SECRET = process.env.JWT_SECRET || 'ekmat-dev-secret-change-in-production';

export class AuthService {
    private users: Map<string, User> = new Map();
    private sessions: Map<string, Session> = new Map();

    constructor() {
        this.loadUsers();
        this.loadSessions();
        this.createDefaultAdmin();
    }

    private loadUsers() {
        try {
            if (fs.existsSync(USERS_PATH)) {
                const data = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
                this.users = new Map(Object.entries(data));
            }
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    }

    private loadSessions() {
        try {
            if (fs.existsSync(SESSIONS_PATH)) {
                const data = JSON.parse(fs.readFileSync(SESSIONS_PATH, 'utf-8'));
                this.sessions = new Map(Object.entries(data));
            }
        } catch (error) {
            console.error('Failed to load sessions:', error);
        }
    }

    private saveUsers() {
        try {
            const dir = path.dirname(USERS_PATH);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            const data = Object.fromEntries(this.users);
            fs.writeFileSync(USERS_PATH, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Failed to save users:', error);
        }
    }

    private saveSessions() {
        try {
            const dir = path.dirname(SESSIONS_PATH);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            const data = Object.fromEntries(this.sessions);
            fs.writeFileSync(SESSIONS_PATH, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Failed to save sessions:', error);
        }
    }

    private async createDefaultAdmin() {
        const adminId = 'admin';
        if (!this.users.has(adminId)) {
            const passwordHash = await bcrypt.hash('admin123', 10);
            
            const admin: User = {
                id: adminId,
                username: 'admin',
                passwordHash,
                role: 'admin',
                permissions: ['create_election', 'manage_candidates', 'view_results', 'manage_users'],
                createdAt: Date.now()
            };
            
            this.users.set(adminId, admin);
            this.saveUsers();
            console.log('Default admin created: admin/admin123');
        }
    }

    async login(username: string, password: string): Promise<{ token: string; user: Omit<User, 'passwordHash'> }> {
        const user = Array.from(this.users.values()).find(u => u.username === username);
        
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const session: Session = {
            userId: user.id,
            token,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        };

        this.sessions.set(token, session);
        this.saveSessions();

        const { passwordHash, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
    }

    async verifyToken(token: string): Promise<User | null> {
        try {
            const session = this.sessions.get(token);
            if (!session || session.expiresAt < Date.now()) {
                return null;
            }

            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
            const user = this.users.get(decoded.userId);
            
            return user || null;
        } catch (error) {
            return null;
        }
    }

    async createUser(username: string, password: string, role: 'admin' | 'voter' | 'auditor'): Promise<User> {
        if (Array.from(this.users.values()).find(u => u.username === username)) {
            throw new Error('Username already exists');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const userId = `${role}_${Date.now()}`;

        const permissions = this.getDefaultPermissions(role);
        
        const user: User = {
            id: userId,
            username,
            passwordHash,
            role,
            permissions,
            createdAt: Date.now()
        };

        this.users.set(userId, user);
        this.saveUsers();

        return user;
    }

    private getDefaultPermissions(role: string): string[] {
        switch (role) {
            case 'admin':
                return ['create_election', 'manage_candidates', 'view_results', 'manage_users'];
            case 'auditor':
                return ['view_results', 'audit_votes'];
            case 'voter':
                return ['cast_vote', 'view_receipt'];
            default:
                return [];
        }
    }

    logout(token: string): void {
        this.sessions.delete(token);
        this.saveSessions();
    }

    hasPermission(user: User, permission: string): boolean {
        return user.permissions.includes(permission);
    }
}

export const authService = new AuthService();