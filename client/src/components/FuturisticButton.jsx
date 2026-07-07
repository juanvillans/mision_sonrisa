export default function FuturisticButton({ children, onClick }) {
  return (
    <button type="button" className="button" onClick={onClick}>
      <span style={{ padding: "1px", fontSize: "17px", letterSpacing: "1px", fontWeight: "bold" }}>
        {children}

      </span>
    </button>
  );
}
