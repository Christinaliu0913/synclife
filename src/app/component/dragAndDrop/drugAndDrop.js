

import { useState } from 'react'
import Picture from './picture'
import { useDrop } from 'react-dnd';

const PictureList = [
    {
        id:1, 
        url:'/images/logo-text.svg'
    },
    {
        id:2, 
        url:'/images/delete.svg'
    },{
        id:3, 
        url:'/images/google.png'
    }
]

function DragDrop(){
    const [board,setBoard] = useState([]);
    const [{ isOver }, drop] = useDrop(() => ({
        accept: "image",
        drop: (item) => addImageToBoard(item.id),
        collect: (monitor) => ({
          isOver: !!monitor.isOver(),
        })
    }));
    
    const addImageToBoard = (id) => {
        const picture = PictureList.find((pic) => pic.id === id);
        if (picture && !board.includes(picture)) {
          setBoard((board) => [...board, picture]);
        }
      };
    return (
        <>
            <div className="A"> 
                {PictureList.map((picture)=>{
                    return <Picture key={picture.id} url={picture.url}  id={picture.id}></Picture>
                })}
            </div>
            <div ref={drop} className='B' style={{border:"1px black solid", height:'30px',width: '300px'}}>
                {board.map((picture,index)=>{
                    return <Picture key={index} id={picture.id} url={picture.url} />
                })}
            </div>

        </>
    )
}

export default DragDrop;