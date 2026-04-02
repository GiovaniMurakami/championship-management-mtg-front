import React, { useState } from "react";
import { criarTime } from "../../services/backendApi";
import { ImageUploader } from "../ui";

export default function TeamCreateModal({ isOpen, onClose, token, onCreated }) {
    const [form, setForm] = useState({ nome: "", tag: "", logoUrl: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await criarTime(form, token);
            setForm({ nome: "", tag: "", logoUrl: "" });
            onCreated?.();
            onClose();
        } catch (err) {
            setError(err.message || "Erro ao criar time");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[60] grid place-items-center bg-[rgba(5,3,9,0.72)] backdrop-blur-sm"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <section className="w-[min(520px,calc(100vw-1.4rem))] border border-[rgba(217,180,255,0.2)] rounded-2xl bg-[#160e2d] p-4">
                <h2 className="mb-4">Criar Time</h2>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                    <label className="grid gap-1">
                        Nome
                        <input required value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} className="px-3 py-2 rounded bg-white/[0.03] text-white" />
                    </label>
                    <label className="grid gap-1">
                        Tag (2-4 chars)
                        <input required value={form.tag} onChange={(e) => setForm((p) => ({ ...p, tag: e.target.value }))} className="px-3 py-2 rounded bg-white/[0.03] text-white" />
                    </label>

                    <ImageUploader value={form.logoUrl} onChange={(url) => setForm((p) => ({ ...p, logoUrl: url }))} uploadType="logo-time" label="Logo do Time (opcional)" />

                    {error && <div className="text-red-400">{error}</div>}

                    <div className="flex gap-2">
                        <button disabled={loading} className="flex-1 bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white px-4 py-2 rounded">{loading ? 'Criando...' : 'Criar'}</button>
                        <button type="button" onClick={onClose} className="flex-1 border rounded px-4 py-2">Cancelar</button>
                    </div>
                </form>
            </section>
        </div>
    );
}
