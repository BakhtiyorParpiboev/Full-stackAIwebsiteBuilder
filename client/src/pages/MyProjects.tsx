import { useEffect, useState } from 'react'
import type { Project } from '../types';
import { Loader2Icon, PlusIcon, TrashIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/configs/axios';
import { toast } from 'sonner';
import Footer from '../components/Footer';

const MyProjects = () => {
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const navigate = useNavigate();

  // Backend integration (fetchProjects + deleteProject) added via Kiro CLI.
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ projects: Project[] }>('/api/user/projects');
      setProjects(data.projects ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  const deleteProject = async (projectId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this project? This cannot be undone.');
    if (!confirmed) return;
    try {
      setDeletingId(projectId);
      const { data } = await api.delete(`/api/project/${projectId}`);
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
      toast.success(data.message || 'Project deleted successfully.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setDeletingId(null);
    }
  }

    useEffect(() => {
        fetchProjects()
    }, [])

    return (
      <>
        <div className="px-4 md:px-16 lg:px-24 xl:px-32">
          {loading ? (
            <div className="flex items-center justify-center h-[80vh]">
              <Loader2Icon className="size-7 animate-spin text-indigo-2" />
            </div>
          ) : projects.length > 0 ? (
            <div className="py-10 min-h-[80hv]">
              <div className="flex justify-between items-center mb-12">
                <h1 className="text-white font-medium text-2xl">My Projects</h1>
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 text-white px-3 sm:px-6 py-1 sm:py-2 rounded bg-gradient-to-br from-indigo-500 to-indigo-600 hover:opacity-90 active:scale-95 transition-all"
                >
                  <PlusIcon size={18} /> Create New
                </button>
              </div>
              <div className="flex flex-wrap gap-3.5">
                {projects.map((project) => (
                  <div onClick={()=>navigate(`/projects/${project.id}`)}
                    key={project.id}
                    className="relative group w-72
                    max-sm:mx-auto cursor-pointer bg-gray-900/60 border
                    border-gray-700 rounded-lg overflow-hidden shadow-md group
                    hover:shadow-indigo-700/30 hover:border-indigo-800/80
                    transition-all duration-300"
                  >
                    {/* Desktop-like Mini Preview */}
                    <div
                      className="relative w-full h-40 bg-gray-900
                      overflow-hidden border-b border-gray-800"
                    >
                      {project.current_code ? (
                        <iframe
                          srcDoc={project.current_code}
                          className="absolute top-0 left-0 w-[1200px] h-[800px] 
                            origin-top-left pointer-events-none"
                          sandbox="allow-scripts allow-same-origin"
                          style={{ transform: "scale(0.25" }}
                        />
                      ) : (
                        <div
                          className="flex justify-items items-center
                            h-full text-gray-500"
                        >
                          <p>No Preview</p>
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div
                      className="p-4 text-white bg-linear-180
                      from-transparent group-hover:from-indigo-950
                      to-transparent transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <h2
                          className="text-lg font-medium
                          line-clamp-2"
                        >
                          {project.name}
                        </h2>
                        <button
                          className="px-2.5 py-0.5 mt-1 ml-2 rounded-lg
                          text-xs bg-gray-800 border border-gray-700"
                        >
                          Website
                        </button>
                      </div>
                      <p
                        className="text-gray-400 mt-1 text-sm
                        line-clamp-2 "
                      >
                        {project.initial_prompt}
                      </p>

                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex justify-between items-center mt-6"
                      >
                        <span className="text-xs text-gray-500">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-3 text-white text-sm">
                          <button
                            onClick={() => navigate(`/preview/${project.id}`)}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md
                            transition-all"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => navigate(`/projects/${project.id}`)}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md
                            transition-all"
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      {deletingId === project.id ? (
                        <Loader2Icon className='absolute top-3 right-3
                  bg-white p-1.5 size-7 rounded text-red-500
                  animate-spin' />
                      ) : (
                        <TrashIcon className='absolute top-3 right-3
                  scale-0 group-hover:scale-100 bg-white p-1.5 size-7 
                  rounded text-red-500 text-xl cursor-pointer
                  transition-all' onClick={()=>deleteProject(project.id)}/>
                      )}
                    </div>
                </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[80vh]">
              <h1 className="text-3xl font-semibold text-gray-300">
                You have no projects yet!
              </h1>
              <button
                onClick={() => navigate("/")}
                className="active:scale-95 transition-all text-white px-5 py-2 mt-5 
              bg-indigo-500 hover:bg-indigo-600 rounded-md"
              >
                Create New
              </button>
            </div>
          )}
        <Footer />
        </div>
      </>
    );
}

export default MyProjects