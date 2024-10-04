

"use client"

import dynamic from "next/dynamic";
import DragDrop from "@/app/component/dragAndDrop/drugAndDrop";
import "../test/test.scss";
import { DndProvider} from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DragDropContext } from "react-beautiful-dnd";

const test = () => {
  return (

    <>
     <DndProvider backend={HTML5Backend}>
        <div>
            <DragDrop/>
        </div>
      </DndProvider>
   </>
  ); 
};

export default test;