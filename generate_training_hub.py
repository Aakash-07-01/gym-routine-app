import re
import os

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

routine = read_file('frontend/src/pages/Routine.jsx')
prs = read_file('frontend/src/pages/PRs.jsx')
templates = read_file('frontend/src/pages/Templates.jsx')

# Extract components from Routine
sortable_ex = re.search(r'(function SortableExercise.*?)\nexport default function Routine', routine, re.DOTALL).group(1)
routine_comp = re.search(r'export default function Routine\(\) \{(.*?)\n}\n', routine, re.DOTALL).group(1)

# Extract from PRs
prs_comp = re.search(r'export default function PRs\(\) \{(.*?)\n}\n', prs, re.DOTALL).group(1)

# Extract from Templates
templates_comp = re.search(r'export default function Templates\(\) \{(.*?)\n}\n', templates, re.DOTALL).group(1)

imports = """import { useState, useEffect } from 'react';
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, CheckCircle, Circle, PlayCircle, X, ChevronDown, ChevronUp, Plus, Copy, Edit2, Trash2, Calendar, Trophy, LayoutList } from 'lucide-react';
import useGymStore from '../store/gymStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import YoutubeModal from '../components/YoutubeModal';
import Confetti from 'react-confetti';
import { Link, useNavigate } from 'react-router-dom';
import RestDay from '../components/RestDay';
import { defaultSplits } from '../data/defaultSplits';
import CardioPromptModal from '../components/CardioPromptModal';
"""

output = imports + '\n' + sortable_ex + '\n\n'
output += 'function TodayTab() {\n' + routine_comp + '\n}\n\n'
output += 'function PRsTab() {\n' + prs_comp + '\n}\n\n'
output += 'function RoutinesTab() {\n' + templates_comp + '\n}\n\n'

main_comp = """export default function TrainingHub() {
  const [activeTab, setActiveTab] = useState('today');

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-0">
        {[
          { id: 'today', label: "Today's Workout", icon: <Calendar size={16}/> },
          { id: 'prs',   label: 'Personal Records', icon: <Trophy size={16}/> },
          { id: 'routines', label: 'Routines', icon: <LayoutList size={16}/> },
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

      {activeTab === 'today' && <TodayTab />}
      {activeTab === 'prs' && <PRsTab />}
      {activeTab === 'routines' && <RoutinesTab />}
    </div>
  );
}
"""

output += main_comp

with open('frontend/src/pages/TrainingHub.jsx', 'w', encoding='utf-8') as f:
    f.write(output)
print("TrainingHub created!")
