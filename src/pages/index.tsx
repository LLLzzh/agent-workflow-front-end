import { useState } from 'react'
import LeftPanel from '@/components/LeftPanel'
import RightPanel from '@/components/RightPanel'
import { Agent } from './api/apis'

export default function Home() {
  const [executionResults, setExecutionResults] = useState<string[]>([])
  const [sequence, setSequence] = useState<Agent[]>([])

  return (
    <div className="flex h-screen">
      <LeftPanel results={executionResults} />
      <RightPanel onAgentAdd={(agent: Agent) => {
        // 添加agent到右侧面板逻辑
      }} />
    </div>
  )
}
