import { useDrop } from 'react-dnd'
import { Agent } from '@/pages/api/apis'

interface CenterPanelProps {
    sequence: Agent[]
    setSequence: (agents: Agent[]) => void
    onExecute: () => Promise<void>
}

export default function CenterPanel({ sequence, setSequence, onExecute }: CenterPanelProps) {
    const [{ isOver }, drop] = useDrop<Agent, void, { isOver: boolean }>(() => ({
        accept: 'AGENT',
        drop: (item: Agent, monitor) => {
            const dropIndex = Math.floor(monitor.getClientOffset()?.y / 50)
            const validIndex = Math.min(dropIndex, sequence.length)  // 保证 dropIndex 合理
            const newSequence = [...sequence]
            newSequence.splice(validIndex, 0, item)  // 插入到指定位置
            setSequence(newSequence)
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }))

    return (
        <div ref={drop} className="flex-1 p-4 border-r">
            <div className="mb-4">
                <button
                    onClick={onExecute}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    执行
                </button>
            </div>
            <div className="space-y-2">
                {sequence.map((agent, index) => (
                    <AgentSequenceItem
                        key={index}
                        agent={agent}
                        onRemove={() => {
                            const newSequence = [...sequence]
                            newSequence.splice(index, 1)
                            setSequence(newSequence)
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

function AgentSequenceItem({ agent, onRemove }: { agent: Agent, onRemove: () => void }) {
    return (
        <div className="p-4 border rounded flex justify-between items-center">
            <div>
                <h3 className="font-bold">{agent.name}</h3>
                <p className="text-sm">{agent.description}</p>
            </div>
            <button onClick={onRemove} className="text-red-500">删除</button>
        </div>
    )
}
