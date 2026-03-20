import { useMemo, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Languages,
  Lock,
  Mail,
  User,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { signIn, signUp } from '../services/auth'

type Mode = 'signin' | 'signup'

export function AuthPage() {
  const { session } = useAuth()
  const { language, toggleLanguage } = useLanguage()
  const isArabic = language === 'ar'
  const copy = useMemo(
    () =>
      isArabic
        ? {
            signIn: 'تسجيل الدخول',
            createAccount: 'إنشاء حساب',
            welcomeBack: 'مرحباً بعودتك.',
            getStarted: 'ابدأ مجاناً.',
            signInSubtitle: 'سجّل الدخول للوصول إلى فواتيرك وعملائك.',
            signUpSubtitle: 'أنشئ حساب Veltro Invoice خلال ثوانٍ.',
            emailAddress: 'البريد الإلكتروني',
            password: 'كلمة المرور',
            fullName: 'الاسم الكامل',
            confirmPassword: 'تأكيد كلمة المرور',
            forgotPassword: 'نسيت كلمة المرور؟',
            signInLoading: 'جارٍ تسجيل الدخول...',
            createLoading: 'جارٍ إنشاء الحساب...',
            checkEmail: 'تحقق من بريدك الإلكتروني لتأكيد حسابك.',
            feature1: 'ثنائي اللغة — العربية والإنجليزية',
            feature2: 'محفوظ على السحابة',
            feature3: 'تصدير PDF باحترافية',
            heroHeadline: 'فوترة احترافية، مصممة لأعمالك.',
            heroSubtext: 'أنشئ وأدر وتتبع الفواتير وعروض الأسعار مع دعم عربي كامل وبيانات لحظية.',
            productBy: 'منتج من Veltro · veltro.io',
            invoice: 'Invoice',
            invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح.',
            requiredField: 'هذا الحقل مطلوب.',
            passwordShort: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.',
            passwordMismatch: 'كلمتا المرور غير متطابقتين.',
            unknownError: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
            weak: 'ضعيف',
            fair: 'متوسط',
            strong: 'قوي',
            or: 'أو',
            legal: 'بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية من Veltro.',
            terms: 'شروط الخدمة',
            privacy: 'سياسة الخصوصية',
            copyright: '© 2025 Veltro · جميع الحقوق محفوظة.',
            fullNamePlaceholder: 'اسمك',
            emailPlaceholder: 'you@example.com',
            passwordPlaceholder: '••••••••',
            createPasswordPlaceholder: 'أنشئ كلمة مرور',
            confirmPasswordPlaceholder: 'أعد إدخال كلمة المرور',
            signedIn: 'تم تسجيل الدخول',
          }
        : {
            signIn: 'Sign In',
            createAccount: 'Create Account',
            welcomeBack: 'Welcome back.',
            getStarted: 'Get started free.',
            signInSubtitle: 'Sign in to access your invoices and clients.',
            signUpSubtitle: 'Create your Veltro Invoice account in seconds.',
            emailAddress: 'Email address',
            password: 'Password',
            fullName: 'Full name',
            confirmPassword: 'Confirm password',
            forgotPassword: 'Forgot password?',
            signInLoading: 'Signing in...',
            createLoading: 'Creating account...',
            checkEmail: 'Check your email to confirm your account.',
            feature1: 'Bilingual - English & Arabic with full RTL support',
            feature2: 'Cloud-saved - all documents synced securely',
            feature3: 'PDF export - professional documents in one click',
            heroHeadline: 'Professional invoicing, built for your business.',
            heroSubtext: 'Create, manage, and track invoices and quotations - with full Arabic support and real-time data.',
            productBy: 'A product by Veltro · veltro.io',
            invoice: 'Invoice',
            invalidEmail: 'Please enter a valid email address.',
            requiredField: 'This field is required.',
            passwordShort: 'Password must be at least 8 characters.',
            passwordMismatch: 'Passwords do not match.',
            unknownError: 'Something went wrong. Please try again.',
            weak: 'Weak',
            fair: 'Fair',
            strong: 'Strong',
            or: 'or',
            legal: "By continuing, you agree to Veltro's Terms of Service and Privacy Policy.",
            terms: 'Terms of Service',
            privacy: 'Privacy Policy',
            copyright: '© 2025 Veltro · All rights reserved.',
            fullNamePlaceholder: 'Your name',
            emailPlaceholder: 'you@example.com',
            passwordPlaceholder: '••••••••',
            createPasswordPlaceholder: 'Create a password',
            confirmPasswordPlaceholder: 'Repeat your password',
            signedIn: 'Signed in',
          },
    [isArabic],
  )
  const [mode, setMode] = useState<Mode>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [signedInSuccess, setSignedInSuccess] = useState(false)

  if (session) return <Navigate to="/" replace />

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const passwordScore = getPasswordScore(password)
  const passwordStrengthLabel =
    passwordScore < 2 ? copy.weak : passwordScore < 4 ? copy.fair : copy.strong

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (mode === 'signup' && !fullName.trim()) nextErrors.fullName = copy.requiredField
    if (!email.trim()) nextErrors.email = copy.requiredField
    else if (!emailValid) nextErrors.email = copy.invalidEmail
    if (!password) nextErrors.password = copy.requiredField
    else if (mode === 'signup' && password.length < 8) nextErrors.password = copy.passwordShort
    if (mode === 'signup') {
      if (!confirmPassword) nextErrors.confirmPassword = copy.requiredField
      else if (confirmPassword !== password) nextErrors.confirmPassword = copy.passwordMismatch
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  return (
    <div className={`auth-redesign ${isArabic ? 'rtl' : ''}`}>
      <section className="auth-brand-panel">
        <div className="auth-brand-orb" />
        <div className="auth-shape auth-shape-1" />
        <div className="auth-shape auth-shape-2" />
        <div className="auth-shape auth-shape-3" />
        <div className="auth-brand-content">
          <div className="auth-lockup">
            <div className="auth-logo-badge">V</div>
            <div>
              <p className="auth-logo-title">VELTRO</p>
              <p className="auth-logo-subtitle">{copy.invoice}</p>
            </div>
          </div>
          <div className="auth-divider" />
          <h1>{copy.heroHeadline}</h1>
          <p>{copy.heroSubtext}</p>
          <ul>
            <li><Check size={14} /> {copy.feature1}</li>
            <li><Check size={14} /> {copy.feature2}</li>
            <li><Check size={14} /> {copy.feature3}</li>
          </ul>
        </div>
        <small>{copy.productBy}</small>
      </section>

      <section className="auth-form-panel">
        <button className="auth-language-toggle" onClick={toggleLanguage} type="button">
          <Languages size={14} /> {isArabic ? 'AR | EN' : 'EN | AR'}
        </button>

        <div className="auth-form-wrap">
          <div className="auth-tabs">
            <button className={mode === 'signin' ? 'active' : ''} type="button" onClick={() => { setMode('signin'); setErrors({}); setSuccessMessage('') }}>{copy.signIn}</button>
            <button className={mode === 'signup' ? 'active' : ''} type="button" onClick={() => { setMode('signup'); setErrors({}); setSuccessMessage('') }}>{copy.createAccount}</button>
          </div>

          <h2>{mode === 'signin' ? copy.welcomeBack : copy.getStarted}</h2>
          <p className="auth-subtitle">{mode === 'signin' ? copy.signInSubtitle : copy.signUpSubtitle}</p>

          <form
            key={mode}
            className="auth-form-anim"
            onSubmit={async (event) => {
              event.preventDefault()
              setSuccessMessage('')
              setSignedInSuccess(false)
              if (!validate()) return
              setLoading(true)
              try {
                if (mode === 'signin') {
                  await signIn(email, password)
                  setSignedInSuccess(true)
                } else {
                  await signUp(email, password)
                  setSuccessMessage(copy.checkEmail)
                }
              } catch {
                setErrors({ submit: copy.unknownError })
              } finally {
                setLoading(false)
              }
            }}
          >
            {mode === 'signup' ? (
              <Field
                label={copy.fullName}
                error={errors.fullName}
                icon={<User size={16} />}
                value={fullName}
                placeholder={copy.fullNamePlaceholder}
                onChange={setFullName}
              />
            ) : null}

            <Field
              label={copy.emailAddress}
              error={errors.email}
              icon={<Mail size={16} />}
              value={email}
              placeholder={copy.emailPlaceholder}
              onChange={setEmail}
            />

            <Field
              label={copy.password}
              error={errors.password}
              icon={<Lock size={16} />}
              value={password}
              placeholder={mode === 'signin' ? copy.passwordPlaceholder : copy.createPasswordPlaceholder}
              type={showPassword ? 'text' : 'password'}
              onChange={setPassword}
              trailingButton={
                <button type="button" className="auth-icon-button" onClick={() => setShowPassword((prev) => !prev)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {mode === 'signin' ? (
              <button type="button" className="auth-forgot-link">{copy.forgotPassword}</button>
            ) : (
              <>
                <div className="auth-strength">
                  <div className="auth-strength-bars">
                    {[0, 1, 2, 3].map((idx) => (
                      <span
                        key={idx}
                        className={idx < passwordScore ? 'filled' : ''}
                        data-tier={passwordScore < 2 ? 'weak' : passwordScore < 4 ? 'fair' : 'strong'}
                      />
                    ))}
                  </div>
                  <small>{passwordStrengthLabel}</small>
                </div>
                <Field
                  label={copy.confirmPassword}
                  error={errors.confirmPassword}
                  icon={<Lock size={16} />}
                  value={confirmPassword}
                  placeholder={copy.confirmPasswordPlaceholder}
                  type={showConfirmPassword ? 'text' : 'password'}
                  onChange={setConfirmPassword}
                  trailingButton={
                    <>
                      {confirmPassword ? (
                        confirmPassword === password ? <CheckCircle2 size={16} className="valid" /> : <X size={16} className="invalid" />
                      ) : null}
                      <button type="button" className="auth-icon-button" onClick={() => setShowConfirmPassword((prev) => !prev)}>
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </>
                  }
                />
              </>
            )}

            {errors.submit ? <p className="auth-field-error submit"><AlertCircle size={14} /> {errors.submit}</p> : null}

            {successMessage ? (
              <div className="auth-signup-success">
                <CheckCircle2 size={20} />
                <p>{successMessage}</p>
              </div>
            ) : null}

            <button className={`auth-submit ${signedInSuccess ? 'success' : ''}`} disabled={loading} type="submit">
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  {mode === 'signin' ? copy.signInLoading : copy.createLoading}
                </>
              ) : signedInSuccess ? (
                copy.signedIn
              ) : mode === 'signin' ? (
                copy.signIn
              ) : (
                copy.createAccount
              )}
            </button>
          </form>

          <div className="auth-or-divider"><span>{copy.or}</span></div>
          <p className="auth-legal">
            {copy.legal.split(copy.terms).join('')}
            <button type="button">{copy.terms}</button> {isArabic ? 'و' : 'and'} <button type="button">{copy.privacy}</button>.
          </p>
          <small className="auth-copyright">{copy.copyright}</small>
        </div>
      </section>
    </div>
  )
}

function Field({
  label,
  error,
  icon,
  value,
  placeholder,
  type = 'text',
  onChange,
  trailingButton,
}: {
  label: string
  error?: string
  icon: ReactNode
  value: string
  placeholder: string
  type?: string
  onChange: (value: string) => void
  trailingButton?: ReactNode
}) {
  return (
    <label className={`auth-field ${error ? 'error' : ''}`}>
      <span>{label}</span>
      <div className="auth-input-wrap">
        <div className="auth-leading-icon">{icon}</div>
        <input
          className="auth-input"
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
        {trailingButton ? <div className="auth-trailing">{trailingButton}</div> : null}
      </div>
      {error ? <small className="auth-field-error"><AlertCircle size={13} /> {error}</small> : null}
    </label>
  )
}

function getPasswordScore(password: string): number {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return score
}
