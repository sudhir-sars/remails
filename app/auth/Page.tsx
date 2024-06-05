// pages/tokens.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Auth = () => {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    if (accessToken && refreshToken) {
      // Store tokens in localStorage or context
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Redirect to the main app or dashboard
      router.push('/dashboard');
    } else {
      // Handle error if tokens are not available
      console.error('Tokens are missing');
    }
  }, [router]);

  return <div>Loading...</div>;
};

export default Auth;
