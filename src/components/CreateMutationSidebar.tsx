
import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XIcon } from '@heroicons/react/outline'
import { LinkIcon, PlusSmIcon, QuestionMarkCircleIcon } from '@heroicons/react/solid'
import { Switch } from '@headlessui/react'
import { useInputState } from '../utils/hooks/hooks';
import GradientAvatar from "./GradientAvatar";
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

interface VaultProps {
  name: string;
  type: "Maker" | "Taker";
  tokenMintAddress?: string;
  setTokenMintAddress?: (e) => void;
  handleTokenMintAddressChange?: (e: any) => void;
  amountPerUse: number;
  setAmountPerUse: (e) => void;
  handleAmountPerUseChange: (e: any) => void;
  totalFunding: number;
  setTotalFunding: (e) => void;
  handleTotalFundingChange: (e: any) => void;
  setBank?: () => void;
  openBank?: () => void;

}
export function Vault({name, type, tokenMintAddress, setTokenMintAddress, handleTokenMintAddressChange, amountPerUse, handleAmountPerUseChange, totalFunding, setTotalFunding, handleTotalFundingChange, setBank, openBank, setAmountPerUse}: VaultProps) {


  
    function formatPublickey(publicKey: string, ): string {
      const length = publicKey.length;

      return publicKey.substring(0,5) + ".." + publicKey.substring(length, length -5);
    }
  return (
      
             <div className="space-y-3 py-5">
             <label
          htmlFor="project-name"
          className="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2 px-4  sm:px-6"
        >
          {type} Vault 
        </label>
          <div className="px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6">
      <div>
        <label
          htmlFor="project-name"
          className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
        >
         {type === "Maker" ? "Token Mint Address" : "Bank Config"}
        </label>
      </div>
      <div className="sm:col-span-2">
        {type === "Maker" ? (
                  <input
                  value={tokenMintAddress}
                  onChange={(e) => {
                    handleTokenMintAddressChange(e);
                  }}
                  onPaste={(e) => {
                    const pastedText = e.clipboardData.getData("Text");
                    setTokenMintAddress(pastedText);
                    e.preventDefault();
                  }}
                  onCut={(e: any) => {
                    setTokenMintAddress(e.target.value);
                  }}
                  type="text"
                  name="project-name"
                  id="project-name"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
        ) : ( 
        
        
        <div className="flex items-center hover:opacity-75 transition-all duration-150 ease-in text-sm font-medium text-gray-700 sm:pt-2 cursor-pointer" onClick={()=> {setBank(); openBank()}}>
<GradientAvatar width={7} height={7} hash={name}/>
<span className="pl-2">{formatPublickey(name)}</span>
          </div>
        
       )}

       
      </div>
    </div>
    {type === "Maker" && (
          <div className=" px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6">
      <div>
        <label
          htmlFor="project-name"
          className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
        >
          Total Funding
        </label>
      </div>
      <div className="sm:col-span-2">
        <input
             value={totalFunding}
             onChange={(e) => {
              handleTotalFundingChange(e);
             }}
             onPaste={(e) => {
               const pastedText = e.clipboardData.getData("Text");
               setTotalFunding(pastedText);
               e.preventDefault(); 
             }}
             onCut={(e: any) => {
              setTotalFunding(e.target.value);
            }}
          type="number"
          name="project-name"
          id="project-name"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
    </div>
       )}
 
          <div className="px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6">
      <div>
        <label
          htmlFor="project-name"
          className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
        >
          Amount per use
        </label>
      </div>
      <div className="sm:col-span-2">
        <input
              value={amountPerUse}
              onChange={(e) => {
                handleAmountPerUseChange(e);
              }}
              onPaste={(e) => {
                const pastedText = e.clipboardData.getData("Text");
                setAmountPerUse(pastedText);
                e.preventDefault(); 
              }}
              type="number"
          name="project-name"
          id="project-name"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
  
    </div>

        {/* Vault Action */}

        {type === "Taker" && (


        <fieldset>
                        <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                          <div>
                            <legend className="text-sm font-medium text-gray-700">Escrow Account Action</legend>
                          </div>
                          <div className="space-y-5 sm:col-span-2">
                            <div className="space-y-5 sm:mt-0">
                              <div className="relative flex items-start">
                                <div className="absolute flex h-5 items-center">
                                  <input
                                    id="public-access"
                                    name="privacy"
                                    aria-describedby="public-access-description"
                                    type="radio"
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    defaultChecked
                                  />
                                </div>
                                <div className="pl-7 text-sm">
                                  <label htmlFor="public-access" className="font-medium text-gray-900">
                                    Do nothing
                                  </label>
                                  <p id="public-access-description" className="text-gray-500">
                                    Omits this property
                                  </p>
                                </div>
                              </div>
                              <div className="relative flex items-start">
                                <div className="absolute flex h-5 items-center">
                                  <input
                                    id="restricted-access"
                                    name="privacy"
                                    aria-describedby="restricted-access-description"
                                    type="radio"
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                </div>
                                <div className="pl-7 text-sm">
                                  <label htmlFor="restricted-access" className="font-medium text-gray-900">
                                    Lock
                                  </label>
                                  <p id="restricted-access-description" className="text-gray-500">
                                    Locks the tokens, deposited by the taker.
                                  </p>
                                </div>
                              </div>
                              <div className="relative flex items-start">
                                <div className="absolute flex h-5 items-center">
                                  <input
                                    id="private-access"
                                    name="privacy"
                                    aria-describedby="private-access-description"
                                    type="radio"
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                </div>
                                <div className="pl-7 text-sm">
                                  <label htmlFor="private-access" className="font-medium text-gray-900">
                                    Change Owner
                                  </label>
                                  <p id="private-access-description" className="text-gray-500">
                                    Lets you reassign the tokens, deposited by the taker, to yourself
                                  </p>
                                </div>
                              </div>
                            </div>
                            {/* <hr className="border-gray-200" /> */}

                          </div>
                        </div>
                      </fieldset>
        )}

    </div>
  )
}

