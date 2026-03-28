export function Spinner({ size = 36, text }) {
    return (
        <div className="spinner-container">
            <div className="spinner" style={{ width: size, height: size }} />
            {text && <p className="spinner-text">{text}</p>}
        </div>
    );
}
