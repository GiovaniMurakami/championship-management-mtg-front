import React from "react";
import { Link } from "react-router-dom";

export default function TeamCard({ time }) {
    return (
        <article className="border rounded-lg p-4 bg-[rgba(255,255,255,0.02)]">
            <div className="flex items-center gap-3">
                {time.logoUrl ? (
                    <img src={time.logoUrl} alt={time.nome} className="w-12 h-12 object-cover rounded" />
                ) : (
                    <div className="w-12 h-12 rounded bg-[rgba(167,79,255,0.12)] flex items-center justify-center font-bold">{time.tag || "T"}</div>
                )}
                <div>
                    <h3 className="text-lg font-semibold">{time.nome}</h3>
                    <div className="text-sm text-[#beafd7]">{time.membros?.length || 0} membros</div>
                </div>
            </div>
            <div className="mt-3 flex gap-2">
                <Link to={`/time/${time.id}`} className="text-sm text-[#c795ff]">Ver</Link>
            </div>
        </article>
    );
}
