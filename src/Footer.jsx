const Footer = () => {
 const year = new Date().getFullYear();

 return (
 <footer className="fixed left-0 right-0 bottom-0 h-12 bg-white border-t border-gray-300 flex items-center justify-center px-6 box-border z-40 lg:left-[220px]">
 <div className="text-center">
 <span className="text-[11px] sm:text-xs text-gray-500 tracking-[0.02em] whitespace-nowrap">
 © {year}{" "}
 <span className="text-gray-700 font-semibold">
 <span style={{ color:'var(--color-brand-primary)' }}>OTU</span>
 <span className="text-black">.hub · All Rights Reserved</span>
 </span>
 </span>
 </div>
 </footer>
 );
};

export default Footer;
 