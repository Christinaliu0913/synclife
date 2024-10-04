import Image from "next/image"
import { useDrag } from 'react-dnd';

function Picture ({url,id}){
    const [{isDragging}, drag] = useDrag(()=>({
        type: "image",
        item: {id},
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),

    })
);
    return <Image ref={drag} src={url} alt="logo" width={70} height={70} style = {{border: isDragging? "5px solid pink":'0px'}}></Image>
}

export default Picture;