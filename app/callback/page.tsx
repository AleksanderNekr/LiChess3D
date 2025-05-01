'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLichess } from '@/helpers/LichessContext';

export default function Callback() {
  const router = useRouter();
  const { setAccessToken, fetchUserInfo } = useLichess();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const codeVerifier = localStorage.getItem('lichess_code_verifier');

      if (!code || !codeVerifier) {
        console.error('Missing authorization code or code verifier');
        return;
      }

      try {
        const clientId = 'YOUR_CLIENT_ID'; // Replace with your Lichess OAuth client ID
        const redirectUri = 'http://localhost:3000/callback'; // Replace with your callback URL

        const response = await fetch('https://lichess.org/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            code_verifier: codeVerifier,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to exchange authorization code for access token');
        }

        const data = await response.json();
        setAccessToken(data.access_token); // Update the context with the access token
        localStorage.setItem('lichess_access_token', data.access_token); // Optionally store it in localStorage

        // Fetch and store user info
        await fetchUserInfo(data.access_token);

        router.push('/'); // Redirect to the home page
      } catch (error) {
        console.error('Error during token exchange:', error);
      }
    };

    handleCallback();
  }, [router, setAccessToken, fetchUserInfo]);

  return <div>Processing Lichess login...</div>;
}
