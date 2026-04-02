import React, { useEffect, useState } from "react";
import { listarTimes } from "../services/backendApi";
import TeamCard from "../components/team/TeamCard";
import TeamCreateModal from "../components/team/TeamCreateModal";
import { useAuth } from "../hooks/useAuth";

export default function TeamsPage() {
    const [times, setTimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const auth = useAuth();

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await listarTimes(auth.token);
                setTimes(data || []);
            } catch (err) {
                setError(err.message || "Erro ao carregar times");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return (
        <>
            <section className="p-4 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl">Times</h1>
                    <div>
                        <button className="px-3 py-2 rounded bg-[rgba(79,70,229,0.9)] text-white" onClick={() => setShowCreate(true)}>Criar Time</button>
                    </div>
                </div>
                {loading && <p>Carregando...</p>}
                {error && <p className="text-red-400">{error}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {times.map((t) => (
                        <TeamCard key={t.id} time={t} />
                    ))}
                </div>
            </section>
            <TeamCreateModal isOpen={showCreate} onClose={() => setShowCreate(false)} token={auth.token} onCreated={() => {
                // refresh list
                (async () => {
                    setLoading(true);
                    try {
                        const data = await listarTimes(auth.token);
                        setTimes(data || []);
                    } catch (e) {
                        console.error(e);
                    } finally {
                        setLoading(false);
                    }
                })();
            }} />
        </>
    );
}
