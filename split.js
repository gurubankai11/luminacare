import fs from 'fs';
import path from 'path';

const file = fs.readFileSync('src/pages/patient/PatientDashboard.tsx', 'utf8');

const components = [
  'Sidebar', 'DashboardHome', 'AppointmentsSection', 'QueueSection', 
  'MedicinesSection', 'ReportsSection', 'ChatSection', 'NotificationsSection', 
  'ProfileSection', 'SettingsDashSection'
];

const dir = 'src/pages/patient/components';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const IMPORTS = `import { useState, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Clock, Pill, FileText, MessageSquare,
  Bell, Settings, User, LogOut, Activity,
  CheckCircle, AlertCircle, XCircle, Download, Send, Paperclip,
  Menu, X
} from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'
import { Avatar, Badge } from '../../../components/ui'
import Card, { StatCard } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { useChatStore } from '../../../stores/chatStore'
import { useNotificationStore } from '../../../stores/notificationStore'
import { useAppointmentStore } from '../../../stores/appointmentStore'
import { useMedicalStore } from '../../../stores/medicalStore'
import { cn, formatDate, formatTime } from '../../../lib/utils'

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', variant: 'accent' as const, icon: CheckCircle },
  completed: { label: 'Completed', variant: 'success' as const, icon: CheckCircle },
  pending: { label: 'Pending', variant: 'warning' as const, icon: AlertCircle },
  cancelled: { label: 'Cancelled', variant: 'danger' as const, icon: XCircle },
}
`;

let remainingFile = file;
const extractedNames = [];

components.forEach(comp => {
  const regex = new RegExp(`function ${comp}\\s*\\([^{]*\\)\\s*{[\\s\\S]*?^}`, 'm');
  const match = remainingFile.match(regex);
  if (match) {
    let content = match[0];
    // Find the actual end of the function by counting braces
    let openBraces = 0;
    let endIndex = match.index;
    let started = false;
    for (let i = match.index; i < remainingFile.length; i++) {
        if (remainingFile[i] === '{') { openBraces++; started = true; }
        if (remainingFile[i] === '}') { openBraces--; }
        if (started && openBraces === 0) {
            endIndex = i + 1;
            break;
        }
    }
    content = remainingFile.substring(match.index, endIndex);
    
    // Write to file
    fs.writeFileSync(path.join(dir, `${comp}.tsx`), IMPORTS + '\nexport ' + content);
    
    // Replace in original
    remainingFile = remainingFile.substring(0, match.index) + remainingFile.substring(endIndex);
    extractedNames.push(comp);
  }
});

// Now add imports to the top of remaining file
const navItemsRegex = /const NAV_ITEMS = \[[\s\S]*?\]/;
let finalFile = remainingFile;

const newImports = extractedNames.map(name => `import { ${name} } from './components/${name}'`).join('\n');

finalFile = finalFile.replace(/import {.*?} from 'lucide-react'/, `import {\n  Bell, Menu, X\n} from 'lucide-react'`);

finalFile = finalFile.replace(/import.*?from '..\/..\/components\/ui'.*?\n/g, '');
finalFile = finalFile.replace(/import Card.*?from '..\/..\/components\/ui\/Card'.*?\n/g, '');
finalFile = finalFile.replace(/import Button.*?from '..\/..\/components\/ui\/Button'.*?\n/g, '');
finalFile = finalFile.replace(/import Input.*?from '..\/..\/components\/ui\/Input'.*?\n/g, '');

finalFile = finalFile.replace(/(import { cn.*?from '..\/..\/lib\/utils')/, `$1\n\n${newImports}`);

fs.writeFileSync('src/pages/patient/PatientDashboard.tsx', finalFile);
console.log('Successfully split files');
