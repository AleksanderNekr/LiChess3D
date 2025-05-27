'use client';

import { useEffect, useRef } from 'react'; // Import useRef
import { useRouter } from 'next/navigation';
import { useLichess } from '@/helpers/LichessContext';
import * as lichessApi from '@/helpers/lichessApi';
import { LICHESS_CLIENT_ID, getLichessRedirectUri } from '@/helpers/lichessConfig';

export default function Callback() {
  const router = useRouter();
  const { setAccessToken, fetchUserInfo } = useLichess();
  const processingRef = useRef(false); // Ref to track if processing has started

  useEffect(() => {
    const handleCallback = async () => {
      if (processingRef.current) {
        // Already processing or has processed, prevent re-execution
        return;
      }
      processingRef.current = true; // Mark as processing

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const codeVerifier = localStorage.getItem('lichess_code_verifier');

      if (!code || !codeVerifier) {
        console.error('Missing authorization code or code verifier');
        router.push('/'); // Redirect to home if essential info is missing
        return;
      }

      try {
        const redirectUri = getLichessRedirectUri();
        const data = await lichessApi.exchangeToken({
          code,
          clientId: LICHESS_CLIENT_ID,
          redirectUri,
          codeVerifier,
        });

        setAccessToken(data.access_token);
        localStorage.setItem('lichess_access_token', data.access_token);
        localStorage.removeItem('lichess_code_verifier'); // Clean up code verifier

        await fetchUserInfo(data.access_token);

        router.push('/');
      } catch (error) {
        console.error('Error during token exchange:', error);
        // Optionally, redirect to an error page or show a message
        // For now, just cleaning up and redirecting to home
        localStorage.removeItem('lichess_code_verifier');
        router.push('/');
      }
    };

    // Only call handleCallback if there's a code in the URL,
    // otherwise, it might be a revisit to the callback page without a new auth flow.
    if (new URLSearchParams(window.location.search).has('code')) {
      handleCallback();
    } else {
      // If no code, and not already processing, redirect home.
      // This handles cases where the user might navigate back to the callback URL.
      if (!processingRef.current) {
        router.push('/');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, setAccessToken, fetchUserInfo]); // Dependencies are stable context functions and router

  return <div>Processing Lichess login...</div>;
}
