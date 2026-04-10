'use client'

import ApiKeyManager from '@/components/ApiKeys/ApiKeyManager'
import { Section } from './SettingsUI'

export default function ApiKeysSection() {
  return (
    <div>
      <Section title="Developer">
        <div className="p-4">
          <ApiKeyManager />
        </div>
      </Section>
    </div>
  )
}
