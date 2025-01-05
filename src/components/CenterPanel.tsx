import { useCallback, useState, useEffect } from 'react'
import { useDrop } from 'react-dnd'
import { Agent, callAgent } from '@/pages/api/apis'
import LeftPanel from "@/components/LeftPanel";
import { ReactFlow, useNodesState, useEdgesState, addEdge, Controls, Background, applyEdgeChanges, applyNodeChanges, type Node, type Edge, type OnConnect, type OnNodesChange, type OnEdgesChange } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import {useRef} from "react";

// 初始化组件
export default function CenterPanel() {
    const [agents,setAgents] = useState<Agent[]>([])
    const [workflowAgents, setWorkflowAgents] = useState<Agent[]>([]); // 用于存储按照顺序排列的工作流
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [currentOutput, setCurrentOutput] = useState<{ id: string, content: string }[]>([{ id: '', content: '' }]);

    // Agent Nodes
    const initialNodes: Node[] = [{ id: '1', data: { label: 'start' }, position: { x: 0, y: 0 }, type: 'input' }];
    const initialEdges: Edge[] = [];

    const [nodes, setNodes] = useNodesState(initialNodes);
    const [edges, setEdges] = useEdgesState(initialEdges);
    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes],
    );
    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges],
    );
    const onConnect: OnConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const agentsRef = useRef<Agent[]>([]);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'AGENT',
        drop: (item: Agent,monitor) => {
            const clientOffset = monitor.getClientOffset();
            if(!clientOffset) return;
            // 将代理添加到 refs 中
            agentsRef.current = [...agentsRef.current, item];
            setNodes((prevNodes) => [
                ...prevNodes,
                { id: item.id, data: { label: item.name }, position: {x: clientOffset.x-700,y: clientOffset.y-300}, type: 'default' }
            ]);

        },
        collect: (monitor) => ({
            isOver: monitor.isOver()
        })
    }));


    useEffect(() => {
        const order = getWorkflowOrder(edges);  // 获取顺序

        // 使用 refs 获取代理数组
        const orderedAgents = order
            .map(id => agentsRef.current.find(agent => agent.id === id))
            .filter(agent => agent);  // 过滤掉未找到的 agent
        setWorkflowAgents(orderedAgents);
    }, [edges]);


    // 执行工作流
    const executeWorkflow = async () => {
        let currentInput = input; // 初始输入
        let finalOutput = ""; // 最终拼接的输出内容

        // 遍历顺序的 workflowAgents 来逐个执行
        for (let i = 0; i < workflowAgents.length; i++) {
            const agent = workflowAgents[i];
            const result = await executeAgent(agent, currentInput);
            finalOutput += result.content;
            currentInput = result.content;

            // 更新每个 agent 的输出
            setCurrentOutput(prev => [
                ...prev,
                { id: agent.id, content: result.content }
            ]);
        }
        setOutput(finalOutput);
    };

    const executeAgent = async (agent: Agent, input: string) => {
        const res = await callAgent({
            id: agent.id,
            kind: agent.kind,
            input: input,
        });

        const reader = res.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let partialContent = "";

        let done = false;
        while (!done) {
            const { value, done: isDone } = await reader.read();
            done = isDone;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter(line => line.trim());

            for (const line of lines) {
                try {
                    const parsedData = JSON.parse(line);
                    if (parsedData.content) {
                        partialContent += parsedData.content;
                        setCurrentOutput([{ id: agent.id, content: partialContent }]);
                    }
                } catch (e) {
                    console.error("Failed to parse line:", line, e);
                }
            }
        }

        return { content: partialContent };
    };

    // 根据edges输出工作流顺序
    const getWorkflowOrder = (edges: Edge[]) => {
        // 构建一个图
        const graph: { [key: string]: string[] } = {};
        const allNodes = new Set<string>();

        // 处理 edges 构建图
        edges.forEach(edge => {
            const { source, target } = edge;
            if (!graph[source]) graph[source] = [];
            graph[source].push(target);
            allNodes.add(source);
            allNodes.add(target);
        });

        // 拓扑排序函数
        const topologicalSort = () => {
            const visited: Set<string> = new Set();
            const result: string[] = [];
            const visit = (node: string) => {
                if (visited.has(node)) return;
                visited.add(node);

                if (graph[node]) {
                    graph[node].forEach(visit);
                }

                result.push(node);
            };

            allNodes.forEach(visit);
            return result.reverse(); // 返回的顺序是从开始到结束
        };

        const order = topologicalSort();
        return order;
    };

    return (
        <>
            <LeftPanel workflowAgents={workflowAgents} currentOutput={currentOutput} />
            <div ref={drop} className="flex flex-col p-4 w-2/3">
                <div className="mb-4">
                    <h2 className="text-xl font-bold">我的工作流</h2>
                    {/* Execute Button */}
                    <button
                        onClick={executeWorkflow}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        执行工作流
                    </button>
                </div>

                {/* Input */}
                <div className="mb-4">
                    <label className="block mb-2">输入</label>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>

                {/* Output */}
                <div className="w-full h-96">
                    <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} minZoom={0.5} maxZoom={2}>
                        <Background />
                        <Controls />
                    </ReactFlow>
                </div>
            </div>
        </>
    );
}
