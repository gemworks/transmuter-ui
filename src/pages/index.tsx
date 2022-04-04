import type { NextPage } from "next";
import Head from "next/head";
import { ChevronRightIcon, StarIcon } from "@heroicons/react/outline";
import Link from "next/link";

const Home: NextPage = (props) => {
	return (
		<div>
			<Head>
				<title>GemWorks - Transmuter</title>
			</Head>
			<div className="bg-white pb-8 sm:pb-12 lg:pb-12 min-h-screen">
				<div className="pt-8 overflow-hidden sm:pt-12 lg:relative lg:py-48">
					<div className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:px-8 lg:max-w-7xl lg:grid lg:grid-cols-2 lg:gap-24">
						<div>
							<div>
								<img className="h-14 w-auto" src="/images/gem.png" alt="Gemworks" />
							</div>
							<div className="mt-10">
								<div>
									<a href="#" className="inline-flex space-x-4">
										<span className="rounded bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 tracking-wide uppercase">
											What's new
										</span>
										<a
											href="https://docs.gemworks.gg/transmuter/overview"
											target="_blank"
											className="inline-flex items-center text-sm font-medium text-indigo-600 space-x-1 hover:text-indigo-500 transition ease-in duration-150"
										>
											<span>Read the docs</span>
											<ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
										</a>
									</a>
								</div>
								<div className="mt-6 sm:max-w-xl">
									<h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
										The all-in-one toolset for NFT projects
									</h1>
									<p className="mt-6 text-xl text-gray-500">Stake, Swap, Merge, Split, Breed, Burn, Escrow & much more.</p>
								</div>
								<div className="mt-12 sm:max-w-lg sm:w-full sm:flex">
									<div>
										<Link href="/transmuters">
											<button className="block w-full rounded-md border border-transparent px-5 py-3 bg-indigo-600 text-base font-medium text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:px-10 ease-in duration-150 transition-all">
												Get started
											</button>
										</Link>
									</div>
								</div>
								<div className="mt-6">
									<div className="inline-flex items-center divide-x  divide-gray-300  text-sm text-gray-500 min-w-medium ">
										<div className="inline-flex items-center py-2 pr-5">
											<span className="font-medium">powered by</span>
											<img src="/images/solana_full.png" className="h-3 w-auto pl-2" />
										</div>

										<div className="space-x-2 inline-flex items-center pl-5">
											<span className="font-medium">built by</span>
											<a
												className="text-indigo-600 hover:text-indigo-500 transition ease-in duration-150"
												href="https://twitter.com/_ilmoi"
												target="_blank"
											>
												@_ilmoi
											</a>
											<span className="font-medium">&</span>
											<a
												className="text-indigo-600 hover:text-indigo-500 transition ease-in duration-150"
												href="https://twitter.com/manzgoeggel"
												target="_blank"
											>
												@manzgoeggel
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="sm:mx-auto sm:max-w-3xl sm:px-6">
						<div className="py-12 sm:relative sm:mt-12 sm:py-16 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 fixed">
							<div className="hidden sm:block">
								<div className="absolute inset-y-0 left-1/2 w-screen bg-gray-50 rounded-l-3xl lg:left-80 lg:right-0 lg:w-full" />
								<svg className="absolute top-8 right-1/2 -mr-3 lg:m-0 lg:left-0" width={404} height={392} fill="none" viewBox="0 0 404 392">
									<defs>
										<pattern id="837c3e70-6c3a-44e6-8854-cc48c737b659" x={0} y={0} width={20} height={20} patternUnits="userSpaceOnUse">
											<rect x={0} y={0} width={4} height={4} className="text-gray-200" fill="currentColor" />
										</pattern>
									</defs>
									<rect width={404} height={392} fill="url(#837c3e70-6c3a-44e6-8854-cc48c737b659)" />
								</svg>
							</div>
							<div className="relative pl-4 -mr-40 sm:mx-auto sm:max-w-3xl sm:px-0 lg:max-w-none lg:h-full lg:pl-12">
								<img
									className="w-full rounded-md shadow-xl ring-1 ring-black ring-opacity-5 lg:h-full lg:w-auto lg:max-w-none"
									src="/images/transmuter_screenshot.png"
									alt=""
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Home;
