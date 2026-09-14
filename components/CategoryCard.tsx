import type { ReactNode } from "react";

type CategoryCardProps = {
  name: string;
  icon: ReactNode;
  description: string;
};

export default function CategoryCard({
  name,
  icon,
  description,
}: CategoryCardProps) {
  return (
    <button className="group rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-100 hover:shadow-xl hover:shadow-purple-900/5">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-[#4f2a91] transition duration-300 group-hover:bg-[#4f2a91] group-hover:text-white">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-gray-900">
        {name}
      </h3>

      <p className="mt-1 text-sm leading-5 text-gray-500">
        {description}
      </p>

    </button>
  );
}