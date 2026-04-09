import User from '../models/User.js';
import Company from '../models/Company.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { AppError } from '../utils/AppError.js';
import userEvents from '../services/notification.service.js';

// --- 1. REGISTRO ---
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Verificar si ya existe (409 Conflict)
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new AppError('El email ya está registrado', 409);

    // 2. Cifrar contraseña y generar código de 6 dígitos
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Crear usuario (status pending por defecto)
    const newUser = await User.create({
      email,
      password: hashedPassword,
      verificationCode,
      verificationAttempts: 3,
      status: 'pending'
    });

    // 4. Generar Tokens
    const accessToken = jwt.sign({ id: newUser._id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    const refreshToken = jwt.sign({ id: newUser._id }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });

    // 5. Emitir evento y responder
    userEvents.emit('user:registered', newUser);

    res.status(201).json({
      user: { email: newUser.email, status: newUser.status, role: newUser.role },
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

// --- 2. VALIDACIÓN DE EMAIL ---
export const validateEmail = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id);

    if (user.status === 'verified') throw new AppError('User already verified', 400);
    if (user.verificationAttempts <= 0) throw new AppError('No more attempts', 429);

    if (user.verificationCode !== code) {
      user.verificationAttempts -= 1;
      await user.save();
      throw new AppError(`Incorrect code. Attempts: ${user.verificationAttempts}`, 400);
    }

    user.status = 'verified';
    await user.save();
    
    userEvents.emit('user:verified', user);
    res.status(200).json({ message: 'Email verified' });
  } catch (error) { next(error); }
};

// --- 3. LOGIN ---
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Incorrect credentials', 401);
    }

    const accessToken = jwt.sign({ id: user._id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    const refreshToken = jwt.sign({ id: user._id }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });

    res.status(200).json({ user, accessToken, refreshToken });
  } catch (error) { next(error); }
};

// --- 4. ONBOARDING: DATOS PERSONALES ---
export const updatePersonalData = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true, runValidators: true });
    res.status(200).json(user);
  } catch (error) { next(error); }
};

// --- 4. ONBOARDING: COMPAÑÍA ---
export const updateCompanyData = async (req, res, next) => {
  try {
    const { cif, isFreelance } = req.body;
    let company = await Company.findOne({ cif });

    if (!company) {
      // Si es freelance, usamos sus datos. Si no, los del body.
      const companyData = isFreelance ? {
        name: `${req.user.name} ${req.user.lastName}`,
        cif: req.user.nif,
        address: req.user.address,
        isFreelance: true,
        owner: req.user.id
      } : { ...req.body, owner: req.user.id };

      company = await Company.create(companyData);
      await User.findByIdAndUpdate(req.user.id, { company: company._id, role: 'admin' });
    } else {
      // Si ya existe la compañía, se une como guest
      await User.findByIdAndUpdate(req.user.id, { company: company._id, role: 'guest' });
    }

    res.status(200).json(company);
  } catch (error) { next(error); }
};

// --- 5. LOGO ---
export const uploadCompanyLogo = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('Please upload a file', 400);
    if (!req.user.company) throw new AppError('The user has no company', 400);

    const logoUrl = `/uploads/${req.file.filename}`;
    await Company.findByIdAndUpdate(req.user.company, { logo: logoUrl });

    res.status(200).json({ logo: logoUrl });
  } catch (error) { next(error); }
};

// --- 6. OBTENER USUARIO (POPULATE) ---
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('company');
    res.status(200).json(user);
  } catch (error) { next(error); }
};

// --- 7. REFRESH ---
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('Refresh token required', 401);

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const newAccessToken = jwt.sign({ id: decoded.id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) { next(new AppError('Invalidated token', 401)); }
};

// --- 7. LOGOUT ---
export const logout = async (req, res, next) => {
  try {
    // Para invalidar la sesión, borramos el refreshToken del usuario
    await User.findByIdAndUpdate(req.user.id, {
      refreshToken: null
    });

    res.status(200).json({
      status: 'success',
      message: 'ACK: Sesion closed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// --- 8. ELIMINAR (SOFT/HARD) ---
export const deleteUser = async (req, res, next) => {
  try {
    const isSoft = req.query.soft === 'true';
    if (isSoft) {
      await User.findByIdAndUpdate(req.user.id, { deleted: true });
    } else {
      await User.findByIdAndDelete(req.user.id);
    }
    userEvents.emit('user:deleted', req.user.id);
    res.status(204).send();
  } catch (error) { next(error); }
};

// --- 10. INVITAR ---
export const inviteUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    // Creamos usuario invitado asociado a la misma empresa
    const invited = await User.create({
      email,
      password: await bcrypt.hash('Temporaryl123!', 12), // Password temporal
      company: req.user.company,
      role: 'guest',
      status: 'pending'
    });

    userEvents.emit('user:invited', invited);
    res.status(201).json(invited);
  } catch (error) { next(error); }
};