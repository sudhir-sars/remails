import { useState } from 'react';
import { useRouter } from 'next/router';
import { SignJWT } from 'jose';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simplified authentication (replace with real auth logic)
    if (username === 'admin' && password === 'password') {
      const secret = new TextEncoder().encode(
        process.env.NEXT_PUBLIC_JWE_SECRET
      );
      const jweToken = await new SignJWT({ username })
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secret);

      localStorage.setItem('token', jweToken);
      router.push('/admin');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div>
      <h1>Admin Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
