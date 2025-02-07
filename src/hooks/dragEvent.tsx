 export const dragEvent = useRef<{
    newEvent: Event;
    startX: number;
    initialCell: DOMRect;
  } | null>(null);