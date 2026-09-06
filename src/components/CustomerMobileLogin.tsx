import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronDown, 
  Edit2, 
  Lock,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { CustomerProfile } from '../types';
import { requestOtp, verifyOtpCode } from '../lib/customerAuth';

interface CountryCodeOption {
  code: string;
  name: string;
  flag: string;
  sample: string;
  digits: number;
}

const COUNTRY_CODES: CountryCodeOption[] = [
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', sample: '50 123 4567', digits: 9 },
  { code: '+91', name: 'India', flag: '🇮🇳', sample: '98765 43210', digits: 10 },
  { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪', sample: '50 123 4567', digits: 9 },
  { code: '+965', name: 'Kuwait', flag: '🇰🇼', sample: '9123 4567', digits: 8 },
  { code: '+974', name: 'Qatar', flag: '🇶🇦', sample: '5123 4567', digits: 8 },
  { code: '+973', name: 'Bahrain', flag: '🇧🇭', sample: '3123 4567', digits: 8 },
  { code: '+968', name: 'Oman', flag: '🇴🇲', sample: '9123 4567', digits: 8 },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧', sample: '7123 456789', digits: 10 },
  { code: '+1', name: 'USA / Canada', flag: '🇺🇸', sample: '555 123 4567', digits: 10 },
];

interface CustomerMobileLoginProps {
  onSuccess: (customer: CustomerProfile, token: string) => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
  embedded?: boolean;
}

export default function CustomerMobileLogin({
  onSuccess,
  onCancel,
  title = 'Login to Continue',
  subtitle = 'Please verify your mobile number with a one-time verification code to continue to checkout.',
  embedded = false,
}: CustomerMobileLoginProps) {
  // Step: 'mobile' | 'otp'
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');

  // Phone input states
  const [countryCode, setCountryCode] = useState<string>('+966');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [fullPhone, setFullPhone] = useState<string>('');

  // OTP states
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Status states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Refs for OTP input auto-focus
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  // Format seconds to mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Submit Mobile Number -> Request OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmed = phoneNumber.replace(/\D/g, '');
    if (!trimmed || trimmed.length < 7) {
      setErrorMessage('Please enter a valid mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestOtp(trimmed, countryCode);
      setFullPhone(res.fullPhoneNumber);
      if (res.devHint) {
        setDevOtpHint(res.devHint);
      }
      setStep('otp');
      setTimer(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMessage(`One-Time Password (OTP) sent to ${res.fullPhoneNumber}`);

      // Auto focus first OTP input after state update
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to send OTP. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || isLoading) return;
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const res = await requestOtp(phoneNumber, countryCode);
      if (res.devHint) {
        setDevOtpHint(res.devHint);
      }
      setTimer(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMessage(`A new verification code has been sent to ${fullPhone}`);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle single OTP digit change
  const handleDigitChange = (index: number, value: string) => {
    // If pasted full 6 digits
    const cleanVal = value.replace(/\D/g, '');
    if (cleanVal.length > 1) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = cleanVal[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(cleanVal.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      if (cleanVal.length >= 6) {
        submitOtp(cleanVal.slice(0, 6));
      }
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    // Auto advance
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits entered
    const combined = newDigits.join('');
    if (combined.length === 6) {
      submitOtp(combined);
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // 3. Submit OTP
  const submitOtp = async (codeToVerify?: string) => {
    const otp = codeToVerify || otpDigits.join('');
    if (otp.length !== 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await verifyOtpCode(fullPhone, otp);
      setSuccessMessage('Verified successfully! Continuing to checkout...');
      setTimeout(() => {
        onSuccess(res.customer, res.token);
      }, 300);
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect verification code. Please check and try again.');
      setIsLoading(false);
    }
  };

  // Current country info
  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  return (
    <div
      id="customer-mobile-login-card"
      className={`${
        embedded
          ? 'w-full bg-white rounded-2xl border border-brand-cocoa-border p-5 sm:p-6 shadow-sm text-left'
          : 'w-full max-w-md bg-white rounded-2xl border border-brand-cocoa-border p-6 sm:p-8 shadow-xl text-left'
      }`}
    >
      {/* Header */}
      <div className="border-b border-brand-cocoa-border/40 pb-4 mb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center text-brand-pink">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-brand-cocoa tracking-tight">
                {title}
              </h3>
              <p className="text-[11px] font-mono uppercase tracking-wider text-brand-pink-dark font-semibold">
                {step === 'mobile' ? 'Step 1 of 2: Mobile Number' : 'Step 2 of 2: OTP Verification'}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" />
            <span>Secure OTP</span>
          </div>
        </div>

        <p className="text-xs text-brand-cocoa-light mt-2 leading-relaxed font-sans">
          {step === 'mobile'
            ? subtitle
            : `Enter the 6-digit one-time password sent to ${fullPhone}.`}
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {/* STEP 1: MOBILE NUMBER ENTRY */}
      {step === 'mobile' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold font-mono uppercase tracking-wider text-brand-cocoa-light mb-1.5">
              Mobile Number
            </label>

            <div className="flex items-stretch rounded-xl border border-brand-cocoa-border focus-within:border-brand-pink focus-within:ring-2 focus-within:ring-brand-pink/20 bg-white transition-all overflow-hidden shadow-2xs">
              {/* Country Code Selector */}
              <div className="relative border-r border-brand-cocoa-border bg-brand-cream/40 flex items-center px-2.5 sm:px-3">
                <span className="text-base mr-1.5 select-none">{selectedCountry.flag}</span>
                <select
                  aria-label="Country Dialing Code"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-transparent text-xs font-mono font-bold text-brand-cocoa appearance-none pr-5 focus:outline-none cursor-pointer"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} ({c.name})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-brand-cocoa-light pointer-events-none absolute right-2" />
              </div>

              {/* Number Input */}
              <input
                type="tel"
                inputMode="numeric"
                required
                autoFocus
                placeholder={selectedCountry.sample}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 px-3 py-3 text-sm font-medium text-brand-cocoa placeholder-brand-cocoa-light/40 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between mt-1.5 text-[10px] text-brand-cocoa-light font-sans">
              <span>Saudi Arabia (+966) selected by default</span>
              <span>No password needed</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !phoneNumber.trim()}
              className="w-full py-3.5 px-4 bg-brand-pink text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-sm hover:shadow-md hover:bg-brand-pink/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-brand-cocoa-light text-center leading-relaxed">
            By continuing, you verify that you have access to this mobile number for order notifications and updates.
          </p>
        </form>
      )}

      {/* STEP 2: OTP VERIFICATION */}
      {step === 'otp' && (
        <div className="space-y-5">
          {/* Target Phone display with Change option */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-brand-cream/60 border border-brand-cocoa-border text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">{selectedCountry.flag}</span>
              <div>
                <span className="font-mono font-bold text-brand-cocoa text-sm">{fullPhone}</span>
                <span className="block text-[10px] text-brand-cocoa-light font-sans">Verification OTP sent</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('mobile');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-xs font-semibold text-brand-pink hover:text-brand-pink-dark flex items-center gap-1 cursor-pointer px-2 py-1 rounded hover:bg-white border border-transparent hover:border-brand-pink/20 transition-all"
            >
              <Edit2 className="w-3 h-3" />
              <span>Change Number</span>
            </button>
          </div>

          {/* Dev Test Code Banner (Ensures sandbox preview testing works smoothly!) */}
          {devOtpHint && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="font-mono font-bold">Preview Test OTP: {devOtpHint}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const digits = devOtpHint.split('').slice(0, 6);
                  setOtpDigits(digits);
                  submitOtp(devOtpHint);
                }}
                className="text-[10px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded cursor-pointer transition-colors"
              >
                Auto Fill & Verify
              </button>
            </div>
          )}

          {/* 6-Digit OTP Boxes */}
          <div>
            <label className="block text-[11px] font-bold font-mono uppercase tracking-wider text-brand-cocoa-light mb-2 text-center">
              Enter 6-Digit Verification Code
            </label>

            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={`w-10 h-12 sm:w-12 sm:h-14 text-center font-mono font-bold text-lg sm:text-xl rounded-xl border transition-all ${
                    digit
                      ? 'border-brand-pink bg-pink-50/40 text-brand-cocoa ring-2 ring-brand-pink/20'
                      : 'border-brand-cocoa-border bg-white text-brand-cocoa focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Countdown timer & Resend option */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="font-mono text-brand-cocoa-light flex items-center gap-1">
              <span>Expires in:</span>
              <span className="font-bold text-brand-cocoa">{formatTimer(timer)}</span>
            </div>

            {canResend ? (
              <button
                type="button"
                disabled={isLoading}
                onClick={handleResendOtp}
                className="font-semibold text-brand-pink hover:text-brand-pink-dark flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Resend OTP</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 font-sans">
                Resend available in {timer}s
              </span>
            )}
          </div>

          {/* Submit Verification Button */}
          <button
            type="button"
            disabled={isLoading || otpDigits.join('').length !== 6}
            onClick={() => submitOtp()}
            className="w-full py-3.5 px-4 bg-brand-pink text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-sm hover:shadow-md hover:bg-brand-pink/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Code...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Verify & Continue to Checkout</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
