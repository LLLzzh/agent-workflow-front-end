import { useState } from 'react'
import { useDrop, useDrag } from 'react-dnd'
import { Agent,callAgent } from '@/pages/api/apis'
import analyserImg from '@/assets/analyser.png'
import judgeImg from '@/assets/judge.png'
import handlerImg from '@/assets/handler.png'
import painterImg from '@/assets/painter.png'


interface CenterPanelProps {
    agents: Agent[]
}

export default function CenterPanel({ agents }: CenterPanelProps) {
    const [workflowAgents, setWorkflowAgents] = useState<Agent[]>([])
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')

    // Handle dropping agents
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'AGENT',
        drop: (item: Agent) => {
            // 确保获取最新的 workflowAgents 状态
            setWorkflowAgents((prevAgents) => {
                // 如果没有找到相同的 agent，则将其添加到工作流中
                if (!prevAgents.some(agent => agent.id === item.id)) {
                    return [...prevAgents, item]
                } else {
                    console.log(`Agent with id ${item.id} already exists in the workflow`)
                    return prevAgents // 如果已存在，则返回原状态，不做修改
                }
            })
        },
        collect: (monitor) => ({
            isOver: monitor.isOver()
        })
    }))


    // 删除agent
    const deleteAgent = (index: number) => {
        setWorkflowAgents((prevAgents) => prevAgents.filter((_, i) => i !== index))
    }

    // 执行工作流
    const executeWorkflow = async () => {
        let currentInput = input
        for (let i = 0; i < workflowAgents.length; i++) {
            const agent = workflowAgents[i]
            currentInput = await executeAgent(agent, currentInput)
        }
        setOutput(currentInput) // Final output after all agents have been executed
    }

    const executeAgent = async (agent: Agent, input: string) => {
        return new Promise<string>(async (resolve) => {
            const res = await callAgent({
                id: agent.id,
                kind: agent.kind,
                text: input
            })
            console.log ('the result of executing agent',agent.name,'is',res)

            setTimeout(() => {
                console.log(`Agent ${agent.name} processed input: ${input}`)
                resolve(`${input} -> Processed by ${agent.name}`)
            }, 100)
        })
    }

    return (
        <div ref={drop} className="flex flex-col p-4 w-3/4">
            <div className="mb-4">
                <h2 className="text-xl font-bold">我的工作流</h2>
                <div className="border p-4 mt-2">
                    <h3 className="font-semibold">Agent拖拽至此处</h3>
                    <div className={`min-h-[200px] border-dashed border-2 ${isOver ? 'bg-gray-100' : ''}`}>
                        {workflowAgents.length === 0 ? (
                            <p className="text-center text-gray-500">请将Agent拖拽至此处</p>
                        ) : (
                            <div>
                                {workflowAgents.map((agent, index) => (
                                    <DraggableAgent
                                        key={agent.id}
                                        index={index}
                                        agent={agent}
                                        deleteAgent={deleteAgent}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/*Input*/}
            <div className="mb-4">
                <label className="block mb-2">输入</label>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>

            {/*Output*/}
            <div className="mb-4">
                <label className="block mb-2">输出</label>
                <textarea
                    value={output}
                    readOnly
                    className="w-full p-2 border rounded"
                />
            </div>

            {/*Execute Button*/}
            <button
                onClick={executeWorkflow}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                执行工作流
            </button>
        </div>
    )
}

interface DraggableAgentProps {
    agent: Agent
    index: number
    deleteAgent: (index: number) => void
}

const kindData = ['Analyser', 'Judge', 'Handler', 'Painter']
const kindAvatarSrc = [analyserImg, judgeImg, handlerImg, painterImg]
function DraggableAgent({ agent, index, deleteAgent }: DraggableAgentProps) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'AGENT',
        item: { index, id: agent.id }, // Ensure only the index and id are passed
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    }), [agent.id, index])

    return (
        <div
            ref={drag}
            className={`flex justify-between items-center mb-2 p-2 border ${isDragging ? 'opacity-50' : ''}`}
        >

            <img className={'w-1/7 rounded '}  src={kindAvatarSrc[agent.kind]} alt=''></img>
            <span className={'w-1/7 font-bold'}>{kindData[agent.kind]}</span>
            <span className='w-1/7 font-bold'>{agent.name}</span>
            <span className={'w-2/3'}>{agent.description}</span>
            <button
                onClick={() => deleteAgent(index)}
                className="text-red-500 hover:text-red-700"
            >
                删除
            </button>
        </div>
    )
}
