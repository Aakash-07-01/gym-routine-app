import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();

    // Extract email from query parameter if present
    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get('email');

    useEffect(() => {
        // Focus first input automatically
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-advance
        if (value !== '' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pastedData) return;

        const newOtp = [...otp];
        pastedData.split('').forEach((char, i) => {
            newOtp[i] = char;
        });
        setOtp(newOtp);

        // Focus last filled input
        const focusIndex = Math.min(pastedData.length - 1, 5);
        inputRefs.current[focusIndex].focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');

        if (otpString.length !== 6) {
            toast.error('Please enter a 6-digit code');
            return;
        }

        if (!emailParam) {
            toast.error('Missing email parameter. Please register again.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/auth/verify-otp`, {
                email: emailParam,
                otp: otpString
            });

            toast.success(response.data.message || 'Email verified successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Verification failed. Try again.';
            toast.error(errorMsg);
            // Reset inputs on failure
            setOtp(['', '', '', '', '', '']);
            if (inputRefs.current[0]) inputRefs.current[0].focus();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0E0F14] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                {/* Glass Card */}
                <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Decorative Top Accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-500" />

                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                        >
                            <Mail className="w-10 h-10 text-red-500" />
                        </motion.div>

                        <h1 className="text-3xl font-bold text-white tracking-tight mb-3">
                            Verify Email
                        </h1>
                        <p className="text-gray-400 text-sm">
                            We've sent a 6-digit code to<br />
                            <span className="text-white font-medium">{emailParam || 'your email'}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="flex justify-between gap-2" onPaste={handlePaste}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => inputRefs.current[i] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:bg-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.join('').length !== 6}
                            className="w-full h-14 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Verify Code
                                    <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-white/5 pt-6">
                        <p className="text-gray-400 text-sm mb-4">
                            Didn't receive the code? Check spam or
                        </p>
                        <div className="flex justify-center gap-4 text-sm">
                            <button
                                className="text-red-400 hover:text-red-300 transition-colors font-medium hover:underline"
                                onClick={() => toast('We just "resent" it to verification.txt', { icon: '📧' })}
                            >
                                Resend Code
                            </button>
                            <span className="text-gray-600">|</span>
                            <Link to="/register" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                                Change Email <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyOTP;
