
interface Project {
    id: string;
    uid: string;
    projectTitle: string;
    projectStatus: string;
    projectMember: string[];
    projectDateStart: string;
    projectDateEnd: string;
    projectOwner: string | undefined;
    createdAt: string;
}

interface ProjectListProps {
    project: Project;
}


const ProjectOption: React.FC<ProjectListProps> = ({project}) => {
    const title = project.projectTitle
    return (
        <>
        <option value={project.id}>{title}</option>
        </>
    )

}

export default ProjectOption;
