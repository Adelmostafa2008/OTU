const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="fixed left-[220px] right-0 bottom-0 h-12 bg-white border-t border-gray-200 flex items-center justify-center px-6 box-border z-40">
      <div className="text-center">
        <span className="text-xs text-gray-500 tracking-[0.02em]">
          © {year}{" "}
          <span className="text-gray-700 font-semibold">
            <span className="text-teal-400">OTU</span>
            <span className="text-black">.hub</span>
          </span>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
