import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Register() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        dob: '',
        biologicalSex: 'Male',
        height: '',
        startingWeight: '',
        primaryGoal: 'Muscle Gain',
        experienceLevel: 'Beginner',
        unitPreference: 'Metric'
    });

    const { register, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleNext = () => {
        if (step === 1 && (!formData.username || !formData.email || !formData.password || !formData.fullName)) {
            toast.error("Please fill all account details.");
            return;
        }
        if (step === 2 && (!formData.dob || !formData.height || !formData.startingWeight)) {
            toast.error("Biometrics are required for calorie calculations.");
            return;
        }
        setStep(s => s + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Parse numbers based on unit pref before sending
            const payload = { ...formData };
            payload.height = parseFloat(payload.height);
            payload.startingWeight = parseFloat(payload.startingWeight);

            await register(payload);
            navigate('/');
            toast.success('Registration complete! Welcome to GymOS.', { icon: '🚀' });
        } catch (error) {
            toast.error(error.message || 'Registration failed');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="max-w-md w-full relative">
                <h1 className="text-6xl font-bebas text-center text-[#ff0055] tracking-widest mb-2 drop-shadow-[0_0_15px_rgba(255,0,85,0.4)]">
                    GYMOS
                </h1>
                <p className="text-gray-400 font-mono text-center mb-10 text-sm tracking-widest uppercase">
                    Build Your Profile. Calibrate the Engine.
                </p>

                <div className="card-3d p-8 relative overflow-hidden bg-[#111]">
                    {/* Progress Bar */}
                    <div className="flex gap-2 mb-8">
                        <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]' : 'bg-[#333]'}`}></div>
                        <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]' : 'bg-[#333]'}`}></div>
                        <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 3 ? 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]' : 'bg-[#333]'}`}></div>
                    </div>

                    <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-6">

                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                                    <h2 className="font-bebas text-3xl text-white tracking-widest mb-4">Account Config</h2>
                                    <div>
                                        <input type="text" name="fullName" placeholder="Full Name (e.g. Arjun)" required
                                            className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono transition-colors"
                                            value={formData.fullName} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <input type="text" name="username" placeholder="Username" required
                                            className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono transition-colors"
                                            value={formData.username} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <input type="email" name="email" placeholder="Email Address" required
                                            className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono transition-colors"
                                            value={formData.email} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <input type="password" name="password" placeholder="Password" required
                                            className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono transition-colors"
                                            value={formData.password} onChange={handleChange} />
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                                    <h2 className="font-bebas text-3xl text-white tracking-widest mb-4">Biometrics</h2>
                                    <p className="text-gray-500 font-mono text-xs mb-4">Required for accurate MET calorie and target HR zone calculations.</p>

                                    <div>
                                        <label className="text-gray-400 font-mono text-xs mb-1 block">Date of Birth</label>
                                        <input type="date" name="dob" required
                                            className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono"
                                            value={formData.dob} onChange={handleChange} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-gray-400 font-mono text-xs mb-1 block">Biological Sex</label>
                                            <select name="biologicalSex" className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono appearance-none" value={formData.biologicalSex} onChange={handleChange}>
                                                <option>Male</option>
                                                <option>Female</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-gray-400 font-mono text-xs mb-1 block text-right">Unit System</label>
                                            <select name="unitPreference" className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono appearance-none text-right" value={formData.unitPreference} onChange={handleChange}>
                                                <option>Metric</option>
                                                <option>Imperial</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-gray-400 font-mono text-xs mb-1 block">Height ({formData.unitPreference === 'Metric' ? 'cm' : 'inches'})</label>
                                            <input type="number" step="0.1" name="height" placeholder="180" required
                                                className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono"
                                                value={formData.height} onChange={handleChange} />
                                        </div>
                                        <div>
                                            <label className="text-gray-400 font-mono text-xs mb-1 block">Starting Weight ({formData.unitPreference === 'Metric' ? 'kg' : 'lbs'})</label>
                                            <input type="number" step="0.1" name="startingWeight" placeholder="75.5" required
                                                className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono"
                                                value={formData.startingWeight} onChange={handleChange} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                                    <h2 className="font-bebas text-3xl text-white tracking-widest mb-4">Training Profile</h2>

                                    <div>
                                        <label className="text-gray-400 font-mono text-xs mb-2 block uppercase tracking-widest">Primary Objective</label>
                                        <div className="space-y-3">
                                            {['Muscle Gain', 'Fat Loss', 'Maintenance', 'Athletic Performance'].map(goal => (
                                                <label key={goal} className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.primaryGoal === goal ? 'border-[#00e5ff] bg-[#00e5ff]/10' : 'border-[#333] bg-[#1a1a1a] hover:border-[#555]'}`}>
                                                    <div className="flex items-center">
                                                        <input type="radio" name="primaryGoal" value={goal} checked={formData.primaryGoal === goal} onChange={handleChange} className="hidden" />
                                                        <span className={`font-bebas text-xl tracking-widest ${formData.primaryGoal === goal ? 'text-[#00e5ff]' : 'text-gray-400'}`}>{goal}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <label className="text-gray-400 font-mono text-xs mb-2 block uppercase tracking-widest">Experience Level</label>
                                        <select name="experienceLevel" className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-4 text-white font-bebas text-xl tracking-widest focus:outline-none focus:border-[#00e5ff] appearance-none" value={formData.experienceLevel} onChange={handleChange}>
                                            <option>Beginner</option>
                                            <option>Intermediate</option>
                                            <option>Advanced</option>
                                        </select>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex gap-4 pt-6 mt-4 border-t-2 border-[#222]">
                            {step > 1 && (
                                <button type="button" onClick={() => setStep(s => s - 1)} className="px-6 py-4 bg-transparent border-2 border-[#333] rounded-xl text-white font-bebas text-xl tracking-widest hover:bg-[#222] transition-colors rounded-xl">
                                    BACK
                                </button>
                            )}

                            <button type="submit" disabled={isLoading} className="flex-1 btn-3d-cyan text-black font-bebas text-2xl tracking-widest py-4 rounded-xl transition-transform disabled:opacity-50 uppercase">
                                {isLoading ? 'Processing...' : (step === 3 ? 'INITIALIZE GYMOS' : 'CONTINUE')}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 font-mono text-sm">
                            Already calibrated? <Link to="/login" className="text-[#00e5ff] hover:text-white transition-colors">Boot login sequence</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
