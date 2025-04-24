export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class BadRequestError extends AppError {
    constructor(message: string) {
        super(message, 400);
        this.name = 'BadRequestError';
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string) {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string) {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 422);
        this.name = 'ValidationError';
    }
}

export class DatabaseError extends AppError {
    constructor(message: string) {
        super(message, 500);
        this.name = 'DatabaseError';
    }
} 