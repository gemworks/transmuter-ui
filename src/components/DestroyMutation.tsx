/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useRef, useState, useEffect } from "react";
import { Menu, Transition, Dialog } from '@headlessui/react'
import { DotsVerticalIcon } from '@heroicons/react/solid'
import { ExclamationIcon } from "@heroicons/react/outline";
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

interface DestroyMutationProps {
    destroyMutation: () => void;
	mutationName: string;
}

interface DestroyMutationModalProps extends DestroyMutationProps  {
    isOpen: boolean;
	toggleModal: () => void;
    
}
function DestroyMutationModal({isOpen, toggleModal, destroyMutation, mutationName}: DestroyMutationModalProps) {
    const cancelButtonRef = useRef(null);
    return (
        <>
	

			<Transition.Root show={isOpen} as={Fragment}>
				<Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={() => {
          toggleModal();
    
        }}>
					<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0"
							enterTo="opacity-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
						</Transition.Child>

						{/* This element is to trick the browser into centering the modal contents. */}
						<span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
							&#8203;
						</span>
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
							enterTo="opacity-100 translate-y-0 sm:scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 translate-y-0 sm:scale-100"
							leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						>
							<div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
								<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
									<div className="sm:flex sm:items-start">
										<div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
											<ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
										</div>
										<div className="my-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
											<Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
												Destroy Mutation - "<span className="uppercase">{mutationName}</span>"
											</Dialog.Title>
											<div className="">
												<p className="text-sm text-gray-500 my-2">Are you sure you want to destroy "<span className="uppercase">{mutationName}</span>"? This action cannot be undone.</p>
											
											</div>
										</div>
									</div>
								</div>
								<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ">
									<button
			
										type="button"
										className="transition-all duration-150 ease-in disabled:opacity-50 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
										onClick={destroyMutation}
									>
										Destroy Mutation
									</button>
									<button
										type="button"
										className="transition-all duration-150 ease-in mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
										onClick={() => {toggleModal()}}
										ref={cancelButtonRef}
									>
										Cancel
									</button>
								</div>
							</div>
						</Transition.Child>
					</div>
				</Dialog>
			</Transition.Root>
            </>
    )
}

export default function DestroyMutation({destroyMutation, mutationName}: DestroyMutationProps) {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    function toggleModalOpen(): void {
		if (modalIsOpen) {
			setModalIsOpen(false);
		} else {
			setModalIsOpen(true);
		}
	}
  return (
      <>
      <DestroyMutationModal

      isOpen={modalIsOpen}
      toggleModal={toggleModalOpen}
      destroyMutation={destroyMutation}
	  mutationName={mutationName}

      />
    <Menu as="div" className="relative inline-block text-left">

      <div>
        <Menu.Button className="rounded-full flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
          <span className="sr-only">Open options</span>
          <DotsVerticalIcon className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <span
                  onClick={() => {toggleModalOpen()}}
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'block px-4 py-2 text-sm'
                  )}
                >
                  Destroy Mutation
                </span>
              )}
            </Menu.Item>
           
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
    </>
  )
}
