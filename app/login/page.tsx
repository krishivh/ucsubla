'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/common/Icon';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidUCLAEmail = (email: string) => {
    return email.toLowerCase().endsWith('@ucla.edu');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidUCLAEmail(email)) {
      setError('Please use your UCLA email address (@ucla.edu)');
      return;
    }

    setIsLoading(true);

    // Simulate email verification process
    setTimeout(() => {
      // In a real app, this would send a verification email
      console.log('Verification email sent to:', email);
      router.push('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 app-container">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="bg-uclaBlue rounded-2xl p-4 inline-block mb-4">
          <Icon name="graduationcap.fill" size={48} className="text-white" />
        </div>
        <h1 className="text-[32px] leading-10 font-medium text-uclaBlue mb-2">
          UCSubLA
        </h1>
        <p className="text-body text-slateGray">
          Find your perfect sublease near UCLA
        </p>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-md">
        <div className="card p-6 mb-6">
          <h2 className="text-h2 text-darkSlate mb-2">Welcome</h2>
          <p className="text-body text-slateGray mb-6">
            Sign in with your UCLA email to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-body text-darkSlate font-medium mb-2"
              >
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
              {error && (
                <p className="text-small text-red-600 mt-2">{error}</p>
              )}
            </div>

            {/* Verification Info */}
            <div className="bg-uclaBlue/10 border border-uclaBlue/20 rounded-lg p-3 flex gap-2">
              <Icon name="checkmark.seal.fill" size={20} className="text-uclaBlue flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-small text-uclaBlue font-medium mb-1">
                  UCLA Email Verification
                </p>
                <p className="text-xs text-slateGray">
                  We&apos;ll send a verification link to confirm you&apos;re a UCLA student
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3.5 rounded-xl text-h3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending verification...</span>
                </>
              ) : (
                'Continue with UCLA Email'
              )}
            </button>
          </form>
        </div>

        {/* Terms */}
        <p className="text-xs text-center text-slateGray px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
