import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";


export default function PostsPage() {
  const response = fetch("https://jsonplaceholder.typicode.com/posts"); 
  return (
    <div className="space-y-8">
    <section className="space-y-4">
      <h1 className="text-center text-4xl font-semibold text-zinc-950 sm:text-5xl">
        Welcome to the blog page -Posts
      </h1>
    </section> 
    </div> 
  );
}