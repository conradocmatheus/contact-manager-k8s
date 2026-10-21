import bcrypt from 'bcryptjs';

const DEFAULT_SALT_ROUNDS = 10;

export const hashPassword = (password) => {
    const configuredSaltRounds = Number(process.env.BCRYPT_SALT_ROUNDS);
    const saltRounds = Number.isInteger(configuredSaltRounds) && configuredSaltRounds > 0
        ? configuredSaltRounds
        : DEFAULT_SALT_ROUNDS;

    return bcrypt.hash(password, saltRounds);
};

export const comparePassword = (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};
