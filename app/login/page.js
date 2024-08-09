"use client";

import React, {useState} from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = '/';
    } catch (error) {
      setError('Failed to sign in. Please check your credentials.');
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>
      <div style={styles.box}>
        <h2 style={styles.title}>Login Form</h2>
        <form onSubmit = {handleLogin}>
          <input
            style = {styles.input}
            type = "email"
            placeholder = "hello@admin.com"
            value = {email}
            onChange = {(e) => setEmail(e.target.value)}
          />
          <input
            style = {styles.input}
            type = "password"
            placeholder = "Password"
            value = {password}
            onChange = {(e) => setPassword(e.target.value)}
          />
          {error && <p style = {styles.errorText}>{error}</p>}
          <button style = {styles.button} type = "submit">Login</button>
        </form>
        <p style={styles.signupText}>
          Don't have an account? <a href="/signup" style={styles.signupLink}>Signup Now</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundImage: 'url("/images/background.png")',  // Update this path with your image's path
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    errorText: {
      color: 'red',
      marginBottom: '15px',
    },
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark overlay with 50% opacity
    zIndex: 1,
  },
  box: {
    position: 'relative',
    zIndex: 2,
    padding: '40px',
    width: '320px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly transparent background
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  title: {
    marginBottom: '20px',
    fontSize: '24px',
    color: '#333',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '12px',
    marginBottom: '16px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    fontSize: '16px',
    backgroundColor: '#f5f5f5',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2f4f3f',
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
  },
  signupText: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#999',
  },
  signupLink: {
    color: '#c3c78e',
    textDecoration: 'none',
  },
};