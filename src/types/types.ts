

export interface Task {
    id: string;
    taskTitle: string;
    taskStatus: string;
    taskAssign: string[]|[];
    taskNotAssign: string[]|[];
    taskDate: string;
    taskDescription: string;
    taskOwner: string | null;
    calendarId: string;
    categoryId: string;
    projectId: string;
    projectTitle: string;
    createdAt: string;  
}

export interface Category {
    id: string;
    uid: string;
    categoryTitle: string;
    createAt: string;
    projectId: string;
}



export interface Project {
    id: string;
    uid: string;
    projectTitle: string;
    projectColor: string;
    projectStatus: string;
    projectMember: string[];
    projectDateStart: string;
    projectDateEnd: string;
    projectOwner: string | undefined;
    createdAt: string;
}