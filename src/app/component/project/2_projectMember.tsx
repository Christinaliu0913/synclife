"use client"
import { useState } from 'react';
import { FC } from 'react';

interface MemberListProps {
    member: string;
    OnDelete: () => void;
}
const MemberListTest: FC<MemberListProps> = ({member,OnDelete}) => {
 


    return (
        <>
                <div>
                    <div className='project-memberList-member'>{member}<button onClick={OnDelete}>X</button></div>
                </div>   
        </>
        

    )

}

export default MemberListTest; 