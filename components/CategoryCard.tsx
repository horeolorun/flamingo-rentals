
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
    <button
      type="button"
      className="group rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-pink-light hover:shadow-xl hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-soft text-primary transition duration-300 group-hover:bg-primary group-hover:text-white">
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
