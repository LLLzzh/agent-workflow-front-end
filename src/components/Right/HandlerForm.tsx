import { CreateAgentData, HandleAgent, PainterAgent } from '@/pages/api/apis'

export default function HandlerForm({ formData, setFormData }: { formData: Partial<HandleAgent>, setFormData: (data: Partial<HandleAgent>) => void }) {
    return (
        <div>
            <div className="mb-4">
                <label className="block mb-2">代码块</label>
                <input
                    type="text"
                    value={formData.deal || ''}
                    onChange={e => setFormData({ ...formData, deal: e.target.value })}
                    className="w-full p-2 border rounded"
                />
            </div>
        </div>
    )
} 