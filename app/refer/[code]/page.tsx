// import { ReferralLanding } from '@/components/referral-landing'

import { ReferralLanding } from "@/components/referral-landing"

interface ReferralPageProps {
  params: {
    code: string
  }
}

export default function ReferralPage({ params }: ReferralPageProps) {
  return <ReferralLanding referralCode={params.code} />
}