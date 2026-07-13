export default function FuturisticButton({ children, onClick }) {
  return (
    <button type="button" className="button max-w-content" onClick={onClick} style={{width: "max-content"}} >
      <span style={{ padding: "1px", fontSize: "17px", letterSpacing: "1px", fontWeight: "bold", width: "max-content" }}>
        {children}

      </span>
    </button>
  );
}
