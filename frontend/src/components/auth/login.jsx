import React from 'react';

const Login = () => {
  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <form className="bg-white p-4 rounded shadow-sm w-100" style={{ maxWidth: '400px' }}>
        <h2 className="text-center mb-4">Login</h2>
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary w-100"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
