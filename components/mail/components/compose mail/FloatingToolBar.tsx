'use client';
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import colorNameList from 'color-name-list';

import { TiArrowSortedDown } from 'react-icons/ti';
import { MdFormatLineSpacing } from 'react-icons/md';
import { RxLetterSpacing } from 'react-icons/rx';
import { HiOutlineEye } from 'react-icons/hi2';

interface FloatingToolBar {
  fontStyle: string;
  fontWeight: string;
  lineSpacing: number;
  letterSpacing: number;
  fontSize: number;
  fontColor: string;
  opacity: number;
  handleToolBarButtonClick: (command: string, value?: any) => void;
}

const FloatingToolBar: React.FC<FloatingToolBar> = ({
  fontStyle,
  fontWeight,
  lineSpacing,
  letterSpacing,
  fontSize,
  fontColor,
  opacity,
  handleToolBarButtonClick,
}) => {
  // Arrays for dropdown options
  const fontStyles = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New'];
  const fontWeights = ['Normal', 'Bold', 'Light'];
  const lineSpacings = [1.0, 1.25, 1.5];
  const fontSizes = [8, 10, 12, 14, 16, 18, 30, 40, 50];
  const letterSpacings = [0.1, 0.2, 0.3];

  return (
    <div className="flex flex-col space-y-7 w-[17.5rem] m  h-full">
      <span className="rounded-xl w-full shadow-md ">
        <div className="text-muted-foreground rounded-xl rounded-b-none   text-xs p-2 pl-4 pt-3 font-medium bg-white">
          Typography
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="text-sm w-full ">
            <span className="w-full flex justify-between items-center font-semibold bg-white">
              <div className="px-4 bg-white py-2">{fontStyle}</div>
              <span className="px-3">
                <TiArrowSortedDown />
              </span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[17.2rem]">
            {fontStyles.map((style, index) => (
              <DropdownMenuItem
                key={index}
                className="w-full"
                onSelect={() => {
                  handleToolBarButtonClick('applyFontStyle', style);
                }}
              >
                {style}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="flex space-x-[0.1rem]  w-full mt-[0.1rem]">
          <span className="flex flex-col space-y-[0.1rem]  w-full">
            <span className="bg-white  w-full">
              <span className="text-muted-foreground  font-medium text-xs p-2 pl-4 ">
                Weight
              </span>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-sm w-full">
                    <span className="w-full flex justify-between items-center font-semibold bg-white">
                      <div className="px-4 bg-white py-2">{fontWeight}</div>
                      <span className="px-3">
                        <TiArrowSortedDown />
                      </span>
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="">
                    {fontWeights.map((weight, index) => (
                      <DropdownMenuItem
                        key={index}
                        className="w-full"
                        onSelect={() => {
                          handleToolBarButtonClick('applyFontWeight', weight);
                        }}
                      >
                        {weight}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </span>
            <span className="bg-white  w-full rounded-b-xl rounded-br-none">
              <span className="text-muted-foreground   text-xs p-2 pl-3 font-medium">
                Spacing
              </span>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-sm w-full rounded-b-xl rounded-bl-none">
                    <span className="w-full flex justify-between items-center font-semibold bg-white rounded-b-xl">
                      <span className="flex justify-between items-center">
                        <span className="pl-3 text-xl">
                          <MdFormatLineSpacing />
                        </span>
                        <div className="bg-white py-2 px-3">
                          {lineSpacing}
                          <span className="text-muted-foreground"> rem </span>
                        </div>
                      </span>
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {lineSpacings.map((spacing, index) => (
                      <DropdownMenuItem
                        key={index}
                        className="w-full"
                        onSelect={() => {
                          handleToolBarButtonClick('applyLineSpacing', spacing);
                        }}
                      >
                        {spacing} rem
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </span>
          </span>
          <span className="flex flex-col space-y-[0.1rem]  w-full">
            <span className="bg-white h-full w-full">
              <span className="text-muted-foreground   text-xs p-2 pl-3 font-medium">
                Size
              </span>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-sm w-full">
                    <span className="w-full flex justify-between items-center font-semibold bg-white">
                      <div className="px-4 bg-white py-2">{fontSize} px</div>
                      <span className="px-3">
                        <TiArrowSortedDown />
                      </span>
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="">
                    {fontSizes.map((size, index) => (
                      <DropdownMenuItem
                        key={index}
                        className="w-full"
                        onSelect={() => {
                          handleToolBarButtonClick('applyFontSize', size);
                        }}
                      >
                        {size}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </span>
            <span className="bg-white h-full w-full rounded-b-xl rounded-bl-none">
              <span className="text-muted-foreground   text-xs p-2 pl-3 font-medium">
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
                          {letterSpacing}
                          <span className="text-muted-foreground"> rem </span>
                        </div>
                      </span>
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className=" ">
                    {letterSpacings.map((spacing, index) => (
                      <DropdownMenuItem
                        key={index}
                        className="w-full"
                        onSelect={() => {
                          handleToolBarButtonClick(
                            'applyLetterSpacing',
                            spacing
                          );
                        }}
                      >
                        {spacing}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </span>
          </span>
        </span>
      </span>
      <span className="rounded-xl w-full shadow-md">
        <div className="text-xs p-2 pl-3 font-semibold bg-white text-muted-foreground rounded-xl rounded-b-none">
          Fill
        </div>
        <div className="flex space-x-[0.1rem] justify-between items-center w-full bg-white mt-0 ">
          {/* Color Picker */}
          <div className="flex pl-3 py-2 items-center h-[2.35rem] w-48 ">
            <div
              style={{
                backgroundColor: `#${fontColor}`,
                boxShadow: `0px 4px 6px #${fontColor}80, 0px -4px 6px #${fontColor}80, 4px 0px 6px #${fontColor}80, -4px 0px 6px #${fontColor}80`,
              }}
              className={`h-5 w-5 rounded-md px-2 `}
            ></div>
            <div className="px-2 pl-3 text-sm font-semibold">#{fontColor}</div>
          </div>

          <Separator orientation="vertical" className="h-6 w-[0.1rem]" />
          <div className="pr-[0.75rem] text-sm w-full bg-white flex h-[2.35rem] items-center justify-between ">
            <div className="flex items-center w-full">
              <div className="px-2 text-lg">
                <HiOutlineEye style={{ opacity: `${opacity / 100}` }} />
              </div>
              <div className="">
                <Slider
                  min={40}
                  max={100}
                  value={[opacity]}
                  onValueChange={(newValue) =>
                    handleToolBarButtonClick('applyOpacity', newValue[0])
                  }
                  className="w-20 cursor-grab"
                />
              </div>
            </div>
            <div className="font-semibold mb-[0.1rem] ">{opacity}%</div>
          </div>
        </div>
        <div className="w-full mt-[0.1rem]  flex  space-x-[0.1rem] justify-between ">
          <span className="flex px-3 py-2 items-center rounded-b-xl space-x-2 w-full bg-white  ">
            <div
              className="h-4 w-4 rounded-sm shadow-md shadow-blue-400 px-2 bg-blue-400"
              onClick={() => {
                handleToolBarButtonClick('applyFontColor', '63a4ff');
              }}
            ></div>
            <div
              className="h-4 w-4 rounded-sm shadow-md shadow-green-400 px-2 bg-green-400"
              onClick={() => {
                handleToolBarButtonClick('applyFontColor', '4edda0');
              }}
            ></div>
            <div
              className="h-4 w-4 rounded-sm shadow-md shadow-yellow-400 px-2 bg-yellow-400"
              onClick={() => {
                handleToolBarButtonClick('applyFontColor', 'ffdb4d');
              }}
            ></div>
            <div
              className="h-4 w-4 rounded-sm shadow-md shadow-pink-400 px-2 bg-pink-400"
              onClick={() => {
                handleToolBarButtonClick('applyFontColor', 'f48fb1');
              }}
            ></div>
            <div
              className="h-4 w-4 rounded-sm shadow-md shadow-orange-400 px-2 bg-orange-400"
              onClick={() => {
                handleToolBarButtonClick('applyFontColor', 'ffab73');
              }}
            ></div>
            <div
              className="h-4 w-4 rounded-sm shadow-md shadow-purple-400 px-2 bg-purple-400"
              onClick={() => {
                handleToolBarButtonClick('applyFontColor', 'b794f4');
              }}
            ></div>
            <div
              className="h-4 w-4 rounded-sm shadow-md shadow-black px-2 bg-black"
              onClick={() => {
                handleToolBarButtonClick('applyFontColor', '000000');
              }}
            ></div>
          </span>
        </div>
      </span>
    </div>
  );
};
export default FloatingToolBar;
