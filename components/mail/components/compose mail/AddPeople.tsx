import React, { Dispatch, SetStateAction, useState } from 'react';
import { CiSearch } from 'react-icons/ci';
import { IoClose } from 'react-icons/io5';
import { Separator } from '@/components/ui/separator';
interface IAddPeople {
  setBccList: Dispatch<SetStateAction<string[]>>;
  setCcList: Dispatch<SetStateAction<string[]>>;
}

const AddPeople: React.FC<IAddPeople> = ({ setBccList, setCcList }) => {
  const [inputValue, setInputValue] = useState<string>('');

  return (
    <div className="h-full w-full ">
      <span className="w-full flex items-center rounded-xl rounded-b-none  bg-white p-2">
        <span className="pr-2 pl-1 text-xl">
          <CiSearch />
        </span>
        <span className="w-full py-1 ">
          <input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            type="text"
            className=" w-full outline-none   font-semibold text-sm mb-[0.15rem]"
          />
        </span>

        <span className="pr-1">
          <IoClose
            onClick={() => {
              setInputValue('');
            }}
            className="text-sm text-white bg-gray-400 hover:bg-black rounded-full hover:text-white hover:dark:text-muted-foreground"
          />
        </span>
      </span>
      <span className="w-full flex items-center rounded-b-xl my-[0.1rem] h-[82.5%]  bg-white p-2"></span>
    </div>
  );
};

export default AddPeople;
