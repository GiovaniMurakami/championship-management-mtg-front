export function Skeleton({ width, height, radius = "0.5rem", className = "" }) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{ width, height, borderRadius: radius }}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <Skeleton width="100%" height="180px" radius="0" />
            <div className="skeleton-card-body">
                <Skeleton width="70%" height="1.2rem" />
                <Skeleton width="40%" height="0.9rem" />
                <div className="skeleton-card-row">
                    <Skeleton width="45%" height="0.9rem" />
                    <Skeleton width="45%" height="0.9rem" />
                </div>
                <Skeleton width="55%" height="0.85rem" />
                <div className="skeleton-card-row">
                    <Skeleton width="48%" height="2.2rem" radius="0.6rem" />
                    <Skeleton width="48%" height="2.2rem" radius="0.6rem" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonTorneioCard() {
    return (
        <div className="skeleton-torneio">
            <Skeleton width="60%" height="1.3rem" />
            <Skeleton width="40%" height="0.9rem" />
            <Skeleton width="50%" height="0.9rem" />
            <Skeleton width="35%" height="0.9rem" />
            <Skeleton width="45%" height="0.9rem" />
            <div className="skeleton-card-row" style={{ marginTop: "0.5rem" }}>
                <Skeleton width="100px" height="2rem" radius="0.6rem" />
            </div>
        </div>
    );
}

export function SkeletonTournamentDetail() {
    return (
        <div className="skeleton-td">
            <Skeleton width="200px" height="1rem" radius="0.4rem" />
            <div className="skeleton-td-header">
                <Skeleton width="60%" height="2rem" />
                <div className="skeleton-card-row">
                    <Skeleton width="80px" height="1.6rem" radius="999px" />
                    <Skeleton width="100px" height="1.6rem" radius="999px" />
                    <Skeleton width="90px" height="1.6rem" radius="999px" />
                </div>
            </div>
            <div className="skeleton-td-content">
                <div className="skeleton-td-main">
                    <Skeleton width="100%" height="200px" radius="0.75rem" />
                    <Skeleton width="100%" height="160px" radius="0.75rem" />
                </div>
                <div className="skeleton-td-side">
                    <Skeleton width="100%" height="300px" radius="0.75rem" />
                </div>
            </div>
        </div>
    );
}