interface ToggleSwitchProps {
  enabled: boolean;
  toggleSwitch: (switched) => void;
}
export function ToggleSwitch({ enabled, toggleSwitch }: ToggleSwitchProps) {


  return (
    <Switch
      checked={enabled}
      onChange={toggleSwitch}
      className={classNames(
        enabled ? 'bg-indigo-600' : 'bg-gray-200',
        'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
      )}
    >
      <span className="sr-only">Use setting</span>
      <span
        className={classNames(
          enabled ? 'translate-x-5' : 'translate-x-0',
          'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
        )}
      >
        <span
          className={classNames(
            enabled ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200',
            'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
          )}
          aria-hidden="true"
        >
          <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
            <path
              d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span
          className={classNames(
            enabled ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100',
            'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
          )}
          aria-hidden="true"
        >
          <svg className="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
            <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
          </svg>
        </span>
      </span>
    </Switch>
  )
}
interface CreateMutationSidebarProps {
  open: boolean;
  toggleState: () => void;
  banks: string[];
  setBank: (bank: string) => void;
  openBank: () => void;
}


export default function CreateMutationSidebar({ open, toggleState, banks, setBank, openBank}: CreateMutationSidebarProps) {

  const [enabled, setEnabled] = useState(false);
  //form
  const [name, handleNameChange, setName, resetName] = useInputState("");
  const [usages, handleUsageChange, setUsages, resetUsages] = useInputState(0);
  const [mutationDuration, handleMutationDurationChange, setMutationDuration, resetMutationDuration] = useInputState(0);
  const [executionPrice, handleExecutionPriceChange, setExecutionPrice, resetExecutionPrice] = useInputState(0);
  const [reversePrice, handleReversePriceChange, setReversePrice, resetReversePrice] = useInputState(0);

  //maker vaults
  const [makerATokenAddress, handleMakerATokenAddressChange, setMakerATokenAddress, resetMakerATokenAddress] = useInputState("");
  const [makerAAmountPerUse, handleMakerAAmountPerUseChange, setMakerAAmountPerUse, resetMakerAAmountPerUse] = useInputState(0);
  const [makerATotalFunding, handleMakerATotalFundingChange, setMakerATotalFunding, resetMakerATotalFunding] = useInputState(0);



  const vaults = ["a", "b", "c"]

  function toggleSwitch() {

    if (!enabled) {
      setEnabled(true);
    } else {
      setEnabled(false);
    }



  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 overflow-hidden" onClose={toggleState}>
        <div className="absolute inset-0 overflow-hidden">
          <Dialog.Overlay className="absolute inset-0" />

          <div className="pointer-events-none fixed inset-y-0 right-0 flex  pl-10 sm:pl-16">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="pointer-events-auto w-screen max-w-2xl">
                <form className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="bg-gray-50 px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between space-x-3">
                        <div className="space-y-1">
                          <Dialog.Title className="text-lg font-medium text-gray-900">New Mutation</Dialog.Title>
                          <p className="text-sm text-gray-500">
                            Get started by filling in the information below to create your new Mutation.
                          </p>
                        </div>
                        <div className="flex h-7 items-center">
                          <button
                            type="button"
                            className="text-gray-400 hover:text-gray-500"
                            onClick={toggleState}
                          >
                            <span className="sr-only">Close panel</span>
                            <XIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Divider container */}
                    <div className="space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0 text-gray-900" >
                      {/* Project name */}
                      <div className="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div>
                          <label
                            htmlFor="mutation_name"
                            className="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2"
                          >
                            Mutation Name
                          </label>
                        </div>
                        <div className="sm:col-span-2">
                          <input
                          value={name}
                          onChange={(e) => {
                            handleNameChange(e);
                          }}
                          onPaste={(e) => {
                            const pastedText = e.clipboardData.getData("Text");
                            setName(pastedText);
                            e.preventDefault();
                          }}
                          onCut={(e: any) => {
                            setName(e.target.value);
                          }}
                            type="text"
                            name="mutation_name"
                            id="mutation_name"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>

    {/* Mutation Duration */}
    <div className="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5 items-center">
                        <div>
                          <label
                            htmlFor="mutation_name"
                            className="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2"
                          >
                            Number of Usages
                          </label>
                          <p id="private-access-description" className="text-gray-500 text-sm mt-1">
                            Specify how many times the mutation can be used.
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="number"
                            value={usages}
                            onChange={(e) => {
                              handleUsageChange(e);
                            }}
                            onPaste={(e) => {
                              const pastedText = e.clipboardData.getData("Text");
                              setUsages(pastedText);
                              e.preventDefault();
                            }}
                            onCut={(e: any) => {
                              setUsages(e.target.value);
                            }}
                            name="mutation_name"
                            id="mutation_name"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                          />
                        </div>
                      </div>

                  

                      {/* Mutation Duration */}
                      <div className="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5 items-center">
                        <div>
                          <label
                            htmlFor="mutation_duration"
                            className="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2"
                          >
                            Mutation Duration
                          </label>
                          <p id="private-access-description" className="text-gray-500 text-sm mt-1">
                            Specify the duration of the mutation execution, in seconds.
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <input
                                  value={mutationDuration}
                                  onChange={(e) => {
                                    handleMutationDurationChange(e);
                                  }}
                                  onPaste={(e) => {
                                    const pastedText = e.clipboardData.getData("Text");
                                    setMutationDuration(pastedText);
                                    e.preventDefault();
                                  }}
                                  onCut={(e: any) => {
                                    setMutationDuration(e.target.value);
                                  }}
                            type="number"
                            name="mutation_duration"
                            id="mutation_duration"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                          />
                        </div>
                      </div>
                      <div className={`space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5 items-center transition-all duration-150 ease-in `}>
                          <div>
                            <label
                              htmlFor="mutation_execution_price"
                              className="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2"
                            >
                             Execution Price
                            </label>
                            <p id="private-access-description" className="text-gray-500 text-sm mt-1">
                              Specify the price in SOL, a taker has to pay when executing a mutation.
                            </p>
                          </div>
                          <div className="sm:col-span-2">
                            <div>

                              <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <img src="/images/solana.png" className="w-4 h-4" alt="solana_logo" />
                                </div>
                                <input
    
                                  value={executionPrice}
                                  onChange={(e) => {
                                    handleExecutionPriceChange(e);
                                  }}
                                  onPaste={(e) => {
                                    const pastedText = e.clipboardData.getData("Text");
                                    handleExecutionPriceChange(pastedText);
                                    e.preventDefault();
                                  }}
                                  onCut={(e: any) => {
                                    setExecutionPrice(e.target.value);
                                  }}
                                  type="number"
                                  name="price"
                                  id="price"
                                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 pr-12 sm:text-sm border-gray-300 rounded-md"
                                  placeholder="0.00"
                                  aria-describedby="price-currency"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">



                                </div>
                              </div>
                            </div>
                          </div>
                        </div>


                      {/* Mutation Reversal */}
                      <div className="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5 items-center">
                        <div>
                          <label
                            htmlFor="project-name"
                            className="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2"
                          >
                            Reverse Mutations
                          </label>
                          <p id="private-access-description" className="text-gray-500 text-sm mt-1">
                            Allowing this, lets the taker reverse the mutation, transfering back the deposited & received tokens.
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <ToggleSwitch enabled={enabled} toggleSwitch={() => { toggleSwitch() }} />
                        </div>
                      </div>

                      {/* Reversal Lamport Button */}
        
                        <div className={`space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5 items-center ${!enabled && "opacity-50"} transition-all duration-150 ease-in `}>
                          <div>
                            <label
                              htmlFor="mutation_reverse_price"
                              className="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2"
                            >
                              Reverse Price
                            </label>
                            <p id="private-access-description" className="text-gray-500 text-sm mt-1">
                              Specify the price in SOL, a taker has to pay when reverting a mutation.
                            </p>
                          </div>
                          <div className="sm:col-span-2">
                            <div>

                              <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <img src="/images/solana.png" className="w-4 h-4" alt="solana_logo" />
                                </div>
                                <input
                                  disabled={!enabled}
                                  value={reversePrice}
                                  onChange={(e) => {
                                    handleReversePriceChange(e);
                                  }}
                                  onPaste={(e) => {
                                    const pastedText = e.clipboardData.getData("Text");
                                    setReversePrice(pastedText);
                                    e.preventDefault();
                                  }}
                                  onCut={(e: any) => {
                                    setReversePrice(e.target.value);
                                  }}
                                  type="text"
                                  name="price"
                                  id="price"
                                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 pr-12 sm:text-sm border-gray-300 rounded-md"
                                  placeholder="0.00"
                                  aria-describedby="price-currency"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">



                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                   
                              {/* Maker Vaults */}
        <div className="space-y-1 px-4  sm:px-6 sm:py-5 items-center">
                        <div>
                          <label
                            htmlFor="project-name"
                            className="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2"
                          >
                            Maker Vaults
                          </label>
                          <p id="private-access-description" className="text-gray-500 text-sm mt-1">
                           Top up to three maker vaults with different tokens. The amount per use specifies how many tokens are transferred to the taker on a successful execution of the respective mutation.
                          </p>
                        </div>
                        <Vault 
                        name={"A"}
                        type="Maker"
                        tokenMintAddress={makerATokenAddress}
                        handleTokenMintAddressChange={handleMakerATokenAddressChange}
                        setTokenMintAddress={handleMakerATokenAddressChange}
                        amountPerUse={makerAAmountPerUse}
                        setAmountPerUse={setMakerAAmountPerUse}
                        handleAmountPerUseChange={handleMakerAAmountPerUseChange}
                        totalFunding={makerATotalFunding}
                        setTotalFunding={setMakerATotalFunding}
                        handleTotalFundingChange={handleMakerATotalFundingChange}
                        
                        />
                        {/* {vaults.map(vault => 
                          <Vault name={vault} type="Maker"/>
                        )} */}
                          
                      </div>

                       {/* Taker Vaults */}
        <div className="space-y-1 px-4  sm:px-6 sm:py-5 items-center">
                        <div>
                          <label
                            htmlFor="project-name"
                            className="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2"
                          >
                            Taker Vaults
                          </label>
                          <p id="private-access-description" className="text-gray-500 text-sm mt-1">
                           Top up to three maker vaults with different tokens. The amount per use specifies how many tokens are transferred to the taker on a successful execution of the respective mutation.
                          </p>
                        </div>
                        {banks.map(vault => 
                          <Vault name={vault} type="Taker" openBank={openBank} setBank={() => { setBank(vault)}}/>
                        )}
                          
                      </div>
                   {/**mint */}
                  {/* Action buttons */}
                  <div className="flex-shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6">
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={toggleState}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                    </div>
                  </div>



                </form>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
