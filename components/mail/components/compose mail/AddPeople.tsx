import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { CiSearch } from 'react-icons/ci';
import { IoClose } from 'react-icons/io5';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface IAddPeople {
  setBccList: Dispatch<SetStateAction<Set<string>>>;
  setCcList: Dispatch<SetStateAction<Set<string>>>;
  setToList: Dispatch<SetStateAction<Set<string>>>;
  addBcc: boolean;
  addCc: boolean;
  setAddBcc: (item: boolean) => void;
  setAddCc: (item: boolean) => void;
  bccList: Set<string>;
  ccList: Set<string>;
  toList: Set<string>;
}

const AddPeople: React.FC<IAddPeople> = ({
  setBccList,
  setCcList,
  addCc,
  addBcc,
  setAddBcc,
  setAddCc,
  bccList,
  ccList,
  toList,
  setToList,
}) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      const trimmedValue = inputValue.trim();

      if (addCc) {
        setCcList(
          (prevList) => new Set([...Array.from(prevList), trimmedValue])
        );
      } else if (addBcc) {
        setBccList(
          (prevList) => new Set([...Array.from(prevList), trimmedValue])
        );
      } else {
        setToList(
          (prevList) => new Set([...Array.from(prevList), trimmedValue])
        );
      }

      setInputValue('');
    }
  };

  const handleRemove = (item: string, label: string) => {
    if (label === 'Bcc') {
      setBccList((prevList) => {
        const newSet = new Set(prevList);
        newSet.delete(item);
        return newSet;
      });
    } else if (label === 'Cc') {
      setCcList((prevList) => {
        const newSet = new Set(prevList);
        newSet.delete(item);
        return newSet;
      });
    } else if (label === 'To') {
      setToList((prevList) => {
        const newSet = new Set(prevList);
        newSet.delete(item);
        return newSet;
      });
    }
  };
  const handleAllClear = () => {
    console.log('here');
    setBccList(new Set());
    setCcList(new Set());
    setToList(new Set());
  };

  useEffect(() => {}, []);

  return (
    <div className=" w-full rounded-xl shadow-md h-[17rem] ">
      <span className="w-full flex items-center rounded-xl rounded-b-none  shadow-md    bg-white p-2">
        <span className="pr-2 pl-1 text-xl">
          <CiSearch />
        </span>
        <span className="w-full py-1 ">
          <input
            onKeyDown={handleEnterKey}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            type="text"
            placeholder="Add People..."
            className=" w-full outline-none placeholder:font-light placeholder:text-xs  font-semibold text-sm mb-[0.15rem]"
          />
        </span>

        <span className="pr-1">
          <span className="text-xs space-x-1 cursor-pointer ">
            <span
              className={`p-1 px-2 rounded-lg ${
                addCc ? ' bg-foreground text-white' : ''
              }`}
              onClick={() => {
                if (addBcc) {
                  setAddBcc(false);
                }

                setAddCc(!addCc);
              }}
            >
              Cc
            </span>
            <span
              className={`p-1 px-2 rounded-lg ${
                addBcc ? ' bg-black text-white' : ''
              }`}
              onClick={() => {
                if (addCc) {
                  setAddCc(false);
                }
                setAddBcc(!addBcc);
              }}
            >
              Bcc
            </span>
          </span>
        </span>
      </span>
      <span className="w-full flex px-2  rounded-b-xl my-[0.1rem] h-full  bg-white p-2 flex-col">
        <ScrollArea className="h-full w-full rounded-md  ">
          {Array.from(toList).map((item, index) => (
            <span className="flex my-1">
              <span className="ml-1">
                <span className="text-sm cursor-default border shadow-sm rounded-full w-auto flex flex-row pl-1 pr-1 space-x-2 items-center">
                  <span>
                    <Avatar className="w-5 h-5">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="@shadcn"
                      />
                      <AvatarFallback className="text-xs p-1">
                        CN
                      </AvatarFallback>
                    </Avatar>
                  </span>
                  <span className="my-[0.2rem] mb-[0.3rem]  ">
                    {item.length > 20
                      ? `${item.substring(0, 20)}...`
                      : `${item}`}
                  </span>
                  <span className="pr-1">
                    <IoClose
                      onClick={() => {
                        handleRemove(item, 'To');
                      }}
                      className="text-base text-white bg-gray-400 hover:bg-black rounded-full hover:text-white hover:dark:text-muted-foreground"
                    />
                  </span>
                </span>
              </span>
            </span>
          ))}
          {Array.from(ccList).map((item, index) => (
            <span className="flex  my-1">
              <span className="ml-1">
                <span className="text-sm cursor-default border shadow-sm rounded-full w-auto flex flex-row pl-1 pr-1 space-x-2 items-center">
                  <span>
                    <Avatar className="w-5 h-5">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="@shadcn"
                      />
                      <AvatarFallback className="text-xs p-1">
                        CN
                      </AvatarFallback>
                    </Avatar>
                  </span>
                  <span className="my-[0.2rem] mb-[0.3rem]  ">
                    {item.length > 20
                      ? `${item.substring(0, 20)}...`
                      : `${item}`}
                    <span className="rounded-lg px-[0.35rem] ml-2 py-[0.08rem] text-xs bg-muted border">
                      Cc
                    </span>
                  </span>
                  <span className="pr-1">
                    <IoClose
                      onClick={() => {
                        handleRemove(item, 'Cc');
                      }}
                      className="text-base text-white bg-gray-400 hover:bg-black rounded-full hover:text-white hover:dark:text-muted-foreground"
                    />
                  </span>
                </span>
              </span>
            </span>
          ))}
          {Array.from(bccList).map((item, index) => (
            <span className="flex my-1 ">
              <span className="ml-1">
                <span className="text-sm cursor-default border shadow-sm rounded-full w-auto flex flex-row pl-1 pr-1 space-x-2 items-center">
                  <span>
                    <Avatar className="w-5 h-5">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="@shadcn"
                      />
                      <AvatarFallback className="text-xs p-1">
                        CN
                      </AvatarFallback>
                    </Avatar>
                  </span>
                  <span className="my-[0.2rem] mb-[0.3rem]  ">
                    {item.length > 20
                      ? `${item.substring(0, 20)}...`
                      : `${item}`}
                    <span className="rounded-lg px-[0.35rem] ml-2 py-[0.08rem] text-xs bg-muted border">
                      Bcc
                    </span>
                  </span>
                  <span className="pr-1">
                    <IoClose
                      onClick={() => {
                        handleRemove(item, 'Bcc');
                      }}
                      className="text-base text-white bg-gray-400 hover:bg-black rounded-full hover:text-white hover:dark:text-muted-foreground"
                    />
                  </span>
                </span>
              </span>
            </span>
          ))}
        </ScrollArea>

        <span className="flex justify-end">
          <button
            onClick={handleAllClear}
            disabled={
              bccList.size === 0 && ccList.size === 0 && toList.size === 0
            }
            className={`text-xs rounded-lg border py-1 px-2 bg-muted ${
              bccList.size > 0 || ccList.size > 0 || toList.size > 0
                ? 'hover:bg-primary hover:text-white'
                : ''
            }`}
          >
            Clear All
          </button>
        </span>
      </span>
    </div>
  );
};

export default AddPeople;
