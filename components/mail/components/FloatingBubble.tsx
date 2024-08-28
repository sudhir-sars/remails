import React, { useEffect, useState, useRef, MouseEvent } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IEmail } from './IMail';

interface IFloatingBubble {
  floatingTempMail: IEmail;
  setFloatingTempMail: (floatingTempMail: IEmail) => void;
  setReplyModuleTempMail: React.Dispatch<React.SetStateAction<IEmail>>;
  bubblePosition: { x: number; y: number };
  replyModuleTempMail: IEmail;
  setReplyModuleVisibility: React.Dispatch<React.SetStateAction<boolean>>;
  replyModuleVisibility: boolean;
  setBubblePosition: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >;
  dndReplyRef: React.RefObject<HTMLDivElement>;
}

const FloatingBubble: React.FC<IFloatingBubble> = ({
  floatingTempMail,
  setFloatingTempMail,
  replyModuleTempMail,
  setReplyModuleTempMail,
  bubblePosition,
  setReplyModuleVisibility,
  setBubblePosition,
  dndReplyRef,
  replyModuleVisibility,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const bubbleRef = useRef<HTMLDivElement>(null);
  const dragStartTime = useRef(0);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    document.body.classList.add('select-none', 'pointer-events-none');
    dragStartTime.current = Date.now();
    const containerRect = dndReplyRef.current?.getBoundingClientRect();
    if (containerRect) {
      setDragOffset({
        x: e.clientX - containerRect.left - bubblePosition.x,
        y: e.clientY - containerRect.top - bubblePosition.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dndReplyRef.current || !bubbleRef.current) return;
    const containerRect = dndReplyRef.current.getBoundingClientRect();
    const newX = Math.min(
      Math.max(0, e.clientX - containerRect.left - dragOffset.x),
      containerRect.width - bubbleRef.current.offsetWidth
    );
    const newY = Math.min(
      Math.max(0, e.clientY - containerRect.top - dragOffset.y),
      containerRect.height - bubbleRef.current.offsetHeight
    );

    if (newX !== bubblePosition.x || newY !== bubblePosition.y) {
      setBubblePosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    document.body.classList.remove('select-none', 'pointer-events-none');
    const dragEndTime = Date.now();
    const dragDuration = dragEndTime - dragStartTime.current;

    if (dragDuration < 250) {
      setReplyModuleTempMail(floatingTempMail);
      setReplyModuleVisibility(true);
    }
  };

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      requestAnimationFrame(() => handleMouseMove(e));
    };
    const handleWindowMouseUp = () => handleMouseUp();

    if (isDragging) {
      window.addEventListener('mousemove', handleWindowMouseMove as any);
      window.addEventListener('mouseup', handleWindowMouseUp);
    } else {
      window.removeEventListener('mousemove', handleWindowMouseMove as any);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove as any);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={bubbleRef}
      className="rounded-full bg-white h-12 w-12 border border-primary flex items-center justify-center text-white dark:bg-black transition-all duration-250 ease-out"
      style={{
        position: 'absolute',
        left: bubblePosition.x,
        top: bubblePosition.y,
        zIndex: 9999,
        display: replyModuleVisibility ? 'none' : 'flex',
      }}
      onClick={() => false}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-center">
        {(() => {
          const email = floatingTempMail;
          const domain =
            email.email.split('@').pop() ||
            email.reply.split('@').pop() ||
            email.name.split('@').pop() ||
            '';

          const domainParts = domain.split('.');
          const validDomain =
            domainParts.length > 1 ? domainParts.slice(-2).join('.') : null;
          return (
            <Avatar className="h-10 w-10">
              <AvatarImage
                loading="lazy"
                src={`https://logo.clearbit.com/${validDomain}`}
                alt={email.name}
                height={23}
                width={23}
                className="rounded-full"
              />
              <AvatarFallback className="w-full">
                <div className="rounded-full flex items-start gap-4 text-[0.6rem] p-1 bg-muted w-full">
                  {email.name
                    .split(' ')
                    .map((chunk) => chunk[0])
                    .join('')}
                </div>
              </AvatarFallback>
            </Avatar>
          );
        })()}
      </div>
    </div>
  );
};

export default FloatingBubble;
