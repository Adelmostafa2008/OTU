const CardComponent = ({
  image = "https://picsum.photos/seed/otu/320/180",
  name = "User",
  subject = "Subject",
  description = "",
}) => {
  return (
    <article className="bg-white border border-gray-200 rounded-2xl overflow-hidden w-full max-w-sm shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)] transition-[transform,box-shadow] flex flex-col">
      <div className="flex-0 0 auto">
        <img
          src={image}
          alt={name}
          className="w-full h-40 object-cover block border-b border-gray-200"
        />
      </div>

      <div className="px-4 py-4 sm:px-4 sm:py-4.5 flex flex-col gap-1.5">
        <h3 className="m-0 text-base font-bold text-gray-900 leading-snug">
          {name}
        </h3>

        <span className="text-xs font-semibold tracking-[0.06em] uppercase" style={{ color: 'var(--color-brand-primary)' }}>
          {subject}
        </span>

        {description && (
          <p className="m-0 mt-2 text-sm text-gray-600 leading-relaxed whitespace-normal overflow-hidden">
            {description}
          </p>
        )}
      </div>
    </article>
  );
};

export default CardComponent;
