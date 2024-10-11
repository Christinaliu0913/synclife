import { Task } from "@/types/types"
import TaskListTitle from "./2_taskListTitle"
import TaskListProject from "./2_taskListProject"
import TaskListDate from "./2_taskListDate"
import { useDrag, useDrop } from "react-dnd"
import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import TaskListDescription from "./2_taskListDescription"
import TaskListDelete from "./2_taskListDelete"


interface TaskCard{
    index: number
    task: Task
    moveTask: (fromIndex: number, toIndex: number) => void
    onUpdate: (taskRef: string, updatedData: Partial<Task>,taskId: string) => void;
    onDelete: (taskRefString: string, taskId: string) => void
    onExpand: (taskId: string|null) => void;
    activeTaskId: string|null;

}

interface draggedItem{
    index: number;
    id: string
}
const ITEM_TYPE = 'TASK'//定義拖拽類型

const TaskCard:React.FC<TaskCard> = ({index, task, moveTask, onUpdate, onDelete, onExpand, activeTaskId}) => {
    const isExpanded = activeTaskId === task.id;
    //date 處理
    // const date = task.taskDate.split(5,10)
    //監聽事件
    const taskCardRef = useRef<HTMLDivElement>(null);
    //是否顯示description
    const [isNote, setIsNote] = useState(task.taskDescription !== '')
    //拖拽的時候的指示線
    const [showDropLine, setShowDropLine] = useState<'above'|'below'|null>(null);
    //拖拽
    const [{isDragging}, dragRef ] = useDrag({
        type: ITEM_TYPE,
        item: { index, id: task.id},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        })
    })
    //  放置位置
    const [{ isOver }, dropRef] = useDrop<draggedItem, void, {isOver: boolean}>({
        accept: ITEM_TYPE,
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
        hover: (draggedItem:{ index: number; id: string}, monitor) => {
            if(!taskCardRef.current) return ;
            const draggedIndex = draggedItem.index;//當拖拽項目的index
            const hoverIndex = index;//當前元素的index
        
            //如果說拽項目的index是目前元素的index,就return 
            if(draggedItem.id === task.id ||draggedIndex === hoverIndex) return 
            
            // //取得當權元素的邊界匡
            // const hoverBoundingRect = taskCardRef.current.getBoundingClientRect();
            // if(!hoverBoundingRect) return;

            // //計算當前元素的中間點
            // const hoverMiddleY = (hoverBoundingRect.bottom -hoverBoundingRect.top)/2;

            // //取得滑鼠在當權元素中的位置
            // const clientOffset = monitor.getClientOffset();
            // if(!clientOffset) return;

            // //計算滑鼠在當前元素的相對位置
            // const hoverClientY  =(clientOffset as {x: number, y: number}).y -hoverBoundingRect.top
            
            // //根據滑鼠的位置來決定指示線的位置
            // if(hoverClientY < hoverMiddleY ){
            //     setShowDropLine('above');//顯示在當前卡片上方
            // }
            // else{
            //     setShowDropLine('below')
            // }
            // //如果超過目前元素的上下邊界隱藏線
            // if(hoverClientY < 0 || hoverClientY > hoverBoundingRect.bottom - hoverBoundingRect.top ){
            //     setShowDropLine(null)
            // }
            if(draggedIndex < hoverIndex ){
                setShowDropLine('below');
            }else{
                setShowDropLine('above');
            }
            
        },
        drop: (draggedItem: {index: number}) => {
            setShowDropLine(null);
            const draggedIndex = draggedItem.index;//當拖拽項目的index
            const hoverIndex = index;//當前元素的index
            setShowDropLine(null);
            if(draggedIndex !== hoverIndex){
                moveTask(draggedIndex, hoverIndex);
                draggedItem.index = hoverIndex;
            }

            
        }
    })
    const ref = React.useRef<HTMLDivElement>(null);//讓typescript知道ref是正確的HTML元素類型
    dragRef(dropRef(taskCardRef));//結合drag和drop 的ref(將dragRef跟dropRef結合在傳遞給div的refGj3vu/4
    
    //監聽isOver狀態變化，當不在當前元素上飛時強制隱藏指示線
    useEffect(()=> {
        if(!isOver){
            setShowDropLine(null);
        }
    },[isOver])
    return (
        <>
        
            <div
                ref={taskCardRef}
                style={{
                    opacity: isDragging? 0.2 : 1,
                    cursor: 'move',
                    position:'relative'
                }}
                className='list-task'
                >
                {isExpanded?
                    <div className="list-task-draggable">
                        <Image src='/images/draggable.svg' alt='click it to drag' width={10} height={10} style={{margin: '3px'}}></Image>
                    </div> :
                    <></>
                }
                {
                    showDropLine ==='above' && showDropLine !== null ?(
                        <div className="list-task-draggableLine above">

                        </div>
                    ):
                    <></>
                }
                {
                    showDropLine ==='below' && showDropLine !== null ? (
                        <div className="list-task-draggableLine below">

                        </div>
                    ):
                    <></>
                }
                <div >
                    <div
                        key={task.id}
                        onClick={() => onExpand(task.id)}
                        className="list-taskMain"
                        >
                        
                        <TaskListTitle
                            key={`title-${task.id}`}
                            task={task}
                            onUpdate = {onUpdate}
                        />
                        

                        <TaskListProject
                            key={`project-${task.id}`}
                            task={task}
                        />
                        {!isExpanded?
                            <div className="list-taskMain-date"><p>{task.taskDate}</p></div>
                            :<div className="list-taskMain-blank"></div>
                        }
                        <TaskListDelete
                            key={`delete-${task.id}`}
                            task={task}
                            onUpdate = {onUpdate}
                            onDelete = {onDelete}
                        />
                        
                    </div>
                    {isNote && !isExpanded?
                        <div  onClick={() => onExpand(task.id)} className="list-description">{task.taskDescription} </div>
                        :
                        <></>
                    }
                    
                    
                    {isExpanded?
                        <>
                           <div
                                className="list-taskDetail"
                            >
                                <TaskListDescription
                                key={`description-${task.id}`}
                                task={task}
                                onUpdate = {onUpdate}
                                onDelete = {onDelete}
                                />
                                <TaskListDate
                                key={`date-${task.id}`}
                                task={task}
                                onUpdate = {onUpdate}
                                onDelete = {onDelete}
                            />  
                            </div> 
                        </>
                    :
                        <></>
                    }


                </div>
                
            </div>
           

            
        </>
        
    )

}

export default TaskCard;