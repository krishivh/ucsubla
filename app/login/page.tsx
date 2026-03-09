'use client';

import { useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Icon from '@/components/common/Icon';
import { useAuth } from '@/lib/hooks/useAuth';

function LoginForm() {
  const { signInWithEmail, verifyOtp } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [normalizedEmail, setNormalizedEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const authError = searchParams.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) { setError('Please enter your email address'); return; }

    let norm = email.toLowerCase().trim();
    if (norm.endsWith('@g.ucla.edu')) {
      norm = norm.replace('@g.ucla.edu', '@ucla.edu');
    }
    setNormalizedEmail(norm);

    setIsLoading(true);
    const { error: authErr } = await signInWithEmail(email);
    setIsLoading(false);

    if (authErr) {
      setError(authErr);
    } else {
      setSent(true);
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 7) {
      inputRefs[index + 1].current?.focus();
    }

    if (newOtp.every(d => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
    if (pasted.length === 8) {
      const newOtp = pasted.split('');
      setOtp(newOtp);
      inputRefs[7].current?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code: string) => {
    setVerifying(true);
    setError('');
    const { error: verifyErr } = await verifyOtp(normalizedEmail, code);
    setVerifying(false);

    if (verifyErr) {
      setError('Invalid code. Please try again.');
      setOtp(['', '', '', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    } else {
      const next = searchParams.get('next') || '/';
      router.push(next);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="card p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-uclaBlue/10 flex items-center justify-center mx-auto mb-4">
            <Icon name="checkmark.seal.fill" size={32} className="text-uclaBlue" />
          </div>
          <h2 className="text-h2 text-darkSlate mb-2">Enter verification code</h2>
          <p className="text-body text-slateGray mb-1">
            We sent a 8-digit code to
          </p>
          <p className="text-body text-uclaBlue font-medium mb-6">{normalizedEmail}</p>

          <div className="flex justify-center gap-2 mb-4" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                disabled={verifying}
                className="w-10 h-12 text-center text-lg font-semibold border-2 border-border rounded-xl focus:border-uclaBlue focus:ring-2 focus:ring-uclaBlue/20 focus:outline-none transition-colors disabled:opacity-50"
              />
            ))}
          </div>

          {error && <p className="text-small text-red-600 mb-3">{error}</p>}

          {verifying && (
            <div className="flex items-center justify-center gap-2 text-body text-slateGray mb-3">
              <div className="w-4 h-4 border-2 border-uclaBlue/30 border-t-uclaBlue rounded-full animate-spin" />
              <span>Verifying...</span>
            </div>
          )}

          <p className="text-small text-slateGray mb-4">
            Didn&apos;t receive the code? Check your spam folder
          </p>

          <button
            onClick={() => { setSent(false); setEmail(''); setOtp(['', '', '', '', '', '', '', '']); setError(''); }}
            className="text-small text-uclaBlue font-medium underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="card p-6 mb-6">
        <h2 className="text-h2 text-darkSlate mb-2">Welcome</h2>
        <p className="text-body text-slateGray mb-6">
          Sign in with your UCLA email to continue
        </p>

        {authError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-small text-red-600">Authentication failed. Please try again.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-body text-darkSlate font-medium mb-2">
              UCLA Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@ucla.edu"
                className="w-full bg-white border border-border rounded-lg pl-11 pr-4 py-3 text-body text-darkSlate placeholder:text-lightSlate focus:outline-none focus:ring-2 focus:ring-uclaBlue"
                disabled={isLoading}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Icon name="person" size={20} className="text-lightSlate" />
              </div>
            </div>
            {error && <p className="text-small text-red-600 mt-2">{error}</p>}
          </div>

          <div className="bg-uclaBlue/10 border border-uclaBlue/20 rounded-lg p-3 flex gap-2">
            <Icon name="checkmark.seal.fill" size={20} className="text-uclaBlue flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-small text-uclaBlue font-medium mb-1">UCLA Email Verification</p>
              <p className="text-xs text-slateGray">
                We&apos;ll send a 8-digit code — no password needed
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3.5 rounded-xl text-h3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sending code...</span>
              </>
            ) : (
              'Continue with UCLA Email'
            )}
          </button>
        </form>
      </div>
      <p className="text-xs text-center text-slateGray px-4">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 app-container">
      <div className="mb-8 text-center">
        <div className="bg-uclaBlue rounded-2xl p-4 inline-block mb-4">
          <Icon name="graduationcap.fill" size={48} className="text-white" />
        </div>
        <h1 className="text-[32px] leading-10 font-medium text-uclaBlue mb-2">BruinLease</h1>
        <p className="text-body text-slateGray">Find your perfect sublease near UCLA</p>
      </div>
      <Suspense fallback={<div className="w-full max-w-md card p-6 animate-pulse h-48" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}