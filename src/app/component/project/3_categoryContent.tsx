import TaskBlock from "./4_taskBlock";

const CategoryContent = () => {


    return (
        <div className="project-content-category">
            <div> <input type="text" placeholder="title"/></div>
            <button><img src="/images/add.png" alt="" />Add Task</button>
            <TaskBlock/>

        </div>
    )



}

export default CategoryContent;