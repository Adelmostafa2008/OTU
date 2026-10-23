import CardComponent from "./CardComponent";

const HomePage = () => {
  const items = [
    {
      name: "Alex Rivera",
      subject: "Computer Science",
      description:
        "Focusing on distributed systems, cloud infrastructure, and backend reliability engineering.",
    },
    {
      name: "Maya Chen",
      subject: "Interaction Design",
      description:
        "Exploring accessible interfaces and design systems that scale across products and teams.",
    },
    {
      name: "Jonas Bett",
      subject: "Data & Analytics",
      description: "",
    },
  ];

  return (
    <div className="min-h-screen bg-white px-6 sm:px-6 lg:px-6 xl:px-6 2xl:px-6 pb-4 pt-10 box-border">
      <div className="mb-8">
        <h1 className="m-0 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Dashboard
        </h1>
        <p className="m-0 mt-2 text-sm text-gray-500">
          Your overview at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {items.map((item, index) => (
          <CardComponent key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
