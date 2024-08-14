

const TaskBlock = () => {

    return(
        <div className="task">
            <div>
                
                <input type="text" placeholder="title"/>
            </div>

            <label htmlFor="status">Status</label>
            <select name="" id="">
                <option value="">unstarted</option>
            </select>
            <div>
                <label htmlFor="taskDate">Date</label>
                <input type="date" />
            </div>
            <div>
                {/* asign這邊應該要在加入一個組件 */}
            </div>
            <div>
                <label htmlFor="description">Note</label>
                <input type="text" placeholder="Note"/>
            </div>
        </div>
    )
}

export default TaskBlock;