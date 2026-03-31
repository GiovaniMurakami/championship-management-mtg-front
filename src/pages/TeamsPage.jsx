import React, { useEffect, useState } from "react";
import { listarTimes } from "../services/teamApi";
import TeamCard from "../components/team/TeamCard";
import httpClient from "../services/httpClient";

export default function TeamsPage() {
    const [times, setTimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await listarTimes();
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
        <section className="p-4 max-w-5xl mx-auto">
            <h1 className="mb-4 text-2xl">Times</h1>
            {loading && <p>Carregando...</p>}
            {error && <p className="text-red-400">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {times.map((t) => (
                    <TeamCard key={t.id} time={t} />
                ))}
            </div>
        </section>
    );
}
