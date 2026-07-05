import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

history = read_file('frontend/src/pages/History.jsx')
analysis = read_file('frontend/src/pages/DataAnalysis.jsx')

def extract_imports(text):
    return re.findall(r'^import .*?;', text, re.MULTILINE)

all_imports = set(extract_imports(history) + extract_imports(analysis))
imports_str = '\n'.join(all_imports)

history_inner = re.search(r'export default function History\(\) \{(.*?)\n}\n', history, re.DOTALL).group(1)
analysis_inner = re.search(r'export default function DataAnalysis\(\) \{(.*?)\n}\n', analysis, re.DOTALL).group(1)

# analysis may have EXERCISE_TO_MUSCLE_ID defined outside
exercise_mapping = re.search(r'(const EXERCISE_TO_MUSCLE_ID = {.*?};)\n', analysis, re.DOTALL)
exercise_mapping_str = exercise_mapping.group(1) if exercise_mapping else ''

out = f'''{imports_str}
import {{ CalendarDays, BarChart2 }} from 'lucide-react';

{exercise_mapping_str}

function CalendarTab() {{
{history_inner}
}}

function AnalyticsTab() {{
{analysis_inner}
}}

const TABS = [
  {{ id: 'calendar',  label: 'Calendar',  icon: CalendarDays }},
  {{ id: 'analytics', label: 'Analytics', icon: BarChart2 }},
];

export default function ProgressHub() {{
  const [active, setActive] = useState('calendar');
  return (
    <div className="pb-12">
      <div className="flex gap-1 mb-6 border-b border-white/10">
        {{TABS.map(({{ id, label, icon: Icon }}) => (
          <button
            key={{id}}
            onClick={{() => setActive(id)}}
            className={{`flex items-center gap-2 px-4 py-3 text-sm font-semibold tracking-wide transition-all border-b-2 -mb-px ${{
              active === id
                ? 'border-gym-blue text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }}`}}
          >
            <Icon size={{15}} /> {{label}}
          </button>
        ))}}
      </div>
      {{active === 'calendar'  && <CalendarTab />}}
      {{active === 'analytics' && <AnalyticsTab />}}
    </div>
  );
}}
'''

with open('frontend/src/pages/ProgressHub.jsx', 'w', encoding='utf-8') as f:
    f.write(out)
print('ProgressHub created')
