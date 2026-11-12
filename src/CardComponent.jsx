const CardComponent = ({
  image = "https://picsum.photos/seed/otu/320/180",
  name = "User",
  subject = "Subject",
  description = "",
}) => {
  return (
    <article
      className="bg-white border rounded-2xl overflow-hidden w-full flex flex-col transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex-shrink-0">
        <img
          src={image}
          alt={name}
          className="w-full h-44 object-cover block"
          style={{ borderBottom: "1px solid var(--color-border-primary)" }}
        />
      </div>

      <div className="px-5 py-4 flex flex-col gap-1.5 min-h-0 min-w-0">
        <h3 className="m-0 text-base font-bold text-gray-900 leading-snug break-words">
          {name}
        </h3>

        <span
          className="text-xs font-semibold tracking-[0.06em] uppercase"
          style={{ color: "var(--color-brand-primary)" }}
        >
          {subject}
        </span>

        {description ? (
          <p className="m-0 mt-1 text-sm text-gray-600 leading-relaxed whitespace-normal break-words w-full">
            {description}
          </p>
        ) : null}
      </div>
    </article>
  );
};

export default CardComponent;
