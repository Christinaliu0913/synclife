 "use client"
import { useState } from 'react';

const MemberList = ({member,OnDelete}) => {
    //視窗是否出現
    //key, member, setShowMemberInput, onAddMember
    //新增project成員
    
    //新增新的會員
 

    return (
        <div className='test'>
            <div>{member}</div>
            <button onClick={OnDelete}>X</button>
        </div>

    )

}

export default MemberList; 