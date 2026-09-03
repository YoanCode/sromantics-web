import { BriefcaseBusiness, Shield, UserRound } from 'lucide-react'

export const roles = [
  {
    label: '系統管理員',
    value: 'ADMIN',
    icon: Shield,
  },
  {
    label: '行政人員',
    value: 'STAFF',
    icon: BriefcaseBusiness,
  },
  {
    label: '教師',
    value: 'TEACHER',
    icon: UserRound,
  },
] as const
