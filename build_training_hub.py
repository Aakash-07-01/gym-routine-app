import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

routine = read_file('frontend/src/pages/Routine.jsx')
prs = read_file('frontend/src/pages/PRs.jsx')
templates = read_file('frontend/src/pages/Templates.jsx')

def extract_imports(text):
    return re.findall(r'^import .*?;', text, re.MULTILINE)

all_imports = set(extract_imports(routine) + extract_imports(prs) + extract_imports(templates))
imports_str = '\n'.join(all_imports)

routine_body = re.search(r'(function SortableExercise.*?)\nexport default function Routine\(\) \{(.*?)\n}\n', routine, re.DOTALL)
if not routine_body:
    routine_body = re.search(r'export default function Routine\(\) \{(.*?)\n}\n', routine, re.DOTALL)
    sortable_ex = ''
    routine_inner = routine_body.group(1)
else:
    sortable_ex = routine_body.group(1)
    routine_inner = routine_body.group(2)

prs_inner = re.search(r'export default function PRs\(\) \{(.*?)\n}\n', prs, re.DOTALL).group(1)
templates_inner = re.search(r'export default function Templates\(\) \{(.*?)\n}\n', templates, re.DOTALL).group(1)

out = f'''{imports_str}
import {{ Calendar, Trophy, LayoutList }} from 'lucide-react';

{sortable_ex}

function TodayTab() {{
{routine_inner}
}}

function PRsTab() {{
{prs_inner}
}}

function RoutinesTab() {{
{templates_inner}
}}

const TABS = [
  {{ id: 'today',    label: "Today's Workout", icon: Calendar }},
  {{ id: 'prs',      label: 'Personal Records', icon: Trophy }},
  {{ id: 'routines', label: 'Routines',          icon: LayoutList }},
];

export default function TrainingHub() {{
  const [active, setActive] = useState('today');
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
      {{active === 'today'    && <TodayTab />}}
      {{active === 'prs'      && <PRsTab />}}
      {{active === 'routines' && <RoutinesTab />}}
    </div>
  );
}}
'''
with open('frontend/src/pages/TrainingHub.jsx', 'w', encoding='utf-8') as f:
    f.write(out)
print('TrainingHub created')
