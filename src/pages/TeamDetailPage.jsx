import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { buscarTime } from "../services/backendApi";

export default function TeamDetailPage() {
    const { id } = useParams();
    const [time, setTime] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await buscarTime(id);
                setTime(data);
            } catch (err) {
                setError(err.message || "Erro ao buscar time");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetch();
    }, [id]);

    if (loading) return <p className="p-4">Carregando...</p>;
    if (error) return <p className="p-4 text-red-400">{error}</p>;
    if (!time) return <p className="p-4">Time não encontrado.</p>;

    return (
        <section className="p-4 max-w-4xl mx-auto">
            <header className="flex items-center gap-4">
                {time.logoUrl ? (
                    <img src={time.logoUrl} alt={time.nome} className="w-20 h-20 object-cover rounded" />
                ) : (
                    <div className="w-20 h-20 rounded bg-[rgba(167,79,255,0.12)] flex items-center justify-center font-bold">{time.tag}</div>
                )}
                <div>
                    <h1 className="text-2xl font-semibold">{time.nome}</h1>
                    <div className="text-sm text-[#beafd7]">Tag: {time.tag}</div>
                </div>
            </header>

            <section className="mt-6">
                <h2 className="text-lg font-semibold">Membros</h2>
                <ul className="mt-2 space-y-2">
                    {(time.membros || []).map((m) => (
                        <li key={m.id} className="border p-2 rounded">{m.nome} ({m.email})</li>
                    ))}
                </ul>
            </section>
        </section>
    );
}
