import Link from "next/link";

import { FC, useState } from "react";
import { Disclosure } from "@headlessui/react";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAutoConnect } from "../contexts/AutoConnectProvider";
// Wallet
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";
function classNames(...classes) {
	return classes.filter(Boolean).join(" ");
}

export const AppBar: FC = (props) => {
	const router = useRouter();
	return (
		<Disclosure as="nav" className="bg-white shadow">
			{({ open }) => (
				<>
					<div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
						<div className="relative flex justify-between h-16">
							<div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
								<div className="flex-shrink-0 flex items-center text-4xl">
									<Link href="/">
										<img src="/images/gem.png" className="block h-12 w-auto cursor-pointer" alt="gemworks_transmuter" />
									</Link>
								</div>
								<div className="hidden sm:ml-6 sm:flex sm:space-x-8">
									{/* Current: "border-indigo-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
									<Link href="/transmuters">
										<span
											className={` text-gray-900 hover:text-indigo-500 transition-all duration-150 ease-in inline-flex items-center px-1 pt-1  text-sm font-medium cursor-pointer ${
												router.pathname === "/transmuters" && "border-indigo-500 border-b-2"
											}`}
										>
											Transmuters
										</span>
									</Link>
								</div>
							</div>
							<div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
								{/* Wallet & Settings */}
								{/* <div className="navbar-end bordered">
          <div className="dropdown">
            <div tabIndex={0} className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <ul tabIndex={0} className="p-2 shadow menu dropdown-content bg-base-100 rounded-box w-52">
              <li>
                <div className="form-control">
                  <label className="cursor-pointer label">
                    <a>Autoconnect</a>
                    <input type="checkbox" checked={autoConnect} onChange={(e) => setAutoConnect(e.target.checked)} className="toggle" />
                  </label>
                </div>
              </li>
              <li>
                <a>Slippage (pending)</a>
              </li>
              <li>
                <a>Setting 3</a>
              </li>
            </ul>
          </div>
		
        </div> */}
							{process.env.NEXT_PUBLIC_CLUSTER.toUpperCase() === "DEVNET" &&	<span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800">Devnet</span>}
								<WalletMultiButton className="btn btn-ghost text-gray-900" />
							</div>
						</div>
					</div>
				</>
			)}
		</Disclosure>
	);
};
