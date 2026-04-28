import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loading, error, clearError, token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '', password: '', confirmPassword: ''
  });
  const [localError, setLocalError] = useState('');

  useEffect(() => { if (token) navigate('/'); }, [token]);
  useEffect(() => { clearError(); }, []);

  const handleChange = (e) => {
    setLocalError('');
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setLocalError('Passwords do not match');
    }
    const result = await register(form.username, form.password, form.confirmPassword);
    if (result.success) navigate('/');
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14
                          bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create account
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Get started with DTPS Stock Manager
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8
                        border border-gray-100 dark:border-gray-800">
          {displayError && (
            <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20
                            border border-red-200 dark:border-red-800
                            rounded-lg text-red-700 dark:text-red-400 text-sm">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { name: 'username',        label: 'Username',         type: 'text',     placeholder: 'Choose a username' },
              { name: 'password',        label: 'Password',         type: 'password', placeholder: 'Min 6 characters' },
              { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password' },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700
                                  dark:text-gray-300 mb-1.5">
                  {label}
                </label>
                <input
                  name={name} type={type} required
                  value={form[name]} onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200
                             dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                             text-gray-900 dark:text-white placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-indigo-500
                             focus:border-transparent transition text-sm"
                />
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700
                         disabled:bg-indigo-400 text-white font-semibold
                         rounded-xl transition text-sm flex items-center
                         justify-center gap-2 shadow-md">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white
                                   border-t-transparent rounded-full animate-spin" />
                  Creating…
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login"
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}