import Navbar from "@/components/Navbar";
export default function Home() {
  return (
     <main className="min-h-screen w-full overflow-x-hidden bg-[#07111f] text-white">
       <Navbar />

      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center px-6 pt-24 text-center">  
        <p className="mb-4 min-w-[200px] rounded-full border border-cyan-400/30 px-6 py-10 text-sm text-cyan-300">
          Smart Travel Pooling Platform
        </p>

        <h1 className="max-w-4xl text-5x1 font-bold leading-tight md:text-7xl">
          Travel Saathi
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-300">
          Find trusted travel companions, create safe ride pools, and manage
          your journey with confidence.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
           <button className="min-w-[150px] rounded-full bg-cyan-400 px-8 py-8 text-base font-semibold text-black hover:bg-cyan-300">
            Find a Ride
            </button>

        <button className="min-w-[150px] rounded-full border border-white/20 px-8 py-8 text-base font-semibold hover:bg-white/10">
        Create Ride
        </button>
        </div>
      </section>
    </main>
  );
} 