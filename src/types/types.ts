

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
    order: number;
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
    projectOrder: number|null;
}

export interface Event {
    title: string;
    id: string|null;
    start: string | { date: string } | { dateTime: string, timeZone: string };
    end: string | { date: string } | { dateTime: string, timeZone: string };
    checkAllDay: boolean;
    calendar: string;
    description: string;
    newProject: string|null;
}

export interface EventTask {
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
    allDay: boolean;
    backgroundColor: string;
    taskType: string;
    calendarType: string;
    completed: boolean;
}