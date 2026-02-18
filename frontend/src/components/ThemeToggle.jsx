const ThemeToggle = ({ dark, setDark }) => {
  return (
    <button className="btn border" onClick={() => setDark((p) => !p)}>
      {dark ? "Light" : "Dark"}
    </button>
  );
};

export default ThemeToggle;
