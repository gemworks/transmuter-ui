/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XIcon } from '@heroicons/react/outline'
import { PublicKey } from "@solana/web3.js";
import {TransmuterWrapper} from "@gemworks/transmuter-ts";
import { RarityConfig, WhitelistType } from "@gemworks/gem-farm-ts";
import { PlusIcon } from "@heroicons/react/solid";
import {Icon} from "../components/Icon";
interface SlideOverProps {
  open: boolean,
  bankPk: string,
  transmuterWrapper: TransmuterWrapper,
  toggleState: () => void;
  addToWhitelist: () => void,
	removeFromWhitelist: () => void,
	addRarities: () => void
}






export default function SlideOver({open, toggleState, bankPk, addToWhitelist, removeFromWhitelist, addRarities, transmuterWrapper}: SlideOverProps) {
console.log("bank",bankPk)
  


// const parseWhitelistType = (numType: number) => {
//   switch (numType) {
//     case 1:
//       return 'Creator';
//     case 2:
//       return 'Mint';
//     case 3:
//       return 'Mint + Whitelist';
//     default:
//       return 'unknown';
//   }
// };
async function addToWhiteList_() {
  const {tx} = await transmuterWrapper.addToBankWhitelist(
    new PublicKey(bankPk),
    new PublicKey("SLNTvrwEnq9tYevoyvXmRksRUAEVWCWPsyngJghVNqX"),
    WhitelistType.Mint
  );
  const {response} = await tx.confirm();
  console.log(response.transaction.signatures[0]);


}
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 overflow-hidden" onClose={toggleState}>
        <div className="absolute inset-0 overflow-hidden">
          <Dialog.Overlay className="absolute inset-0" />

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex sm:pl-16">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="w-screen max-w-2xl">
                <div className="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-scroll">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-medium text-gray-900">Bank {bankPk}</Dialog.Title>
                      <div className="ml-3 h-7 flex items-center">
                        <button
                          type="button"
                          className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={toggleState}
                        >
                          <span className="sr-only">Close panel</span>
                          <XIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 relative flex-1 px-4 sm:px-6">
                    {/* Replace with your content */}
                    <div className="absolute inset-0 px-4 sm:px-6">

					

					<button
					onClick={() => {
						addToWhiteList_();
					}}
						type="button"
						className="mt-10 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						<PlusIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
						Button text
					</button>
		<Icon
    mint={"SLNTvrwEnq9tYevoyvXmRksRUAEVWCWPsyngJghVNqX"}/>
                    </div>
                    {/* /End replace */}
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
