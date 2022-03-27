import { Transition } from "@headlessui/react";

interface SkeletonGridCardProps {
	numberOfCards: number;
	showCard: boolean;
}
export default function SkeletonGridCards({ numberOfCards, showCard }: SkeletonGridCardProps) {
	return (
		<>
			<Transition
				show={showCard}
				enter="transition-opacity transition ease-in-out duration-500 sm:duration-700"
				enterFrom="opacity-0"
				enterTo="opacity-100"
				leave="transition-opacity transition ease-in-out duration-500 sm:duration-700"
				leaveFrom="opacity-100"
				leaveTo="opacity-0"
			>
				<ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 lg:grid-cols-6 xl:gap-x-8">
					{[...Array(numberOfCards)].map((e, index) => (
						<li className="relative" key={index}>
							<div className="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-white shadow-sm  animate-pulse focus-within:ring-2  transiton-all duration-150 ease-in overflow-hidden">
								<div className="p-4 space-y-2">
									<div className="flex justify-center">
										<div className="w-8 h-8 rounded-full bg-gray-300" />
									</div>
									<div className="text-xs my-0.5 font-medium text-gray-200 truncate rounded-full bg-gray-200">GMGMGM</div>
									<div className="text-xs rounded-full bg-gray-300 text-gray-300 ">GMGMGMGMGM</div>
								</div>
							</div>
						</li>
					))}
				</ul>
			</Transition>
		</>
	);
}
