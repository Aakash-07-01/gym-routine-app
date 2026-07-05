import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

history = read_file('frontend/src/pages/History.jsx')
analysis = read_file('frontend/src/pages/DataAnalysis.jsx')

history_comp = re.search(r'export default function History\(\) \{(.*?)\n}\n', history, re.DOTALL).group(1)
analysis_comp = re.search(r'export default function DataAnalysis\(\) \{(.*?)\n}\n', analysis, re.DOTALL).group(1)
exercise_mapping = re.search(r'(const EXERCISE_TO_MUSCLE_ID = {.*?};)\n', analysis, re.DOTALL).group(1)

imports = """import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Scale, Camera, Download, BarChart2, Loader2, Database, Activity, Dumbbell, CalendarDays } from 'lucide-react';
import useGymStore from '../store/gymStore';
import useAuthStore from '../store/authStore';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import VolumeTrendChart from '../components/analysis/VolumeTrendChart';
import WorkoutDistributionChart from '../components/analysis/WorkoutDistributionChart';
import { BodyMap } from '../components/bodyMap/BodyMap';
import { getVolumeThresholds, getMuscleParams } from '../utils/muscle/hypertrophy/muscleParams';
import { MUSCLE_NAMES } from '../utils/muscle/mapping/muscleHeadless';
import { STRENGTH_STANDARDS, calculate1RM, getStrengthLevel, STRENGTH_LEVEL_COLORS } from '../utils/muscle/strengthStandards';
"""

output = imports + '\n' + exercise_mapping + '\n\n'
output += 'function CalendarTab() {\n' + history_comp + '\n}\n\n'
output += 'function AnalyticsTab() {\n' + analysis_comp + '\n}\n\n'

main_comp = """export default function ProgressHub() {
  const [activeTab, setActiveTab] = useState('calendar');

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-0">
        {[
          { id: 'calendar',   label: 'Calendar',   icon: <CalendarDays size={16}/> },
          { id: 'analytics',  label: 'Analytics',  icon: <BarChart2 size={16}/> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold tracking-wide transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-gym-blue text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'calendar' && <CalendarTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
    </div>
  );
}
"""

output += main_comp

with open('frontend/src/pages/ProgressHub.jsx', 'w', encoding='utf-8') as f:
    f.write(output)
print("ProgressHub created!")
