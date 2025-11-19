/**
 * Auth feature exports
 */
export { RegisterForm } from './components/register-form';
export {
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  isAuthenticated,
} from './lib/auth-storage';
export {
  registerSchema,
  toRegisterDto,
  type RegisterFormData,
} from './lib/schemas';
