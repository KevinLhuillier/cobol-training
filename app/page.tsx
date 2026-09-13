import Link from "next/link";
import { LogoCtIcon } from "@/components/logo-ct-icon";

export default function HomePage() {
  return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center justify-center px-4">
        <LogoCtIcon className="h-16 w-auto mb-10" />

        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight text-center leading-tight mb-10">
          Learn the past, Build the future
        </h1>

        <Link
            href="/auth/login"
            className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm font-bold h-12 px-6 text-base transition-colors"
        >
          Login
        </Link>
      </div>
  );
}
