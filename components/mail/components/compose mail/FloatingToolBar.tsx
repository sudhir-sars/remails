'use client';
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TiArrowSortedDown } from 'react-icons/ti';
import { MdFormatLineSpacing } from 'react-icons/md';
import { RxLetterSpacing } from 'react-icons/rx';
import { HiOutlineEye } from 'react-icons/hi2';

interface FloatingToolBar {}

const FloatingToolBar: React.FC<FloatingToolBar> = ({}) => {
  const [fontStyle, setFontStyle] = useState('Inter');
  const [fontWeight, setFontWeight] = useState('Medium');
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [LetterSpacing, setLetterSpacing] = useState(0.4);
  const [fontSize, setFontSize] = useState(14);
  const [fontColor, setFontColor] = useState('7ec4b7');
  const [opacity, setOpacity] = useState(100);
  const boxShadow =
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';

  return (
    <div className="flex flex-col space-y-7 w-full h-full">
      <span className="rounded-xl w-full shadow-md ">
        <div className="text-muted-foreground rounded-xl rounded-b-none   text-xs p-2 pl-3 font-[500] bg-white">
          Typography
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className=" text-sm w-full ">
            <span className=" w-full  flex justify-between items-center font-semibold bg-white ">
              <div className=" px-4 bg-white py-2 ">{fontStyle}</div>
              <span className="px-3">
                <TiArrowSortedDown />
              </span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className=" ">
            <DropdownMenuLabel className="w-full">Font Style</DropdownMenuLabel>
            <DropdownMenuSeparator className="w-full" />
            <DropdownMenuItem className="w-full">Profile</DropdownMenuItem>
            <DropdownMenuItem className="w-full">Billing</DropdownMenuItem>
            <DropdownMenuItem className="w-full">Team</DropdownMenuItem>
            <DropdownMenuItem className="w-full">Subscription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="flex space-x-[0.1rem]  w-full mt-[0.1rem]">
          <span className="flex flex-col space-y-[0.1rem]  w-full">
            <span className="bg-white  w-full">
              <span className="text-muted-foreground   text-xs p-2 pl-3 font-[400]">
                Weight
              </span>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger className=" text-sm w-full ">
                    <span className=" w-full  flex justify-between items-center font-semibold bg-white ">
                      <div className=" px-4 bg-white py-2 ">{fontWeight}</div>
                      <span className="px-3">
                        <TiArrowSortedDown />
                      </span>
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className=" ">
                    <DropdownMenuLabel className="w-full">
                      Font weight
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="w-full" />
                    <DropdownMenuItem className="w-full">
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="w-full">
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem className="w-full">Team</DropdownMenuItem>
                    <DropdownMenuItem className="w-full">
                      Subscription
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </span>
            <span className="bg-white  w-full rounded-b-xl rounded-br-none">
              <span className="text-muted-foreground   text-xs p-2 pl-3 font-[400]">
                Spacing
              </span>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger className=" text-sm w-full rounded-b-xl rounded-bl-none">
                    <span className=" w-full  flex justify-between items-center font-semibold bg-white rounded-b-xl ">
                      <span className="flex justify-between items-center ">
                        <span className="pl-3 text-xl ">
                          <MdFormatLineSpacing />
                        </span>
                        <div className="  bg-white py-2 px-3  ">
                          {lineSpacing}
                          <span className="text-muted-foreground"> rem </span>
                        </div>
                      </span>
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className=" ">
                    <DropdownMenuLabel className="w-full">
                      Font Spacing
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="w-full" />
                    <DropdownMenuItem className="w-full">
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="w-full">
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem className="w-full">Team</DropdownMenuItem>
                    <DropdownMenuItem className="w-full">
                      Subscription
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </span>
          </span>
          <span className="flex flex-col space-y-[0.1rem]  w-full">
            <span className="bg-white h-full w-full">
              <span className="text-muted-foreground   text-xs p-2 pl-3 font-[400]">
                Size
              </span>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger className=" text-sm w-full ">
                    <span className=" w-full  flex justify-between items-center font-semibold bg-white ">
                      <div className=" px-4 bg-white py-2 ">{fontSize}</div>
                      <span className="px-3">
                        <TiArrowSortedDown />
                      </span>
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className=" ">
                    <DropdownMenuLabel className="w-full">
                      Font Size
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="w-full" />
                    <DropdownMenuItem className="w-full">
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="w-full">
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem className="w-full">Team</DropdownMenuItem>
                    <DropdownMenuItem className="w-full">
                      Subscription
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </span>
            <span className="bg-white h-full w-full rounded-b-xl rounded-bl-none">
              <span className="text-muted-foreground   text-xs p-2 pl-3 font-[400]">
                Letter Spacing
              </span>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger className=" text-sm w-full rounded-b-xl">
                    <span className=" w-full  flex justify-between items-center font-semibold bg-white rounded-b-xl ">
                      <span className="flex justify-between items-center ">
                        <span className="pl-3 text-xl ">
                          <RxLetterSpacing />
                        </span>
                        <div className="  bg-white py-2 px-3  ">
                          {LetterSpacing}
                          <span className="text-muted-foreground"> rem </span>
                        </div>
                      </span>
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className=" ">
                    <DropdownMenuLabel className="w-full">
                      Letter Spacing
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="w-full" />
                    <DropdownMenuItem className="w-full">
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="w-full">
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem className="w-full">Team</DropdownMenuItem>
                    <DropdownMenuItem className="w-full">
                      Subscription
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </span>
          </span>
        </span>
      </span>
      <span className="rounded-xl w-full h-full shadow-md  ">
        <div className="rounded-xl rounded-b-none  text-xs p-2 pl-3 font-[500] bg-white">
          <div className="text-muted-foreground text-xs ">Fill</div>
        </div>
        <div className="w-full mt-0  flex  space-x-[0.1rem] justify-between ">
          <span className="flex px-3 py-2 items-center w-full bg-white  ">
            <div
              style={{ backgroundColor: `#${fontColor}` }}
              className={`h-5 w-5 rounded-md px-2`}
            ></div>
            <div className="px-2 pl-3 text-sm font-semibold">#{fontColor}</div>
          </span>

          <span className=" px-2 text-sm  w-full bg-white flex items-center justify-between ">
            <div className="font-semibold pl-2">{opacity}%</div>
            <div className="px-4 text-lg">
              <HiOutlineEye />
            </div>
          </span>
        </div>
        <div className="w-full mt-[0.1rem]  flex  space-x-[0.1rem] justify-between ">
          <span className="flex px-3 py-2 items-center rounded-b-xl space-x-2 w-full bg-white  ">
            <div className={`h-4 w-4 rounded-md px-2 bg-blue-500`}></div>
            <div className={`h-4 w-4 rounded-md px-2 bg-green-500`}></div>
            <div className={`h-4 w-4 rounded-md px-2 bg-yellow-500`}></div>
            <div className={`h-4 w-4 rounded-md px-2 bg-pink-500`}></div>
            <div className={`h-4 w-4 rounded-md px-2 bg-orange-500`}></div>
            <div className={`h-4 w-4 rounded-md px-2 bg-purple-500`}></div>
          </span>
        </div>
      </span>
    </div>
  );
};
export default FloatingToolBar;
